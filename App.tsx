import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

import Navigation from './components/Navigation'; // Changed from Navbar
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import AIFitAnalysisPage from './pages/AIFitAnalysisPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// --- Auth Context ---
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => {
    return useContext(AuthContext);
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    
    const value = { currentUser, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// --- Theme Context ---
type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as Theme;
        }
        return 'dark'; // Default to dark
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Firebase Setup Instructions Component ---
const FirebaseSetupInstructions: React.FC = () => (
    <div className="bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center bg-surface dark:bg-dark-surface p-8 rounded-squircle shadow-2xl">
         <h1 className="text-4xl font-bold text-primary dark:text-dark-primary mb-4">Welcome to Your Portfolio!</h1>
         <h2 className="text-2xl font-bold text-red-500 mb-2">Configuration Needed</h2>
         <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
             Your portfolio is almost ready to go! There's just one more step. You need to connect it to your Firebase backend.
         </p>
         <div className="text-left bg-secondary-container/30 dark:bg-dark-secondary-container/30 p-4 rounded-xl">
             <p className="font-semibold">Action Required:</p>
             <ol className="list-decimal list-inside mt-2 space-y-2">
                 <li>Open the file: <code className="bg-primary/10 dark:bg-dark-primary/10 px-2 py-1 rounded text-primary dark:text-dark-primary">firebase.ts</code></li>
                 <li>Replace the placeholder values with your actual Firebase project configuration.</li>
             </ol>
         </div>
         <p className="mt-6 text-sm text-text-secondary dark:text-dark-text-secondary">
             Once configured, this message will disappear, and your portfolio will be live.
         </p>
      </div>
    </div>
);


function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetupInstructions />;
  }

  return (
    <ThemeProvider>
        <AuthProvider>
            <HashRouter>
                <div className="flex min-h-screen">
                    <Navigation />
                    <main className="flex-1 md:pl-20">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-28 md:pb-16">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/projects" element={<ProjectsPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/ai-fit" element={<AIFitAnalysisPage />} />
                                <Route path="/admin/login" element={<AdminLoginPage />} />
                                <Route 
                                    path="/admin/dashboard" 
                                    element={
                                        <ProtectedRoute>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                        <Footer />
                    </main>
                </div>
            </HashRouter>
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App;