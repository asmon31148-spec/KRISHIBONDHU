'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface FarmerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  farm_area: number | null;
  farm_area_unit: string | null;
  preferred_language: 'en' | 'bn' | 'hi';
  primary_crops: string[];
  soil_type: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: FarmerProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  guestToken: string;
  guestScanCount: number;
  incrementGuestScan: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isGuest: true,
  guestToken: '',
  guestScanCount: 0,
  incrementGuestScan: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestToken, setGuestToken] = useState<string>('');
  const [guestScanCount, setGuestScanCount] = useState<number>(0);

  // Initialize or fetch persistent guest token
  useEffect(() => {
    try {
      let token = localStorage.getItem('krishibondhu_guest_token');
      if (!token) {
        token = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('krishibondhu_guest_token', token);
      }
      setGuestToken(token);

      const count = parseInt(localStorage.getItem('krishibondhu_guest_scans') || '0', 10);
      setGuestScanCount(count);
    } catch {
      // In private browsing or storage disabled
      setGuestToken('guest_temp_' + Math.random().toString(36).substring(2, 10));
    }
  }, []);

  const incrementGuestScan = useCallback(() => {
    setGuestScanCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('krishibondhu_guest_scans', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as FarmerProfile);
      }
    } catch (err) {
      console.error('Error fetching farmer profile:', err);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isGuest: !user,
        guestToken,
        guestScanCount,
        incrementGuestScan,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
