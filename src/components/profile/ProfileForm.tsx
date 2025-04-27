
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  if (!profile) return null;
  
  const handleUpdate = async () => {
    if (!profile) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        {isEditing ? (
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
          />
        ) : (
          <Input
            id="name"
            value={profile?.name || ''}
            disabled
            className="bg-muted"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={profile?.email || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Account email address</p>
      </div>
      
      {isEditing ? (
        <div className="flex gap-2">
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              setName(profile?.name || '');
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(true)}
        >
          Edit profile
        </Button>
      )}
    </div>
  );
}
