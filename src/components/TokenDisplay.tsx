
import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function TokenDisplay() {
  const { balance, loading } = useTokens();
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
        onClick={() => navigate("/tokens")}
      >
        <Coins className="h-4 w-4 text-amber-600" />
        <AnimatePresence mode="wait">
          <motion.span
            key={balance}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="font-medium text-amber-800"
          >
            {loading ? "..." : balance}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
