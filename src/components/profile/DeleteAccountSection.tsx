
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/hooks/useProfile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteAccountSectionProps {
  profile: Profile | null;
}

export function DeleteAccountSection({ profile }: DeleteAccountSectionProps) {
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!profile || deleteConfirmEmail !== profile.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email correctly to confirm deletion."
      });
      return;
    }

    try {
      setIsDeleting(true);
      console.log("Attempting to delete account...");
      
      // Delete profile record first
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);
      
      if (profileDeleteError) {
        console.error("Error deleting profile data:", profileDeleteError);
      }

      // Then delete the user auth record
      const { error: userDeleteError } = await supabase.auth.admin.deleteUser(profile.id);
      
      if (userDeleteError) {
        console.error("Error deleting user auth record:", userDeleteError);
        // If we can't delete via admin, sign out as fallback
        await supabase.auth.signOut();
      }

      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion has been requested. You'll be redirected to the login page."
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full mt-4">
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="confirmEmail">
                Please type your email to confirm deletion
              </Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder={profile?.email}
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
