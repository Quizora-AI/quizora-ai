
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Shield, Mail, FileText } from "lucide-react";

export function LegalPages() {
  const pages = [
    {
      title: "About Us",
      icon: Info,
      description: "Learn more about Quizora AI and our mission",
      content: `Quizora AI is an advanced quiz generation platform powered by artificial intelligence. 
      We aim to revolutionize learning by providing personalized quizzes across various subjects and courses. 
      Our platform adapts to each student's needs, offering targeted practice and insights for improvement.`
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      description: "How we handle and protect your data",
      content: `We respect your privacy and are committed to protecting your personal data. 
      We only collect necessary information to provide our services and improve your experience. 
      Your quiz data is used to personalize your learning experience and provide analytics insights. 
      We never share your personal information with third parties without your explicit consent.`
    },
    {
      title: "Contact Us",
      icon: Mail,
      description: "Get in touch with our team",
      content: `Email: support@quizora.ai
      Response Time: Within 24 hours
      
      We're here to help with any questions about:
      - Technical support
      - Feature requests
      - Account assistance
      - General inquiries`
    },
    {
      title: "Terms of Service",
      icon: FileText,
      description: "Our service terms and conditions",
      content: `By using Quizora AI, you agree to our terms of service. 
      Our platform is provided as-is, and we reserve the right to modify features and pricing. 
      Users must not misuse the platform or attempt to access it through unauthorized means. 
      We maintain intellectual property rights over the platform and its content generation capabilities.`
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-6 p-6"
    >
      {pages.map((page) => (
        <motion.div key={page.title} variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <page.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{page.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {page.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="prose dark:prose-invert max-w-none">
                {page.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
