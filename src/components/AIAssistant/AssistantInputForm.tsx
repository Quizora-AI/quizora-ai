
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";

interface AssistantInputFormProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isPremium: boolean;
}

export function AssistantInputForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  isPremium,
}: AssistantInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full flex gap-2">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={isPremium ? "Ask about any subject..." : "Upgrade to premium to use Quizora Assistant"}
        className="flex-1"
        disabled={isLoading || !isPremium}
      />
      <Button type="submit" disabled={isLoading || !value.trim() || !isPremium}>
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <SendHorizonal className="h-5 w-5" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
