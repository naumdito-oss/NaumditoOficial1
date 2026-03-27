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
  register: (name: string, email: string, partnerCode?: string, password?: string, customCoupleCode?: string) => Promise<any>;
  updatePhoto: (file: File) => Promise<void>;
  updateMetadata: (metadata: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  channel: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Generates a random 6-character alphanumeric code.
 */
export const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Provider component that wraps the app and provides authentication state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [channel, setChannel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchProfilePromiseRef = React.useRef<Promise<{success: boolean, error?: string}> | null>(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore INITIAL_SESSION to prevent double fetching on mount
      if (event === 'INITIAL_SESSION') return;
      
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

  const fetchUserProfile = async (userId: string): Promise<{success: boolean, error?: string}> => {
    if (fetchProfilePromiseRef.current) {
      return fetchProfilePromiseRef.current;
    }

    const fetchPromise = (async () => {
      try {
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*, couples(couple_code)')
          .eq('id', userId)
          .single();

        // Fallback if join fails (e.g. relationship or column doesn't exist in production yet)
        if (error && error.code !== 'PGRST116') {
          console.warn('Error fetching profile with join, trying without join:', error);
          const retry = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          profile = retry.data;
          error = retry.error;
        }

        // If profile doesn't exist, try to create it
        if (error && error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create one...');
          const { data: userData } = await supabase.auth.getUser();
          const userObj = userData?.user;
          
          if (userObj) {
            const { error: insertError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                email: userObj.email,
                name: userObj.user_metadata?.name || 'Usuário',
              });
              
            if (!insertError) {
              // Fetch again after creating
              const retry = await supabase
                .from('profiles')
                .select('*, couples(couple_code)')
                .eq('id', userId)
                .single();
              profile = retry.data;
              error = retry.error;
            } else {
              error = insertError;
            }
          }
        }

        if (error || !profile) {
          console.error('Error fetching user profile:', error || 'Profile not found');
          await supabase.auth.signOut();
          return { success: false, error: error?.message || 'Profile not found' };
        }

        console.log('Profile fetched successfully:', profile);
        let currentCoupleId = profile.couple_id;
        let currentCoupleCode = profile.couples?.couple_code;
        
        // Handle case where couples might be an array or join failed but we have couple_id
        if (!currentCoupleCode && currentCoupleId) {
           const { data: coupleData } = await supabase
             .from('couples')
             .select('couple_code')
             .eq('id', currentCoupleId)
             .single();
           if (coupleData) {
             currentCoupleCode = coupleData.couple_code;
           }
        }

        let currentAnniversaryDate = profile.metadata?.anniversaryDate;

        // If user logged in via OAuth and doesn't have a couple_id, create one or join existing
        if (!currentCoupleId) {
          const storedPartnerCode = localStorage.getItem('partner_code');
          let joinedExisting = false;

          if (storedPartnerCode) {
            const { data: couple, error: coupleError } = await supabase
              .from('couples')
              .select('id, couple_code')
              .eq('couple_code', storedPartnerCode)
              .single();

            if (couple && !coupleError) {
              currentCoupleId = couple.id;
              currentCoupleCode = couple.couple_code;
              joinedExisting = true;
              localStorage.removeItem('partner_code');
            }
          }

          if (!joinedExisting) {
            const { data: newCouple, error: newCoupleError } = await supabase
              .from('couples')
              .insert([{ couple_code: generateCode() }])
              .select()
              .single();

            if (!newCoupleError && newCouple) {
              currentCoupleId = newCouple.id;
              currentCoupleCode = newCouple.couple_code;
            }
          }

          if (currentCoupleId) {
            await supabase
              .from('profiles')
              .update({ couple_id: currentCoupleId })
              .eq('id', userId);
          }
        }

        const loggedUser: User = {
          email: profile.email,
          name: profile.name,
          coupleId: currentCoupleId,
          points: profile.points || 0,
          level: profile.level || 1,
          photoUrl: profile.photo_url,
          coupleCode: currentCoupleCode,
          id: profile.id,
          birthDate: profile.metadata?.birthDate,
          anniversaryDate: currentAnniversaryDate || profile.metadata?.anniversaryDate,
          metadata: profile.metadata
        };
        setUser(loggedUser);
        
        // If the user has a name and coupleId, they likely completed onboarding
        if (profile.name && currentCoupleId) {
          localStorage.setItem('onboarding_completed', 'true');
        }
        
        fetchPartnerProfile(loggedUser.id, loggedUser.coupleId);
        connectSocket(loggedUser.coupleId);
        return { success: true };
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        return { success: false, error: error?.message || 'Unknown error' };
      } finally {
        fetchProfilePromiseRef.current = null;
        setLoading(false);
      }
    })();

    fetchProfilePromiseRef.current = fetchPromise;
    return fetchPromise;
  };

  const updateMetadata = async (newMetadata: any): Promise<void> => {
    if (!user || !user.id) return;
    
    try {
      const mergedMetadata = { ...(user.metadata || {}), ...newMetadata };
      const { error } = await supabase
        .from('profiles')
        .update({ metadata: mergedMetadata })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshUser();
    } catch (e) {
      console.error('Error updating metadata:', e);
      throw e;
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

  const login = async (email: string, password?: string) => {
    console.log('Attempting login for:', email);
    if (!password) throw new Error('A senha é obrigatória.');
    
    // Clear any stale local storage data from previous sessions
    localStorage.removeItem('user_profile');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('partner_code');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }
    
    console.log('Login successful, session:', data.session);
    if (data.session?.user) {
      const result = await fetchUserProfile(data.session.user.id);
      if (!result.success) {
        throw new Error(`Failed to fetch user profile: ${result.error || 'Unknown error'}. Please try again.`);
      }
    }
  };

  /**
   * Registers a new user and optionally links them to a partner.
   */
  const register = async (name: string, email: string, partnerCode?: string, password?: string, customCoupleCode?: string) => {
    if (!password) throw new Error('A senha é obrigatória.');

    // Clear any stale local storage data from previous sessions
    localStorage.removeItem('user_profile');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('partner_code');

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
      throw authError;
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
        const codeToUse = customCoupleCode || generateCode();
        
        const { data: newCouple, error: newCoupleError } = await supabase
          .from('couples')
          .insert([{ couple_code: codeToUse }])
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
        const result = await fetchUserProfile(authData.user.id);
        if (!result.success) {
          throw new Error(`Failed to fetch user profile after registration: ${result.error || 'Unknown error'}. Please try logging in.`);
        }
      }
    }

    // Fetch the couple code to return it
    let coupleCode = null;
    if (coupleId) {
      const { data: couple } = await supabase
        .from('couples')
        .select('couple_code')
        .eq('id', coupleId)
        .single();
      if (couple) {
        coupleCode = couple.couple_code;
      }
    }

    return { ...authData.user, coupleCode };
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
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      localStorage.removeItem('naumdito_api_keys');
    }
  };

  /**
   * Resizes an image file to a maximum width/height while maintaining aspect ratio.
   */
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress to 80% quality JPEG
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
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

      let finalUrl = '';

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.warn('Upload to bucket failed, falling back to base64:', uploadError.message);
        // Fallback to base64 with resizing to prevent payload too large errors
        finalUrl = await resizeImage(file, 800, 800);
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        finalUrl = publicUrl;
      }

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: finalUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile Update Error Details:', updateError);
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }

      setUser({ ...user, photoUrl: finalUrl });
    } catch (error: any) {
      console.error('Error updating photo:', error);
      throw new Error(error.message || 'Erro ao atualizar a foto. Tente novamente.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, partner, login, logout, register, updatePhoto, updateMetadata, refreshUser, isAuthenticated: !!user, channel, loading }}>
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
