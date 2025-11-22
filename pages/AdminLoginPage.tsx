import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-surface/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-white/20 dark:border-dark-outline-variant/20 shadow-2xl rounded-squircle px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl font-bold text-center mb-6 text-text-primary dark:text-dark-text-primary">Admin Login</h1>
          {error && <p className="bg-red-500/20 text-red-500 text-center p-3 rounded-lg mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 bg-black/5 dark:bg-white/5 border-outline/50 dark:border-dark-outline/50 text-text-primary dark:text-dark-text-primary leading-tight focus:outline-none focus:border-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-primary/50 dark:focus:ring-dark-primary/50 transition-all duration-300"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-secondary dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 bg-black/5 dark:bg-white/5 border-outline/50 dark:border-dark-outline/50 text-text-primary dark:text-dark-text-primary mb-3 leading-tight focus:outline-none focus:border-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-primary/50 dark:focus:ring-dark-primary/50 transition-all duration-300"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-primary dark:bg-dark-primary hover:bg-primary/90 dark:hover:bg-dark-primary/90 text-on-primary dark:text-dark-on-primary font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline w-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/40 dark:hover:shadow-dark-primary/40 active:animate-click-bounce"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;