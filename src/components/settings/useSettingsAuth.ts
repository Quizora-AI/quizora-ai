
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const savedAutoSave = localStorage.getItem("autoSave");
    if (savedAutoSave !== null) {
      setSettings((prev: any) => ({
        ...prev,
        autoSave: savedAutoSave !== "false"
      }));
    }
    const historyStr = localStorage.getItem("quizHistory");
    if (historyStr) setQuizHistory(JSON.parse(historyStr));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      setAuthLoading(false);
      if (session?.user) {
        setTimeout(() => fetchUserProfile(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      setAuthLoading(false);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

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
      // Console log on fail
      console.error("Error fetching user profile:", e);
    }
  };

  return {
    settings, setSettings, activeTab, setActiveTab,
    isLoggedIn, setIsLoggedIn, quizHistory, setQuizHistory,
    supabaseUser, setSupabaseUser, supabaseSession, setSupabaseSession,
    authLoading, setAuthLoading
  };
}
