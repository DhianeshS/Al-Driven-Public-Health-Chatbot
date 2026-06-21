import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  preferredLang?: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemType: 'disease' | 'tip' | 'article';
  itemId: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  bookmarks: Bookmark[];
  isLoading: boolean;
  login: (email: string, password: String) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: String, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleBookmark: (itemType: 'disease' | 'tip' | 'article', itemId: string) => Promise<boolean>;
  updateProfile: (data: { fullName?: string; preferredLang?: string; avatarUrl?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Fetch fresh profile and bookmarks from API
          const profileRes = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (profileRes.ok) {
            const freshUser = await profileRes.json();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }

          const bookmarksRes = await fetch(`${API_BASE}/auth/bookmarks`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (bookmarksRes.ok) {
            const bmkData = await bookmarksRes.json();
            setBookmarks(bmkData);
          } else {
            // Fallback bookmarks from local storage
            const localBmks = localStorage.getItem(`bookmarks_${parsedUser.id}`);
            if (localBmks) setBookmarks(JSON.parse(localBmks));
          }
        } catch (err) {
          console.error("Auth hydration error, falling back to local session", err);
          // If server is offline, keep the local storage user session
          if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            const localBmks = localStorage.getItem(`bookmarks_${u.id}`);
            if (localBmks) setBookmarks(JSON.parse(localBmks));
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: String) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Fetch bookmarks
      const bookmarksRes = await fetch(`${API_BASE}/auth/bookmarks`, {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      if (bookmarksRes.ok) {
        const bmkData = await bookmarksRes.json();
        setBookmarks(bmkData);
        localStorage.setItem(`bookmarks_${data.user.id}`, JSON.stringify(bmkData));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn("Backend login failed, attempting local mock auth fallback:", err.message);
      
      // MOCK FALLBACK for offline/credentials-free showcase
      if (email === 'admin@healthbot.org' && password === 'adminpassword') {
        const mockAdmin: User = {
          id: 'usr-admin-1',
          email: 'admin@healthbot.org',
          fullName: 'Dr. Sarah Jenkins (Admin)',
          role: 'admin',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
          preferredLang: 'en',
          created_at: new Date().toISOString()
        };
        setToken('mock-jwt-token-admin');
        setUser(mockAdmin);
        localStorage.setItem('token', 'mock-jwt-token-admin');
        localStorage.setItem('user', JSON.stringify(mockAdmin));
        
        const localBmks = localStorage.getItem('bookmarks_usr-admin-1') || '[]';
        setBookmarks(JSON.parse(localBmks));
        
        setIsLoading(false);
        return { success: true };
      } else if (email === 'user@healthbot.org' && password === 'userpassword') {
        const mockUser: User = {
          id: 'usr-patient-1',
          email: 'user@healthbot.org',
          fullName: 'John Doe',
          role: 'user',
          avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
          preferredLang: 'en',
          created_at: new Date().toISOString()
        };
        setToken('mock-jwt-token-patient');
        setUser(mockUser);
        localStorage.setItem('token', 'mock-jwt-token-patient');
        localStorage.setItem('user', JSON.stringify(mockUser));

        const localBmks = localStorage.getItem('bookmarks_usr-patient-1') || '[]';
        setBookmarks(JSON.parse(localBmks));

        setIsLoading(false);
        return { success: true };
      }

      // Check if user is in local storage registered list
      const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const found = localUsers.find((u: any) => u.email === email && u.password === password);
      if (found) {
        const { password: _, ...cleanUser } = found;
        setToken(`mock-jwt-${cleanUser.id}`);
        setUser(cleanUser);
        localStorage.setItem('token', `mock-jwt-${cleanUser.id}`);
        localStorage.setItem('user', JSON.stringify(cleanUser));

        const localBmks = localStorage.getItem(`bookmarks_${cleanUser.id}`) || '[]';
        setBookmarks(JSON.parse(localBmks));
        
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const signup = async (email: string, password: String, fullName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setBookmarks([]);
      
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn("Backend signup failed, attempting local mock signup fallback:", err.message);

      // Local mock signup fallback
      const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (localUsers.some((u: any) => u.email === email)) {
        setIsLoading(false);
        return { success: false, error: 'Email already registered' };
      }

      const mockId = 'usr-' + Date.now();
      const mockUser: User & { password?: String } = {
        id: mockId,
        email: email.toLowerCase(),
        password,
        fullName,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
        preferredLang: 'en',
        created_at: new Date().toISOString()
      };

      localUsers.push(mockUser);
      localStorage.setItem('mock_users', JSON.stringify(localUsers));

      const { password: _, ...cleanUser } = mockUser;
      setToken(`mock-jwt-${mockId}`);
      setUser(cleanUser);
      localStorage.setItem('token', `mock-jwt-${mockId}`);
      localStorage.setItem('user', JSON.stringify(cleanUser));
      setBookmarks([]);

      setIsLoading(false);
      return { success: true };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setBookmarks([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const toggleBookmark = async (itemType: 'disease' | 'tip' | 'article', itemId: string) => {
    if (!user) return false;
    
    try {
      const response = await fetch(`${API_BASE}/auth/bookmarks/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemType, itemId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.bookmarked) {
          setBookmarks(prev => [...prev, data.bookmark]);
        } else {
          setBookmarks(prev => prev.filter(b => !(b.itemType === itemType && b.itemId === itemId)));
        }
        return true;
      }
      throw new Error("Failed toggle on server");
    } catch (err) {
      console.warn("Toggle bookmark API failed, executing local toggle bookmark:", err);

      // Local mock toggle
      const index = bookmarks.findIndex(b => b.userId === user.id && b.itemType === itemType && b.itemId === itemId);
      let updated = [...bookmarks];
      if (index === -1) {
        const newB = {
          id: 'bmk-' + Date.now(),
          userId: user.id,
          itemType,
          itemId,
          created_at: new Date().toISOString()
        };
        updated.push(newB);
      } else {
        updated.splice(index, 1);
      }
      setBookmarks(updated);
      localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(updated));
      return true;
    }
  };

  const updateProfile = async (data: { fullName?: string; preferredLang?: string; avatarUrl?: string }) => {
    if (!user) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      throw new Error("Failed profile update on server");
    } catch (err) {
      console.warn("Profile update API failed, executing local profile update:", err);

      // Local update
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));

      // Also update mock database in localStorage
      const localUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const index = localUsers.findIndex((u: any) => u.id === user.id);
      if (index !== -1) {
        localUsers[index] = { ...localUsers[index], ...data };
        localStorage.setItem('mock_users', JSON.stringify(localUsers));
      }
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, bookmarks, isLoading, login, signup, logout, toggleBookmark, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
