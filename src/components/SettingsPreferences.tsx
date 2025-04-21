
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SettingsPreferencesProps {
  settings: {
    course: string;
    autoSave: boolean;
    difficulty: "easy" | "medium" | "hard";
  };
  updateSetting: (key: string, value: any) => void;
  saveSettings: () => void;
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

export function SettingsPreferences({ settings, updateSetting, saveSettings }: SettingsPreferencesProps) {
  return (
    <motion.div 
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Label htmlFor="course" className="block mb-3">Course</Label>
        <Input 
          id="course" 
          value={settings.course}
          onChange={(e) => updateSetting('course', e.target.value)}
          placeholder="Enter your course or subject (e.g. Chemistry, History, Programming)"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Enter the course or subject you'd like to study
        </p>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Label className="block mb-3">Default Difficulty</Label>
        <RadioGroup 
          value={settings.difficulty}
          onValueChange={(value: "easy" | "medium" | "hard") => updateSetting('difficulty', value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="easy" id="easy" />
            <Label htmlFor="easy">Easy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="hard" />
            <Label htmlFor="hard">Hard</Label>
          </div>
        </RadioGroup>
      </motion.div>
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="autoSave">Auto-save quiz results</Label>
          <p className="text-sm text-muted-foreground">
            Automatically save quiz results to history
          </p>
        </div>
        <Switch 
          id="autoSave" 
          checked={settings.autoSave} 
          onCheckedChange={(checked) => updateSetting('autoSave', checked)}
        />
      </motion.div>
      <motion.div variants={itemVariants} className="pt-4">
        <Button onClick={saveSettings}>Save Preferences</Button>
      </motion.div>
    </motion.div>
  );
}
