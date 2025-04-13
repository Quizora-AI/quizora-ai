
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileUpload } from "@/components/FileUpload";
import { motion } from "framer-motion";
import { BookOpen, History, Award, Settings, FileUp, BarChart } from "lucide-react";
import { Question } from "@/components/FileUpload";

interface TabNavigationProps {
  onFileProcessed: (questions: Question[]) => void;
}

export function TabNavigation({ onFileProcessed }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState("upload");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Tabs
      defaultValue="upload"
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full max-w-4xl mx-auto"
    >
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          <span>Upload</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>History</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </TabsTrigger>
      </TabsList>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={tabVariants}
        key={activeTab}
        className="w-full"
      >
        <TabsContent value="upload" className="mt-0">
          <FileUpload onFileProcessed={onFileProcessed} />
        </TabsContent>
        <TabsContent value="history" className="mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Quiz History</h2>
            <p className="text-muted-foreground">Your past quizzes will appear here.</p>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Performance Analytics</h2>
            <p className="text-muted-foreground">Your analytics dashboard will appear here.</p>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Application settings will appear here.</p>
          </div>
        </TabsContent>
      </motion.div>
    </Tabs>
  );
}
