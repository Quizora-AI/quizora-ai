import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/App"; // Import the auth context

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Use the auth context
  
  // Redirect authenticated users to quiz page
  useEffect(() => {
    if (!loading && user) {
      navigate('/quiz');
    }
  }, [user, loading, navigate]);
  
  // If still loading, show a simple loading state
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary">Quizora AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-sm"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigate("/auth?tab=signup")}
              className="text-sm"
              size="sm"
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 px-4 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center md:text-left"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  Study Smarter with AI
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Upload your study materials and instantly generate quizzes and
                  flashcards powered by AI.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth?tab=signup")}
                    className="text-lg px-8 py-6"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="text-lg px-8 py-6"
                  >
                    Log In
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-video bg-card rounded-lg shadow-xl overflow-hidden border border-border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="/placeholder.svg" 
                      alt="Quizora AI Demo" 
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <p className="text-lg text-white font-medium">App Preview</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Quizora AI offers powerful learning tools to enhance your study experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border p-6 rounded-lg"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students who are studying smarter, not harder.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth?tab=signup")}
                className="text-lg px-8 py-6"
              >
                Start Learning with AI
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2023 Quizora AI. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button variant="link" size="sm" onClick={() => navigate("/legal?tab=terms")}>
                Terms of Service
              </Button>
              <Button variant="link" size="sm" onClick={() => navigate("/legal?tab=privacy")}>
                Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Keep existing features array
const features = [
  {
    icon: <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>,
    title: "AI-Generated Quizzes",
    description: "Upload any document and instantly create customized quizzes to test your knowledge."
  },
  {
    icon: <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
      <path d="M6 8h.01"></path>
      <path d="M12 8h.01"></path>
      <path d="M18 8h.01"></path>
      <path d="M6 12h.01"></path>
      <path d="M12 12h.01"></path>
      <path d="M18 12h.01"></path>
      <path d="M6 16h.01"></path>
      <path d="M12 16h.01"></path>
      <path d="M18 16h.01"></path>
    </svg>,
    title: "Smart Flashcards",
    description: "Create dynamic flashcard sets with our AI to enhance memorization and recall."
  },
  {
    icon: <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>,
    title: "Performance Analytics",
    description: "Track your progress with detailed analytics to identify strengths and areas for improvement."
  }
];
