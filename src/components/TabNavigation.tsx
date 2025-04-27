
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Question } from "@/components/FileUpload";
import { Settings, Book, Sparkles, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

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
      className="relative flex-1 min-w-0"
    >
      <motion.div
        className={`group flex items-center justify-center`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className={`
          relative w-full flex items-center justify-center gap-1.5 py-3 px-2
          ${active 
            ? "text-primary font-medium" 
            : "text-muted-foreground hover:text-foreground/80"
          }
        `}>
          <div className={`
            flex items-center gap-1.5 rounded-xl py-2 px-3
            backdrop-blur-sm backdrop-saturate-150
            ${active 
              ? "bg-primary/10 shadow-lg shadow-primary/20 scale-105 -translate-y-0.5" 
              : "hover:bg-muted/80"
            }
            transition-all duration-300 ease-out
            before:absolute before:inset-0 before:rounded-xl
            before:bg-gradient-to-b before:from-white/10 before:to-transparent
            before:opacity-50 before:transition-opacity
            hover:before:opacity-100
          `}>
            {icon}
            <span className="text-xs font-medium truncate">{label}</span>
          </div>
        </div>
      </motion.div>
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60"
          layoutId="activeTab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function TabNavigation({ onQuizGenerated }: { onQuizGenerated?: (questions: Question[]) => void }) {
  const location = useLocation();
  const pathname = location.pathname || "/";

  return (
    <div className="fixed top-[56px] left-0 right-0 z-50">
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="w-full max-w-screen-lg mx-auto px-1 flex">
          <NavTab
            icon={<Sparkles className="h-4 w-4" />}
            label="Generate"
            href="/quiz"
            active={pathname === "/quiz"}
          />
          <NavTab
            icon={<Book className="h-4 w-4" />}
            label="Cards"
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
    </div>
  );
}
