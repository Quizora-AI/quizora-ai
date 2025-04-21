
// PreferencesTab for settings (course input, difficulty, etc.)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

export function PreferencesTab({ settings, handleChange, updateSetting, saveSettings }: any) {
  return (
    <motion.div className="space-y-6">
      <motion.div>
        <Label className="block mb-3">Course</Label>
        <Input
          id="course"
          name="course"
          value={settings.course}
          onChange={handleChange}
          placeholder="Enter your course or field of study"
        />
        <p className="text-sm text-muted-foreground mt-2">
          This helps personalize quiz questions and assistant responses
        </p>
      </motion.div>
      <motion.div>
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
      <motion.div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="autoSave">Auto-save quiz results</Label>
          <p className="text-sm text-muted-foreground">
            Automatically save quiz results to history
          </p>
        </div>
        <input
          id="autoSave"
          type="checkbox"
          checked={settings.autoSave}
          onChange={e => updateSetting('autoSave', e.target.checked)}
        />
      </motion.div>
      <motion.div className="pt-4">
        <Button onClick={saveSettings}>Save Preferences</Button>
      </motion.div>
    </motion.div>
  );
}
