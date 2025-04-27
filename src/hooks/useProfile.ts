
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
      console.log("Fetching profile...");
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching auth user:", userError);
        throw userError;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setLoading(false);
        return;
      }
      
      console.log("Auth user found:", user.id, user.email);

      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log("Profile fetch response:", { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      // If no profile exists, create one
      if (!data || error?.code === 'PGRST116') {
        console.log("No profile found, creating new profile");
        const randomAvatar = getRandomAvatar();
        const newProfile = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          email: user.email || '',
          avatar_url: randomAvatar
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
        
        console.log("New profile created:", newProfile);
        setProfile(newProfile);
      } else {
        // Profile exists, set it
        console.log("Existing profile found:", data);
        setProfile({
          id: user.id,
          name: data?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          avatar_url: data?.avatar_url || getRandomAvatar(),
          email: data?.email || user.email || ''
        });
      }
    } catch (error) {
      console.error('Error in profile flow:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we're on a page that needs the profile data
    const checkAndFetchProfile = async () => {
      // Get session to check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session:", sessionData?.session);
      
      if (sessionData?.session) {
        fetchProfile();
      } else {
        console.log("No active session, skipping profile fetch");
        setLoading(false);
      }
    };
    
    checkAndFetchProfile();
  }, []);

  // Add listener for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Only call fetchProfile on next tick to avoid Supabase auth deadlocks
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
