
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found. Please log in again."
        });
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
      console.error('Error fetching profile:', error);
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
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    fetchProfile
  };
}
