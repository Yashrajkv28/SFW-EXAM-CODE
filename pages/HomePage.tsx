import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Profile, Skill } from '../types';
import Loading from '../components/Loading';
import { NavLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileDocRef = doc(db, 'profile', 'main');
        const profileDocSnap = await getDoc(profileDocRef);
        if (profileDocSnap.exists()) {
          setProfile(profileDocSnap.data() as Profile);
        }

        const skillsCollectionRef = collection(db, 'skills');
        const skillsSnapshot = await getDocs(skillsCollectionRef);
        const skillsList = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
        setSkills(skillsList);

      } catch (error) {
        console.error("Error fetching homepage data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-24 animate-fade-in-up">
      {profile && (
        <section className="min-h-[70vh] flex flex-col lg:flex-row items-center justify-center gap-12 text-center lg:text-left">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                <img 
                    src={profile.profileImageUrl || 'https://picsum.photos/200'} 
                    alt={profile.name} 
                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover ring-4 ring-surface dark:ring-dark-surface"
                />
            </div>
            <div className="flex-1 max-w-2xl">
                <p className="text-lg text-primary dark:text-dark-primary font-medium">Hi, my name is</p>
                <h1 className="text-5xl md:text-7xl font-bold text-text-primary dark:text-dark-text-primary mt-1">{profile.name}</h1>
                <h2 className="mt-2 text-3xl md:text-4xl text-text-secondary dark:text-dark-text-secondary font-medium">{profile.title}</h2>
                <p className="mt-6 text-text-secondary dark:text-dark-text-secondary leading-relaxed">{profile.bio}</p>
                <div className="mt-8 flex justify-center lg:justify-start gap-4">
                    <NavLink to="/projects" className="px-8 py-3 font-semibold text-on-primary bg-primary dark:bg-dark-primary rounded-full shadow-lg hover:shadow-primary/40 dark:hover:shadow-dark-primary/40 transform hover:-translate-y-1 transition-all duration-300">
                        View My Work
                    </NavLink>
                    <NavLink to="/contact" className="px-8 py-3 font-semibold text-text-primary dark:text-dark-text-primary bg-secondary-container dark:bg-dark-secondary-container rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        Get In Touch
                    </NavLink>
                </div>
            </div>
        </section>
      )}

      <section>
        <h2 className="text-4xl font-bold text-center mb-12">My Toolkit</h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <div 
                key={skill.id} 
                className="bg-surface dark:bg-dark-surface backdrop-blur-lg border border-outline/20 dark:border-dark-outline/20 text-text-primary dark:text-dark-text-primary px-5 py-2.5 rounded-full font-medium shadow-md transition-all duration-300 hover:shadow-primary/30 dark:hover:shadow-dark-primary/30 hover:border-primary/50 dark:hover:border-dark-primary/50 transform hover:-translate-y-1"
                style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: `${index * 80}ms`, opacity: 0 }}
              >
                {skill.name}
              </div>
            ))
          ) : (
            <p className="text-text-secondary dark:text-dark-text-secondary">No skills listed yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;