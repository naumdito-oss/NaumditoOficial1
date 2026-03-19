import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, partnerCode?: string) => Promise<any>;
  updatePhoto: (photoUrl: string) => void;
  isAuthenticated: boolean;
  channel: any | null; // Removed RealtimeChannel type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<any | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      connectSocket(parsedUser.coupleId);
    }
  }, []);

  const connectSocket = (coupleId?: string) => {
    // Mock socket connection since Supabase is removed
    if (coupleId) {
      const mockChannel = {
        on: () => mockChannel,
        subscribe: () => {},
        send: () => {}
      };
      setChannel(mockChannel);
    }
  };

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const login = async (email: string, password?: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'naumdito@gmail.com' && password === '13042013') {
          const code = generateCode();
          const photoUrl = 'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=800&auto=format&fit=crop';
          
          const loggedUser = { 
            email, 
            name: 'Admin NaumDito', 
            coupleId: 'mock-couple-id', 
            points: 0, 
            level: 1, 
            photoUrl,
            coupleCode: code,
            partnerName: null
          };
          
          setUser(loggedUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
          connectSocket(loggedUser.coupleId);
          resolve();
        } else {
          // Check if there's a registered user in local storage
          const storedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
          const foundUser = storedUsers.find((u: any) => u.email === email);
          
          if (foundUser) {
            setUser(foundUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser));
            connectSocket(foundUser.coupleId);
            resolve();
          } else {
            reject(new Error('Credenciais inválidas ou usuário não encontrado.'));
          }
        }
      }, 500);
    });
  };

  const register = async (name: string, email: string, partnerCode?: string) => {
    return new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        const storedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        
        if (storedUsers.some((u: any) => u.email === email)) {
          reject(new Error('Usuário já existe com este e-mail.'));
          return;
        }

        let coupleId = 'mock-couple-id-' + Date.now();
        let coupleCode = generateCode();
        let partnerName = null;

        if (partnerCode) {
          const partner = storedUsers.find((u: any) => u.coupleCode === partnerCode);
          if (partner) {
            coupleId = partner.coupleId;
            coupleCode = partner.coupleCode;
            partnerName = partner.name;
          } else {
            reject(new Error('Código do parceiro inválido.'));
            return;
          }
        }

        const photoUrl = 'https://images.unsplash.com/photo-1621112904887-419379ce6824?q=80&w=2070&auto=format&fit=crop';
        
        const newUser = { 
          email, 
          name, 
          coupleId, 
          points: 0, 
          level: 1, 
          photoUrl,
          coupleCode,
          partnerName
        };
        
        storedUsers.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(storedUsers));
        
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        connectSocket(newUser.coupleId);
        resolve(newUser);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setChannel(null);
  };

  const updatePhoto = async (photoUrl: string) => {
    if (user) {
      const updatedUser = { ...user, photoUrl };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      const storedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.email === user.email);
      if (userIndex !== -1) {
        storedUsers[userIndex] = updatedUser;
        localStorage.setItem('mock_users', JSON.stringify(storedUsers));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updatePhoto, isAuthenticated: !!user, channel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
