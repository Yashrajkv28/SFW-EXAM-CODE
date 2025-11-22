import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SocialIcon } from '../components/Footer'; // Let's create a reusable SocialIcon
import { Profile } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const profileDocRef = doc(db, 'profile', 'main');
            const profileDocSnap = await getDoc(profileDocRef);
            if (profileDocSnap.exists()) {
                setProfile(profileDocSnap.data() as Profile);
            }
        } catch (error) {
            console.error("Error fetching profile for contact page: ", error);
        }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name,
        email,
        message,
        timestamp: serverTimestamp(),
      });
      setStatus('success');
      setFeedbackMessage('Thank you! Your message has been sent successfully.');
      setTimeout(() => {
          setStatus('idle');
      }, 5000)
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
      setStatus('error');
      setFeedbackMessage('Something went wrong. Please try again later.');
    }
  };
  
  const inputClasses = "mt-1 block w-full bg-black/5 dark:bg-white/5 border-outline/50 dark:border-dark-outline/50 rounded-lg border py-3 px-4 text-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-primary/50 dark:focus:ring-dark-primary/50 transition-all duration-300 placeholder:text-text-secondary/50";

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Get In Touch</h1>
        <p className="mt-2 text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of an amazing team.
        </p>
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-16 items-start">
        <div className="bg-surface/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-white/20 dark:border-dark-outline-variant/20 p-8 rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-primary dark:text-dark-text-primary">Your Message</label>
              <textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required className={inputClasses} placeholder="Let's talk about..."></textarea>
            </div>
            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-full shadow-sm text-base font-medium text-on-primary bg-primary dark:bg-dark-primary hover:shadow-lg hover:shadow-primary/40 dark:hover:shadow-dark-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary disabled:opacity-50 transition-all duration-300 active:animate-click-bounce"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {status === 'success' && <p className="text-green-500 text-center text-sm">{feedbackMessage}</p>}
            {status === 'error' && <p className="text-red-500 text-center text-sm">{feedbackMessage}</p>}
          </form>
        </div>
        <div className="space-y-8 pt-4">
            <h3 className="text-2xl font-bold">Or reach me directly</h3>
            <p className="text-text-secondary dark:text-dark-text-secondary">If you prefer other methods, here are a few ways to connect with me. I look forward to hearing from you!</p>
            <div className="flex items-center gap-6">
                {profile?.githubUrl && (
                    <SocialIcon href={profile.githubUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        <span className="sr-only">GitHub</span>
                    </SocialIcon>
                )}
                {profile?.linkedinUrl && (
                    <SocialIcon href={profile.linkedinUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        <span className="sr-only">LinkedIn</span>
                    </SocialIcon>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;