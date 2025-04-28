
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SettingsPanel } from "@/components/SettingsPanel";

const Settings = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Settings page mounted");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 pb-28">
        <SettingsPanel />
      </main>
    </div>
  );
};

export default Settings;
