
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
      content: `Quizora AI is an intelligent quiz generation platform powered by artificial intelligence. 
      Our mission is to make learning more interactive and personalized through custom-generated quizzes.
      
      We use advanced AI to analyze your study materials and create targeted questions that help reinforce learning.
      
      Quizora AI works across all subjects and difficulty levels, making it perfect for students, educators, and lifelong learners.
      
      Our platform features include:
      • AI-powered quiz generation from your content
      • Detailed performance analytics and insights
      • Personalized learning recommendations
      • Flashcard study tools`
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      description: "How we handle and protect your data",
      content: `Last Updated: April 24, 2025

      At Quizora AI, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
      
      INFORMATION WE COLLECT:
      • Account information (email, name)
      • Quiz data and performance metrics
      • Usage statistics and app interactions
      • Device and technical information
      
      HOW WE USE YOUR DATA:
      • To provide and improve our quiz generation service
      • To create personalized learning experiences
      • To analyze app performance and user behavior
      • To communicate important updates
      
      DATA PROTECTION:
      We implement industry-standard security measures to protect your information. Your data is encrypted and stored securely.
      
      THIRD PARTIES:
      We do not sell your personal information. We may share anonymous, aggregated data with analytics partners.
      
      USER RIGHTS:
      You can access, correct, or delete your personal information at any time through your account settings.
      
      CONTACT:
      For privacy concerns, contact quizoraaihelp@gmail.com`
    },
    {
      title: "Contact Us",
      icon: Mail,
      description: "Get in touch with our team",
      content: `We'd love to hear from you! Here's how to reach the Quizora AI team:

      EMAIL:
      quizoraaihelp@gmail.com
      (Response within 24-48 hours)
      
      FEEDBACK & SUPPORT:
      For technical issues, feature requests, or general inquiries, please email us with a detailed description.
      
      FOR EDUCATORS & INSTITUTIONS:
      We offer special programs for schools and educational institutions. Contact us for partnership opportunities.
      
      BUSINESS INQUIRIES:
      For partnership or business opportunities, please include "Business Inquiry" in your email subject line.
      
      FOLLOW US:
      Stay updated with our latest features and improvements through our social media channels.`
    },
    {
      title: "Terms of Service",
      icon: FileText,
      description: "Our service terms and conditions",
      content: `Last Updated: April 24, 2025

      Welcome to Quizora AI. By using our app, you agree to these Terms of Service.
      
      ACCOUNT TERMS:
      • You must provide accurate information when creating an account
      • You are responsible for maintaining the security of your account
      • You must be 13 years or older to use this service
      
      ACCEPTABLE USE:
      • You may not use our service for illegal purposes
      • You may not attempt to reverse engineer the app or its AI systems
      • You may not upload harmful content or material that violates intellectual property laws
      
      CONTENT OWNERSHIP:
      • You retain ownership of any content you upload to the app
      • We claim no ownership over your study materials or created quizzes
      • You grant us license to use your content to provide our services
      
      SERVICE AVAILABILITY:
      • We strive for 99.9% uptime but do not guarantee uninterrupted service
      • We reserve the right to modify features or terminate accounts that violate our terms
      
      LIMITATION OF LIABILITY:
      • Quizora AI is provided "as is" without warranties
      • We are not liable for any damages resulting from the use of our service
      
      CHANGES TO TERMS:
      • We may update these terms with reasonable notice
      • Continued use after changes constitutes acceptance of the new terms`
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
                  <p key={index} className={`text-muted-foreground ${index > 0 ? "mt-4" : ""}`}>
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
