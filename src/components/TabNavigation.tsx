
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { Settings, Book, Sparkles, ListChecks } from "lucide-react";

interface NavTabProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

function NavTab({ icon, label, href, active }: NavTabProps) {
  return (
    <Link
      to={href}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-sm font-medium
        ${active
          ? "bg-secondary text-secondary-foreground"
          : "hover:bg-secondary/50 text-muted-foreground"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export function TabNavigation({ onQuizGenerated }: { onQuizGenerated?: (questions: Question[]) => void }) {
  const location = useLocation();
  const pathname = location.pathname || "/";

  return (
    <div className="sticky top-[56px] z-10 bg-background/80 backdrop-blur-md border-b flex flex-col items-center pt-1 px-2">
      <div className="w-full max-w-screen-lg mx-auto flex overflow-x-auto">
        <NavTab
          icon={<Sparkles className="h-4 w-4" />}
          label="Generate"
          href="/quiz"
          active={pathname === "/quiz"}
        />
        <NavTab
          icon={<Book className="h-4 w-4" />}
          label="Flashcards"
          href="/flashcards"
          active={pathname === "/flashcards"}
        />
        <NavTab
          icon={<ListChecks className="h-4 w-4" />}
          label="History"
          href="/history"
          active={pathname === "/history"}
        />
        <NavTab
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          href="/settings"
          active={pathname === "/settings"}
        />
      </div>
    </div>
  );
}
