// Fix: Implemented a full-featured Admin Dashboard component.
import React, { useState, useEffect, FormEvent } from 'react';
import { db } from '../firebase';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    setDoc, 
    addDoc, 
    deleteDoc, 
    updateDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { Profile, Skill, Project, ContactMessage } from '../types';
import { uploadToCloudinary, isCloudinaryConfigured } from '../cloudinary';

const glassPanelClasses = "bg-surface/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-white/20 dark:border-dark-outline-variant/20";
const inputClasses = "mt-1 block w-full bg-black/5 dark:bg-white/5 border-outline/50 dark:border-dark-outline/50 rounded-lg border py-2 px-3 text-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-primary/50 dark:focus:ring-dark-primary/50 transition-all duration-300";
const buttonClasses = "bg-primary dark:bg-dark-primary hover:bg-primary/90 dark:hover:bg-dark-primary/90 text-on-primary dark:text-dark-on-primary font-bold py-2 px-4 rounded-full disabled:opacity-50 transition-all active:animate-click-bounce";
const secondaryButtonClasses = "bg-tertiary-container dark:bg-dark-tertiary-container hover:bg-tertiary-container/80 dark:hover:bg-dark-tertiary-container/80 text-on-tertiary-container dark:text-dark-on-tertiary-container font-bold py-2 px-4 rounded-full transition-all active:animate-click-bounce";
const deleteButtonClasses = "font-medium px-3 py-1 rounded-full text-on-error-container bg-error-container/50 hover:bg-error-container/80 transition-all active:animate-click-bounce";

// Profile Management Component
const ProfileManager: React.FC = () => {
    const [profile, setProfile] = useState<Profile>({ name: '', title: '', bio: '', profileImageUrl: '', githubUrl: '', linkedinUrl: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const docRef = doc(db, 'profile', 'main');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data() as Profile);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const profileDataToSave = { ...profile };
            if (imageFile) {
                const imageUrl = await uploadToCloudinary(imageFile);
                profileDataToSave.profileImageUrl = imageUrl;
            }
            const docRef = doc(db, 'profile', 'main');
            await setDoc(docRef, profileDataToSave, { merge: true }); // Use merge to avoid overwriting fields if they don't exist
            setProfile(profileDataToSave);
            setImageFile(null);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile: ", error);
            alert(`Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    if (loading) return <p>Loading Profile...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Manage Profile</h2>
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleChange} className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium">Title</label>
                <input type="text" name="title" value={profile.title} onChange={handleChange} className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium">GitHub URL</label>
                <input type="url" name="githubUrl" value={profile.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/your-username" className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium">LinkedIn URL</label>
                <input type="url" name="linkedinUrl" value={profile.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/your-profile" className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium">Profile Image</label>
                <div className="mt-2 flex items-center gap-4">
                    {imageFile ? (
                        <img src={URL.createObjectURL(imageFile)} alt="New Profile Preview" className="w-24 h-24 rounded-full object-cover"/>
                    ) : (
                        profile.profileImageUrl && <img src={profile.profileImageUrl} alt="Current Profile" className="w-24 h-24 rounded-full object-cover"/>
                    )}
                    <div className="flex-1">
                        <input type="file" accept="image/*" disabled={!isCloudinaryConfigured} onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 disabled:opacity-50 disabled:cursor-not-allowed`} />
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">Upload a new image to replace the current one.</p>
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} rows={5} className={inputClasses} />
            </div>
            <button type="submit" disabled={saving || !isCloudinaryConfigured && !!imageFile} className={buttonClasses}>
                {saving ? 'Saving...' : 'Save Profile'}
            </button>
        </form>
    );
};

// Skills Management Component
const SkillsManager: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);

    const fetchSkills = async () => {
        setPendingDelete(null);
        const querySnapshot = await getDocs(collection(db, 'skills'));
        setSkills(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill)));
        setLoading(false);
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleAddSkill = async (e: FormEvent) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        try {
            await addDoc(collection(db, 'skills'), { name: newSkill });
            setNewSkill('');
            fetchSkills(); // Refresh list
        } catch (error) {
            console.error("Error adding skill: ", error);
            alert('Failed to add skill.');
        }
    };

    const handleConfirmDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'skills', id));
            fetchSkills(); // Refresh list
        } catch (error) {
            console.error("Error deleting skill: ", error);
            alert('Failed to delete skill. Please try again.');
        }
    };

    if (loading) return <p>Loading Skills...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Skills</h2>
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="New skill name" className={`flex-grow ${inputClasses}`} />
                <button type="submit" className={buttonClasses}>Add</button>
            </form>
            <ul className="space-y-2">
                {skills.map(skill => (
                    <li key={skill.id} className="flex justify-between items-center bg-secondary-container/30 dark:bg-dark-secondary-container/30 p-3 rounded-lg">
                        <span>{skill.name}</span>
                        {pendingDelete === skill.id ? (
                            <div className="flex gap-2 items-center animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                                <span className="text-sm">Are you sure?</span>
                                <button onClick={() => handleConfirmDelete(skill.id)} className="font-medium px-3 py-1 rounded-full text-on-error-container bg-error-container hover:bg-error-container/80 transition-all active:animate-click-bounce">Yes</button>
                                <button onClick={() => setPendingDelete(null)} className="font-medium px-3 py-1 rounded-full text-on-secondary-container dark:text-dark-on-secondary-container bg-secondary-container dark:bg-dark-secondary-container hover:bg-secondary-container/80 dark:hover:bg-dark-secondary-container/80 transition-all active:animate-click-bounce">No</button>
                            </div>
                        ) : (
                            <button onClick={() => setPendingDelete(skill.id)} className={deleteButtonClasses}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Project Management Component
const ProjectsManager: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project>>({ title: '', description: '', imageUrl: '', liveUrl: '', repoUrl: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);

    const fetchProjects = async () => {
        setPendingDelete(null);
        const q = query(collection(db, 'projects'), orderBy('title'));
        const querySnapshot = await getDocs(q);
        setProjects(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        setLoading(false);
    };
    
    useEffect(() => {
        fetchProjects();
    }, []);

    const handleOpenModal = (project?: Project) => {
        setCurrentProject(project || { title: '', description: '', imageUrl: '', liveUrl: '', repoUrl: '' });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsSaving(false);
        setImageFile(null);
        setCurrentProject({ title: '', description: '', imageUrl: '', liveUrl: '', repoUrl: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCurrentProject({ ...currentProject, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const projectData = { ...currentProject };
            if (imageFile) {
                const imageUrl = await uploadToCloudinary(imageFile);
                projectData.imageUrl = imageUrl;
            }

            if (projectData.id) {
                // Update
                const projectDoc = doc(db, 'projects', projectData.id);
                const { id, ...dataToUpdate } = projectData;
                await updateDoc(projectDoc, dataToUpdate);
            } else {
                // Add
                const { id, ...dataToAdd } = projectData;
                await addDoc(collection(db, 'projects'), dataToAdd);
            }
            fetchProjects();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving project: ", error);
            alert(`Failed to save project: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'projects', id));
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project: ", error);
            alert('Failed to delete project. Please try again.');
        }
    };

    if (loading) return <p>Loading Projects...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Projects</h2>
                <button onClick={() => handleOpenModal()} className={buttonClasses}>Add Project</button>
            </div>
            
            <div className="space-y-4">
                {projects.map(project => (
                    <div key={project.id} className="bg-secondary-container/30 dark:bg-dark-secondary-container/30 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{project.title}</h3>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{project.description.substring(0, 50)}...</p>
                        </div>
                        <div className="flex items-center space-x-2">
                           {pendingDelete === project.id ? (
                                <div className="flex gap-2 items-center animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                                    <span className="text-sm">Sure?</span>
                                    <button onClick={() => handleConfirmDelete(project.id)} className="font-medium px-3 py-1 rounded-full text-on-error-container bg-error-container hover:bg-error-container/80 transition-all active:animate-click-bounce">Yes</button>
                                    <button onClick={() => setPendingDelete(null)} className="font-medium px-3 py-1 rounded-full text-on-secondary-container dark:text-dark-on-secondary-container bg-secondary-container dark:bg-dark-secondary-container hover:bg-secondary-container/80 dark:hover:bg-dark-secondary-container/80 transition-all active:animate-click-bounce">No</button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => handleOpenModal(project)} className="font-medium text-primary dark:text-dark-primary hover:text-primary/80 dark:hover:text-dark-primary/80">Edit</button>
                                    <button onClick={() => setPendingDelete(project.id)} className={deleteButtonClasses}>Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                    <div className={`${glassPanelClasses} p-8 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
                        <h3 className="text-xl font-bold mb-4">{currentProject.id ? 'Edit Project' : 'Add Project'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" name="title" value={currentProject.title} onChange={handleChange} placeholder="Title" required className={inputClasses} />
                            <textarea name="description" value={currentProject.description} onChange={handleChange} placeholder="Description" required rows={4} className={inputClasses}></textarea>
                            <div>
                                <label className="block text-sm font-medium">Project Image</label>
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="New Project Preview" className="w-full h-32 object-cover my-2 rounded-lg"/>
                                ) : (
                                    currentProject.imageUrl && <img src={currentProject.imageUrl} alt="Current Project" className="w-full h-32 object-cover my-2 rounded-lg"/>
                                )}
                                <input type="file" accept="image/*" disabled={!isCloudinaryConfigured} onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 disabled:opacity-50 disabled:cursor-not-allowed`} />
                            </div>
                            <input type="text" name="liveUrl" value={currentProject.liveUrl} onChange={handleChange} placeholder="Live Demo URL" className={inputClasses} />
                            <input type="text" name="repoUrl" value={currentProject.repoUrl} onChange={handleChange} placeholder="Code Repo URL" className={inputClasses} />
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className={secondaryButtonClasses}>Cancel</button>
                                <button type="submit" disabled={isSaving || (!isCloudinaryConfigured && !!imageFile)} className={buttonClasses}>{isSaving ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Messages Viewer Component
const MessagesViewer: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingDelete, setPendingDelete] = useState<string | null>(null);

    const fetchMessages = async () => {
        setPendingDelete(null);
        const q = query(collection(db, 'contactMessages'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setMessages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage)));
        setLoading(false);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleConfirmDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'contactMessages', id));
            fetchMessages();
        } catch (error) {
            console.error("Error deleting message: ", error);
            alert('Failed to delete message. Please try again.');
        }
    };

    if (loading) return <p>Loading Messages...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
            <div className="space-y-4">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className="bg-secondary-container/30 dark:bg-dark-secondary-container/30 p-4 rounded-xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{msg.name} <span className="font-normal text-text-secondary dark:text-dark-text-secondary">&lt;{msg.email}&gt;</span></p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleString() : 'No date'}</p>
                            </div>
                             {pendingDelete === msg.id ? (
                                <div className="flex gap-2 items-center animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                                    <span className="text-sm">Sure?</span>
                                    <button onClick={() => handleConfirmDelete(msg.id)} className="font-medium px-3 py-1 rounded-full text-on-error-container bg-error-container hover:bg-error-container/80 transition-all active:animate-click-bounce">Yes</button>
                                    <button onClick={() => setPendingDelete(null)} className="font-medium px-3 py-1 rounded-full text-on-secondary-container dark:text-dark-on-secondary-container bg-secondary-container dark:bg-dark-secondary-container hover:bg-secondary-container/80 dark:hover:bg-dark-secondary-container/80 transition-all active:animate-click-bounce">No</button>
                                </div>
                            ) : (
                                <button onClick={() => setPendingDelete(msg.id)} className={deleteButtonClasses}>Delete</button>
                            )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                )) : <p>No messages yet.</p>}
            </div>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'messages'>('profile');

  const renderContent = () => {
    switch (activeTab) {
        case 'profile': return <ProfileManager />;
        case 'skills': return <SkillsManager />;
        case 'projects': return <ProjectsManager />;
        case 'messages': return <MessagesViewer />;
        default: return null;
    }
  };

  const getTabClass = (tabName: 'profile' | 'skills' | 'projects' | 'messages') => {
      const baseClass = "px-4 py-2 rounded-full transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-surface dark:focus:ring-offset-dark-surface";
      if (activeTab === tabName) {
          return `${baseClass} bg-primary-container text-on-primary-container dark:bg-dark-primary-container dark:text-dark-on-primary-container`;
      }
      return `${baseClass} hover:bg-secondary-container/50 dark:hover:bg-dark-secondary-container/50`;
  }

  return (
    <div className="animate-fade-in-up space-y-8">
        <h1 className="text-5xl font-bold text-center md:text-left">Admin Dashboard</h1>
        {!isCloudinaryConfigured && (
            <div className="bg-error-container/50 text-on-error-container p-4 rounded-lg border border-red-400">
                <p className="font-bold">Cloudinary Not Configured</p>
                <p className="text-sm">Image uploads are disabled. Please configure your Cloudinary credentials in <code className="bg-on-error-container/20 px-1 rounded">cloudinary.ts</code> to enable image uploads.</p>
            </div>
        )}
        <div className={`p-4 rounded-2xl ${glassPanelClasses}`}>
            <nav className="flex flex-wrap gap-2 mb-6 border-b border-outline/20 dark:border-dark-outline/20 pb-4">
                <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>Profile</button>
                <button onClick={() => setActiveTab('skills')} className={getTabClass('skills')}>Skills</button>
                <button onClick={() => setActiveTab('projects')} className={getTabClass('projects')}>Projects</button>
                <button onClick={() => setActiveTab('messages')} className={getTabClass('messages')}>Messages</button>
            </nav>
            <div className="p-2 sm:p-4">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;