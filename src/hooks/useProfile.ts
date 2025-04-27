
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getRandomAvatar } from "@/utils/avatarUtils";

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  email: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found in useProfile");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log("Creating new profile for user:", user.id);
          const randomAvatar = getRandomAvatar();
          const newProfile = {
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email || '',
            avatar_url: randomAvatar
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (insertError) throw insertError;
          
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile({
          id: user.id,
          name: data?.name || user.user_metadata?.name || '',
          avatar_url: data?.avatar_url || getRandomAvatar(),
          email: data?.email || user.email || ''
        });
      }
    } catch (error) {
      console.error('Error in useProfile:', error);
      // Don't show error toast here as it can be disruptive
      // Just log to console for debugging
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // Listen for auth state changes to update profile
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Auth state changed in useProfile:", event);
        // Use setTimeout to prevent potential deadlock with other auth listeners
        setTimeout(() => {
          fetchProfile();
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loading,
    fetchProfile
  };
}
