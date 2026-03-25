import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../config/supabase';

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
  user: User | null;
  partner: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, partnerCode?: string, password?: string) => Promise<any>;
  updatePhoto: (file: File) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  channel: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and provides authentication state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [channel, setChannel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setChannel(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, couples(couple_code)')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        const loggedUser: User = {
          email: profile.email,
          name: profile.name,
          coupleId: profile.couple_id,
          points: profile.points || 0,
          level: profile.level || 1,
          photoUrl: profile.photo_url,
          coupleCode: profile.couples?.couple_code,
          id: profile.id,
          metadata: profile.metadata
        };
        setUser(loggedUser);
        fetchPartnerProfile(loggedUser.id, loggedUser.coupleId);
        connectSocket(loggedUser.coupleId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    if (!user?.coupleId) return;

    const channel = supabase.channel('auth_profiles_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles', 
        filter: `couple_id=eq.${user.coupleId}` 
      }, (payload) => {
        const newRecord = payload.new as any;
        if (newRecord && newRecord.id === user.id) {
          fetchUserProfile(user.id);
        } else if (newRecord) {
          fetchPartnerProfile(user.id, user.coupleId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.coupleId, user?.id]);

  const fetchPartnerProfile = async (userId: string, coupleId?: string) => {
    if (!coupleId) return;
    try {
      const { data: partnerProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('couple_id', coupleId)
        .neq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching partner profile:', error);
        }
        setPartner(null);
        return;
      }

      if (partnerProfile) {
        const partnerUser: User = {
          email: partnerProfile.email,
          name: partnerProfile.name,
          coupleId: partnerProfile.couple_id,
          points: partnerProfile.points || 0,
          level: partnerProfile.level || 1,
          photoUrl: partnerProfile.photo_url,
          id: partnerProfile.id,
          metadata: partnerProfile.metadata
        };
        setPartner(partnerUser);
      }
    } catch (error) {
      console.error('Error in fetchPartnerProfile:', error);
    }
  };

  /**
   * Initializes a mock socket connection for real-time features.
   * @param coupleId - The unique identifier for the couple.
   */
  const connectSocket = (coupleId?: string) => {
    if (coupleId) {
      // We will replace this with Supabase Realtime later if needed
      const mockChannel = {
        on: () => mockChannel,
        subscribe: () => {},
        send: () => {}
      };
      setChannel(mockChannel);
    }
  };

  /**
   * Generates a random 6-character alphanumeric code.
   */
  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  /**
   * Authenticates a user with email and password.
   */
  const login = async (email: string, password?: string) => {
    if (!password) throw new Error('A senha é obrigatória.');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  /**
   * Registers a new user and optionally links them to a partner.
   */
  const register = async (name: string, email: string, partnerCode?: string, password?: string) => {
    if (!password) throw new Error('A senha é obrigatória.');

    let coupleId = null;

    // If partner code is provided, verify it first
    if (partnerCode) {
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .eq('couple_code', partnerCode)
        .single();

      if (coupleError || !couple) {
        throw new Error('Código do parceiro inválido ou não encontrado.');
      }
      coupleId = couple.id;
    }

    // Register the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          photo_url: null
        }
      }
    });

    if (authError) {
      console.error("Auth Error:", authError);
      throw new Error(`Erro na autenticação: ${authError.message}`);
    }

    // Se a sessão for nula após o registro, significa que a confirmação de e-mail está ativada no Supabase.
    // Não podemos inserir no banco de dados sem uma sessão ativa devido ao RLS.
    if (!authData.session) {
      throw new Error('Confirmação de e-mail ativada. Por favor, verifique sua caixa de entrada para confirmar o e-mail OU desative "Confirm email" no painel do Supabase (Authentication > Providers > Email) para testar mais facilmente.');
    }

    // Se temos sessão, o usuário está logado e o RLS (auth.uid()) vai funcionar.
    if (authData.user) {
      // 1. Tentar atualizar o perfil (caso uma trigger já tenha criado) ou inserir um novo
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: authData.user.id, 
          name, 
          email 
        });
      
      if (profileError) {
        console.error("Profile Error Details:", profileError);
        throw new Error(`Erro ao salvar perfil: ${profileError.message}. Verifique as políticas RLS da tabela 'profiles'.`);
      }

      // 2. Criar um novo casal se não houver código de parceiro
      if (!coupleId) {
        const { data: newCouple, error: newCoupleError } = await supabase
          .from('couples')
          .insert([{ couple_code: generateCode() }])
          .select()
          .single();

        if (newCoupleError) {
          console.error("Couple Error:", newCoupleError);
          throw new Error(`Erro ao gerar código do casal: ${newCoupleError.message}. Verifique as políticas RLS da tabela 'couples'.`);
        }
        coupleId = newCouple.id;
      }

      // 3. Atualizar o perfil com o ID do casal
      if (coupleId) {
        const { error: linkError } = await supabase
          .from('profiles')
          .update({ couple_id: coupleId })
          .eq('id', authData.user.id);

        if (linkError) {
          console.error("Profile Update Error:", linkError);
          throw new Error(`Erro ao vincular casal: ${linkError.message}`);
        }

        // Refresh user profile to ensure the state has the new coupleId
        await fetchUserProfile(authData.user.id);
      }
    }

    return authData.user;
  };

  /**
   * Logs out the current user and clears session data.
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during Supabase signOut:', error);
    } finally {
      setUser(null);
      setPartner(null);
      setChannel(null);
    }
  };

  /**
   * Updates the user's profile photo.
   */
  const updatePhoto = async (file: File): Promise<void> => {
    if (!user || !user.id) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload Error Details:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile Update Error Details:', updateError);
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }

      setUser({ ...user, photoUrl: publicUrl });
    } catch (error: any) {
      console.error('Error updating photo:', error);
      throw new Error(error.message || 'Erro ao atualizar a foto. Tente novamente.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, partner, login, logout, register, updatePhoto, refreshUser, isAuthenticated: !!user, channel, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
