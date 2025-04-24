
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Profile } from "@/hooks/useProfile";
import { getRandomAvatar } from "@/utils/avatarUtils";

interface AvatarSectionProps {
  profile: Profile | null;
}

export function AvatarSection({ profile }: AvatarSectionProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 border-2 border-primary/20 ring-2 ring-primary/10">
        {profile?.avatar_url ? (
          <AvatarImage 
            src={profile.avatar_url} 
            alt={profile?.name || 'Avatar'}
            className="object-contain p-1"
          />
        ) : (
          <AvatarFallback className="text-xl font-medium bg-primary/10 text-primary">
            {profile?.name?.charAt(0) || profile?.email?.charAt(0) || '?'}
          </AvatarFallback>
        )}
      </Avatar>
      {profile?.name && (
        <h3 className="text-lg font-medium">{profile.name}</h3>
      )}
      {profile?.email && (
        <p className="text-sm text-muted-foreground">{profile.email}</p>
      )}
    </div>
  );
}
