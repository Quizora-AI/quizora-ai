
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSection } from "./profile/AvatarSection";
import { ProfileForm } from "./profile/ProfileForm";
import { DeleteAccountSection } from "./profile/DeleteAccountSection";

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  email: string;
}

export function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

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

      console.log("Fetched user:", user);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            name: user.user_metadata?.name || '',
            email: user.email || '',
            avatar_url: null
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);
            
          if (insertError) {
            throw insertError;
          }
          
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile({
          id: user.id,
          name: data.name || user.user_metadata?.name || '',
          avatar_url: data.avatar_url,
          email: data.email || user.email || ''
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

  const updateProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again."
      });
    }
  };

  const handleUpdateProfile = (field: keyof Profile, value: string) => {
    setProfile(prev => prev ? {...prev, [field]: value} : null);
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading profile...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarSection profile={profile} />
          <ProfileForm 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSave={updateProfile}
          />
          <DeleteAccountSection profile={profile} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
