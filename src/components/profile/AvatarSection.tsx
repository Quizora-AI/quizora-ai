
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Profile } from "@/components/ProfileTab";

interface AvatarSectionProps {
  profile: Profile | null;
}

export function AvatarSection({ profile }: AvatarSectionProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        {profile?.avatar_url ? (
          <AvatarImage src={profile.avatar_url} alt={profile.name || ''} />
        ) : (
          <AvatarFallback>
            {profile?.name?.charAt(0) || profile?.email?.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
}
