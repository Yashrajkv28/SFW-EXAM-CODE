import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Project } from '../types';
import Loading from '../components/Loading';

const ProjectCard: React.FC<{ project: Project; style: React.CSSProperties }> = ({ project, style }) => {
  
  const Button: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-block font-medium text-sm text-center text-primary dark:text-dark-primary active:animate-click-bounce px-5 py-2.5 rounded-full transition-all duration-300 bg-primary/10 dark:bg-dark-primary/10 hover:bg-primary/20 dark:hover:bg-dark-primary/20 hover:shadow-lg hover:shadow-primary/20"
    >
      {children}
    </a>
  );

  return (
    <div style={style} className="group bg-surface/50 dark:bg-dark-surface/50 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20 overflow-hidden transform transition-all duration-300 hover:shadow-primary/20 dark:hover:shadow-dark-primary/20 hover:-translate-y-2 border border-transparent hover:border-primary/30">
        <div className="overflow-hidden h-56">
            <img className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" src={project.imageUrl || 'https://picsum.photos/400/225'} alt={project.title} />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-2">{project.title}</h3>
          <p className="text-text-secondary dark:text-dark-text-secondary text-sm flex-grow mb-6">
            {project.description}
          </p>
          <div className="flex justify-end gap-3 mt-auto">
            {project.liveUrl && <Button href={project.liveUrl}>Live Demo</Button>}
            {project.repoUrl && <Button href={project.repoUrl}>Code</Button>}
          </div>
        </div>
    </div>
  );
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollectionRef = collection(db, 'projects');
        const q = query(projectsCollectionRef, orderBy('title'));
        const querySnapshot = await getDocs(q);
        const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(projectsList);
      } catch (error) {
        console.error("Error fetching projects: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-5xl font-bold">My Work</h1>
        <p className="mt-2 text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">Here are some of the projects I'm proud to have worked on. Explore them to see my skills in action.</p>
      </div>
      {projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: `${index * 100}ms`, opacity: 0 }}
            />
          ))}
        </div>
      ) : (
         <p className="text-center text-text-secondary dark:text-dark-text-secondary">No projects have been added yet.</p>
      )}
    </div>
  );
};

export default ProjectsPage;