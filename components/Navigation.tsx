import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth, useTheme } from '../App';
import { HomeIcon, ProjectsIcon, ContactIcon, AIIcon, AdminIcon, LoginIcon, LogoutIcon, SunIcon, MoonIcon, LogoIcon } from './icons';

const NavItem: React.FC<{ to: string; children: React.ReactNode; label: string; }> = ({ to, children, label }) => {
    const navLinkClasses = `
        flex flex-col md:flex-row items-center rounded-lg 
        justify-center group-hover:md:justify-start 
        gap-1 md:gap-4 md:py-3
        transition-colors duration-200 w-full`;
    
    const activeLinkClasses = "text-on-primary-container bg-primary-container/80 dark:text-dark-on-primary-container dark:bg-dark-primary-container/80";
    const inactiveLinkClasses = "text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-secondary-container/30 dark:hover:bg-dark-secondary-container/30";

    return (
        <NavLink 
            to={to}
            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
        >
            <div className="shrink-0">{children}</div>
            <div className="md:w-0 md:overflow-hidden group-hover:md:w-auto transition-all duration-200 delay-100">
                <span className="text-xs md:text-base font-medium whitespace-nowrap">{label}</span>
            </div>
        </NavLink>
    );
};

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="flex items-center justify-center group-hover:justify-between rounded-lg bg-secondary-container/20 dark:bg-dark-secondary-container/20 w-full">
            <div className="w-0 overflow-hidden group-hover:w-auto transition-all duration-200 delay-100">
                 <span className="text-base font-medium whitespace-nowrap pl-4">Theme</span>
            </div>
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-3 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-secondary-container/50 dark:hover:bg-dark-secondary-container/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-colors"
                aria-label="Toggle theme"
            >
                <SunIcon className={`w-5 h-5 transition-transform duration-500 ${theme === 'dark' ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`} />
                <MoonIcon className={`w-5 h-5 absolute transition-transform duration-500 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-180 scale-0'}`} />
            </button>
        </div>
    );
};


const Navigation: React.FC = () => {
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

  const navLinks = (
    <>
        <NavItem to="/" label="Home"><HomeIcon /></NavItem>
        <NavItem to="/projects" label="Projects"><ProjectsIcon /></NavItem>
        <NavItem to="/contact" label="Contact"><ContactIcon /></NavItem>
        <NavItem to="/ai-fit" label="AI Fit"><AIIcon /></NavItem>
    </>
  );

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col w-20 hover:w-56 transition-all duration-300 ease-in-out fixed top-0 left-0 h-full p-4 bg-surface/30 dark:bg-dark-surface/30 backdrop-blur-lg border-r border-outline/20 dark:border-dark-outline/20 group z-50">
        <NavLink to="/" className="flex items-center justify-center group-hover:justify-start gap-2 mb-8 shrink-0 w-full">
            <LogoIcon className="w-8 h-8 text-primary dark:text-dark-primary shrink-0" />
            <div className="w-0 overflow-hidden group-hover:w-auto transition-all duration-200 delay-100">
                <span className="font-bold text-xl whitespace-nowrap gradient-text bg-gradient-to-r from-primary to-tertiary dark:from-dark-primary dark:to-dark-tertiary">MyPortfolio</span>
            </div>
        </NavLink>
        
        <nav className="flex flex-col gap-3 flex-grow w-full">
            {navLinks}
        </nav>

        <div className="flex flex-col gap-3 shrink-0 w-full">
            {currentUser ? (
                 <NavItem to="/admin/dashboard" label="Admin"><AdminIcon /></NavItem>
            ) : (
                 <NavItem to="/admin/login" label="Login"><LoginIcon /></NavItem>
            )}
           
            {currentUser && (
                <button 
                    onClick={handleLogout} 
                    className="flex flex-row items-center justify-center group-hover:justify-start gap-4 p-3 rounded-lg transition-colors duration-200 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-secondary-container/30 dark:hover:bg-dark-secondary-container/30 w-full"
                >
                    <div className="shrink-0"><LogoutIcon /></div>
                    <div className="w-0 overflow-hidden group-hover:w-auto transition-all duration-200 delay-100">
                        <span className="text-base font-medium whitespace-nowrap">Logout</span>
                    </div>
                </button>
            )}
            <ThemeToggle />
        </div>
      </aside>

      {/* --- Mobile Bottom Nav --- */}
      <nav className="block md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg border border-outline/20 dark:border-dark-outline/20 rounded-2xl shadow-2xl shadow-black/20">
            <div className="grid grid-cols-4 items-center justify-around h-16">
                {navLinks}
            </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;