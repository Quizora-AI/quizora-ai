
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsAuthState {
  settings: any;
  setSettings: React.Dispatch<any>;
  activeTab: string;
  setActiveTab: React.Dispatch<string>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<boolean>;
  quizHistory: any[];
  setQuizHistory: React.Dispatch<any[]>;
  supabaseUser: any;
  setSupabaseUser: React.Dispatch<any>;
  supabaseSession: any;
  setSupabaseSession: React.Dispatch<any>;
  authLoading: boolean;
  setAuthLoading: React.Dispatch<boolean>;
}

export function useSettingsAuth(defaultTab: string = "profile"): SettingsAuthState {
  const [settings, setSettings] = useState<any>({
    name: "",
    email: "",
    course: "",
    autoSave: true,
    theme: "system",
    difficulty: "medium",
    isPremium: false
  });
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();

  // Get stored settings on init
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Error parsing stored settings:", e);
      }
    }
    
    const savedAutoSave = localStorage.getItem("autoSave");
    if (savedAutoSave !== null) {
      setSettings((prev: any) => ({
        ...prev,
        autoSave: savedAutoSave !== "false"
      }));
    }
    
    const historyStr = localStorage.getItem("quizHistory");
    if (historyStr) {
      try {
        setQuizHistory(JSON.parse(historyStr));
      } catch (e) {
        console.error("Error parsing stored quiz history:", e);
      }
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      
      if (session?.user) {
        // Defer profile fetch with setTimeout to avoid Supabase deadlock
        setTimeout(() => fetchUserProfile(session.user.id), 0);
      } else {
        setAuthLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile data from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setSettings((prev: any) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          course: data.course || prev.course,
          isPremium: data.isPremium || false
        }));
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
      toast({
        title: "Profile Error",
        description: "Could not load your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    settings, setSettings, activeTab, setActiveTab,
    isLoggedIn, setIsLoggedIn, quizHistory, setQuizHistory,
    supabaseUser, setSupabaseUser, supabaseSession, setSupabaseSession,
    authLoading, setAuthLoading
  };
}
