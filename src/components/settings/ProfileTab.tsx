
// ProfileTab handles the profile part of settings (login/register/logout/profile edit)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { User, Check } from "lucide-react";

export function ProfileTab({
  settings, setSettings, handleChange, saveSettings,
  isLoggedIn, supabaseUser, handleLogout, authLoading,
  errorMessage, setErrorMessage, handleLogin, setActiveTab,
}: any) {
  // Form UI logic for profile (edit/log-in/register)
  return (
    <motion.div variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }} className="space-y-6">
      {authLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isLoggedIn && supabaseUser ? (
        <>
          <motion.div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <h3 className="font-medium">Logged in as</h3>
              <p className="text-sm text-muted-foreground">{supabaseUser.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">Log Out</Button>
          </motion.div>
          <motion.div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              name="name"
              value={settings.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </motion.div>
          <motion.div className="pt-4">
            <Button onClick={saveSettings}>Save Profile</Button>
          </motion.div>
        </>
      ) : (
        <form onSubmit={handleLogin}>
          <motion.div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                type="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-4">
              <Button type="submit" className="w-full">Sign In</Button>
              <div className="flex justify-between">
                <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("register")} type="button">
                  Register
                </Button>
                <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("forgot")} type="button">
                  Forgot password?
                </Button>
              </div>
              {errorMessage && (
                <div className="text-red-500 text-center text-sm">{errorMessage}</div>
              )}
            </div>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
