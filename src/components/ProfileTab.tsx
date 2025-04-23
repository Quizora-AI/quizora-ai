
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarSection } from "./profile/AvatarSection";
import { ProfileForm } from "./profile/ProfileForm";
import { DeleteAccountSection } from "./profile/DeleteAccountSection";
import { useProfile } from "@/hooks/useProfile";

export function ProfileTab() {
  const { profile, loading } = useProfile();

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
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarSection profile={profile} />
          <ProfileForm profile={profile} />
          <DeleteAccountSection profile={profile} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
