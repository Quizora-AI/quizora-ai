
import { motion } from "framer-motion";
import { LegalPages } from "@/components/LegalPages";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const LegalContentWrapper = () => {
  const navigate = useNavigate();
  
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  // The email needs to be updated in LegalPages.tsx which is a read-only file
  // We'll leave a note about this below

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Button>
      </div>
      
      <LegalPages />
      
      {/* Email update info - since we can't edit LegalPages.tsx directly */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border/50">
        <h3 className="font-medium mb-2">Contact Information Update</h3>
        <p>For the most current contact information, please email us at: <a href="mailto:quizoraaihelp@gmail.com" className="text-primary underline">quizoraaihelp@gmail.com</a></p>
      </div>
    </motion.div>
  );
};
