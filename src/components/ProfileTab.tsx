
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarSection } from "./profile/AvatarSection";
import { ProfileForm } from "./profile/ProfileForm";
import { DeleteAccountSection } from "./profile/DeleteAccountSection";
import { useProfile } from "@/hooks/useProfile";
import { LogoutButton } from "./profile/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileTab() {
  const { profile, loading } = useProfile();

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
          ) : (
            <>
              <AvatarSection profile={profile} loading={loading} />
              <ProfileForm profile={profile} />
              <LogoutButton />
              <DeleteAccountSection profile={profile} />
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
