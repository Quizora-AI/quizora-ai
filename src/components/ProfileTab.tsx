
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarSection } from "./profile/AvatarSection";
import { ProfileForm } from "./profile/ProfileForm";
import { DeleteAccountSection } from "./profile/DeleteAccountSection";
import { useProfile } from "@/hooks/useProfile";
import { LogoutButton } from "./profile/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function ProfileTab() {
  const { profile, loading, fetchProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  console.log("ProfileTab render - loading:", loading, "profile:", profile);

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current auth session in ProfileTab:", data?.session);
      
      if (!data?.session) {
        toast({
          variant: "destructive", 
          title: "Not authenticated",
          description: "Please sign in to view your profile"
        });
        navigate("/auth");
      } else {
        // Refresh profile data if we're authenticated but have no profile
        if (!loading && !profile) {
          console.log("Authenticated but no profile, refreshing...");
          fetchProfile();
        }
      }
    };
    
    checkAuth();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </>
          ) : profile ? (
            <>
              <AvatarSection profile={profile} />
              <ProfileForm profile={profile} />
              <LogoutButton />
              <DeleteAccountSection profile={profile} />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Unable to load profile data. Please try signing in again.
              </p>
              <button 
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
