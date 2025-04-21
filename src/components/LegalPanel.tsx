
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Info } from "lucide-react";
import { motion } from "framer-motion";

interface LegalPanelProps {
  navigate: (path: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function LegalPanel({ navigate }: LegalPanelProps) {
  return (
    <motion.div 
      variants={containerVariants}
      className="space-y-4"
    >
      <motion.div variants={itemVariants}>
        <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=about')}>
          <span>About Quizora AI</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=privacy')}>
          <span>Privacy Policy</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=terms')}>
          <span>Terms of Service</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button variant="outline" className="w-full flex justify-between" onClick={() => navigate('/legal?page=contact')}>
          <span>Contact Us</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div variants={itemVariants} className="pt-4">
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Quizora AI</h3>
              <p className="text-sm text-muted-foreground mb-2">Version 1.0.1</p>
              <p className="text-sm text-muted-foreground">© 2025 Quizora AI. All rights reserved.</p>
              <p className="text-sm text-muted-foreground mt-2">Email: quizoraaihelp@gmail.com</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
