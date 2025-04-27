
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coin } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { Button } from '@/components/ui/button';

export function TokenDisplay() {
  const { tokenBalance, isPremium, checkTokenBalance } = useTokens();
  const [showLabel, setShowLabel] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initial balance check
    checkTokenBalance();
    
    // Set up interval to check balance periodically
    const interval = setInterval(() => {
      checkTokenBalance();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkTokenBalance]);
  
  // Hide for premium users
  if (isPremium) return null;
  
  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onTouchStart={() => setShowLabel(true)}
      onTouchEnd={() => setShowLabel(false)}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="relative group flex items-center gap-1.5 p-1.5 pr-2.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10"
        onClick={() => navigate('/tokens')}
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-1.5 shadow-inner">
          <Coin className="h-4 w-4 text-white" />
        </div>
        <span className="font-medium text-sm">{tokenBalance}</span>
      </Button>
      
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-50"
        >
          Get Tokens
        </motion.div>
      )}
    </motion.div>
  );
}
