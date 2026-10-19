import React, { createContext, useContext, useState, useEffect } from 'react';
import { CandidateProfile, EmployabilityIndexData, User, OnlineTestResult, FinalInterviewReport, LLMStatus } from '../types';
import { api } from '../services/api';

export type NavTab = 
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'assessment'
  | 'careers'
  | 'career-detail'
  | 'career-comparison'
  | 'skill-gap'
  | 'roadmap'
  | 'learning-hub'
  | 'projects'
  | 'proofs'
  | 'online-test'
  | 'interview-prep'
  | 'interview-simulation'
  | 'interviews'
  | 'resume'
  | 'employability'
  | 'timeline'
  | 'insights'
  | 'admin-training';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedCareerId: string | null;
  setSelectedCareerId: (id: string | null) => void;
  profile: CandidateProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<CandidateProfile | null>>;
  employabilityIndex: EmployabilityIndexData | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, target_career?: string) => Promise<void>;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshData: () => Promise<void>;
  loading: boolean;
  llmStatus: LLMStatus | null;
  lastTestResult: OnlineTestResult | null;
  setLastTestResult: (res: OnlineTestResult | null) => void;
  lastInterviewReport: FinalInterviewReport | null;
  setLastInterviewReport: (rep: FinalInterviewReport | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    // If not authenticated, start on landing page
    const hasAuth = !!localStorage.getItem('auth_token');
    return hasAuth ? 'dashboard' : 'landing';
  });

  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [employabilityIndex, setEmployabilityIndex] = useState<EmployabilityIndexData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [llmStatus, setLlmStatus] = useState<LLMStatus | null>(null);
  const [lastTestResult, setLastTestResult] = useState<OnlineTestResult | null>(null);
  const [lastInterviewReport, setLastInterviewReport] = useState<FinalInterviewReport | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Protected navigation handler
  const setActiveTab = (tab: NavTab) => {
    const publicTabs: NavTab[] = ['landing', 'login', 'register'];
    const isAuth = !!token;
    if (!isAuth && !publicTabs.includes(tab)) {
      setActiveTabState('login');
      showToast('Please log in to access this feature.', 'info');
      return;
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Verify token and load fresh user profile on startup
  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const meRes = await api.getMe();
        if (meRes?.user) {
          setUser(meRes.user);
          localStorage.setItem('auth_user', JSON.stringify(meRes.user));
        }
      } catch (e) {
        console.warn('Session verification error:', e);
        // Clear invalid or expired session
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const refreshData = async () => {
    try {
      const [profData, empData, llmRes] = await Promise.allSettled([
        api.getProfile(),
        api.getEmployabilityIndex(),
        api.getLLMStatus()
      ]);

      if (profData.status === 'fulfilled') setProfile(profData.value);
      if (empData.status === 'fulfilled') setEmployabilityIndex(empData.value);
      if (llmRes.status === 'fulfilled') setLlmStatus(llmRes.value);
    } catch (err) {
      console.error('Error refreshing app state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshData();
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      if (!res?.token || !res?.user) {
        throw new Error('Invalid response from authentication server.');
      }

      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setActiveTabState('dashboard');
      showToast(`Welcome back, ${res.user.name}!`, 'success');

      // Refresh candidate profile in background
      refreshData().catch(e => console.warn('Post-login refresh notice:', e));
    } catch (err: any) {
      const message = err.message || 'Invalid email or password.';
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, target_career?: string) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, pass, target_career);
      if (!res?.token || !res?.user) {
        throw new Error('Registration failed to return session credentials.');
      }

      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setActiveTabState('dashboard');
      showToast(`Account created successfully! Welcome, ${name}.`, 'success');

      refreshData().catch(e => console.warn('Post-register refresh notice:', e));
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear credentials and persisted caches
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setProfile(null);
    setEmployabilityIndex(null);
    setLastTestResult(null);
    setLastInterviewReport(null);
    setActiveTabState('login');
    showToast('You have been logged out successfully.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCareerId,
        setSelectedCareerId,
        profile,
        setProfile,
        employabilityIndex,
        user,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        darkMode,
        toggleDarkMode,
        toast,
        showToast,
        refreshData,
        loading,
        llmStatus,
        lastTestResult,
        setLastTestResult,
        lastInterviewReport,
        setLastInterviewReport
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
