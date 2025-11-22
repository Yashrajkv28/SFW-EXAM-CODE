import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth, useTheme } from '../App';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-secondary-container/50 dark:hover:bg-dark-secondary-container/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary"
            aria-label="Toggle theme"
        >
             <div className={`transition-transform duration-500 ${theme === 'dark' ? 'rotate-180' : ''}`}>
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </div>
        </button>
    );
};


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinkClasses = "px-4 py-2 text-sm font-medium transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-background dark:focus:ring-offset-dark-background";
  const activeLinkClasses = "bg-primary-container/70 text-on-primary-container dark:bg-dark-primary-container/70 dark:text-dark-on-primary-container rounded-full";
  const inactiveLinkClasses = "text-text-secondary dark:text-dark-text-secondary hover:bg-secondary-container/50 dark:hover:bg-dark-secondary-container/50 hover:text-text-primary dark:hover:text-dark-text-primary rounded-full";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 dark:bg-dark-background/80 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="font-bold text-xl">
                <span className="gradient-text bg-gradient-to-r from-primary to-tertiary dark:from-dark-primary dark:to-dark-tertiary">MyPortfolio</span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
              <NavLink to="/projects" className={getNavLinkClass}>Projects</NavLink>
              <NavLink to="/contact" className={getNavLinkClass}>Contact</NavLink>
              <NavLink to="/ai-fit" className={getNavLinkClass}>AI Fit</NavLink>
              <NavLink to={currentUser ? "/admin/dashboard" : "/admin/login"} className={getNavLinkClass}>Admin</NavLink>
              {currentUser && <button onClick={handleLogout} className={`${navLinkClasses} ${inactiveLinkClasses}`}>Logout</button>}
              <ThemeToggle />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} type="button" className="bg-secondary-container/50 dark:bg-dark-secondary-container/50 inline-flex items-center justify-center p-2 rounded-md text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg shadow-lg">
          <NavLink to="/" className={`${getNavLinkClass} block text-center`} onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/projects" className={`${getNavLinkClass} block text-center`} onClick={() => setIsOpen(false)}>Projects</NavLink>
          <NavLink to="/contact" className={`${getNavLinkClass} block text-center`} onClick={() => setIsOpen(false)}>Contact</NavLink>
          <NavLink to="/ai-fit" className={`${getNavLinkClass} block text-center`} onClick={() => setIsOpen(false)}>AI Fit</NavLink>
          <NavLink to={currentUser ? "/admin/dashboard" : "/admin/login"} className={`${getNavLinkClass} block text-center`} onClick={() => setIsOpen(false)}>Admin</NavLink>
          {currentUser && <button onClick={() => { handleLogout(); setIsOpen(false); }} className={`${navLinkClasses} ${inactiveLinkClasses} w-full text-center`}>Logout</button>}
          <div className="flex justify-center pt-2"><ThemeToggle /></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
