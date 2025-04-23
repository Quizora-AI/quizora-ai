
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Profile } from "@/hooks/useProfile";

interface ProfileFormProps {
  profile: Profile | null;
  onUpdateProfile: (field: keyof Profile, value: string) => void;
  onSave: () => void;
}

export function ProfileForm({ profile, onUpdateProfile }: ProfileFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={profile?.name || ''}
          onChange={(e) => onUpdateProfile('name', e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={profile?.email || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>
    </div>
  );
}
