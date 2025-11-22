import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Profile } from '../types';

export const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-colors duration-300 transform hover:scale-110">
        {children}
    </a>
);

const Footer: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const profileDocRef = doc(db, 'profile', 'main');
            const profileDocSnap = await getDoc(profileDocRef);
            if (profileDocSnap.exists()) {
                setProfile(profileDocSnap.data() as Profile);
            }
        } catch (error) {
            console.error("Error fetching profile for footer: ", error);
        }
    };

    fetchProfile();
  }, []);

  return (
    <footer className="bg-transparent mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline/20 dark:border-dark-outline/20">
        <p className="text-center sm:text-left text-sm text-text-secondary dark:text-dark-text-secondary">
          &copy; {new Date().getFullYear()} {profile?.name || 'MyPortfolio'}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
            {profile?.githubUrl && (
                <SocialIcon href={profile.githubUrl}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </SocialIcon>
            )}
            {profile?.linkedinUrl && (
                <SocialIcon href={profile.linkedinUrl}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </SocialIcon>
            )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;