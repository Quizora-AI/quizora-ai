
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Profile } from "@/components/ProfileTab";

interface AvatarSectionProps {
  profile: Profile | null;
}

export function AvatarSection({ profile }: AvatarSectionProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        {profile?.avatar_url ? (
          <AvatarImage src={profile.avatar_url} alt={profile.name || ''} />
        ) : (
          <AvatarFallback className="text-xl font-medium bg-primary/10 text-primary">
            {profile?.name?.charAt(0) || profile?.email?.charAt(0) || '?'}
          </AvatarFallback>
        )}
      </Avatar>
      {profile?.name && (
        <h3 className="text-lg font-medium">{profile.name}</h3>
      )}
    </div>
  );
}
