
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Profile } from "@/hooks/useProfile";

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={profile?.name || ''}
          disabled
          className="bg-muted"
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
        <p className="text-xs text-muted-foreground">Account email address</p>
      </div>
    </div>
  );
}
