"use client";
import { useState, useEffect } from "react";
import EntropyLayout, { SystemData } from "@/components/entropy/EntropyLayout";

export default function DashboardDeployPage() {
  // 1. Setup State (Logic Only)
  const [data, setData] = useState<SystemData>({
    status: "IDLE", 
    phase: "READY", 
    logs: [], 
    vulnerabilities: [], 
    telemetry: { cpu: 10, memory: 20 }
  });
  const [isStarting, setIsStarting] = useState(false);

  // 2. Poll Backend for Status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/status");
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
        
        // Stop local loading spinner once backend confirms it's running
        if (json.status === "RUNNING") setIsStarting(false);
      } catch (e) {
        // Backend offline - keep retrying silently
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // 3. The "Pro" Deploy Function
  const handleDeploy = async (repoUrl: string) => {
    setIsStarting(true);
    
    // AUTH CHECK: Get the logged-in user ID
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?._id || user?.id;

    if (!userId) {
        alert("Authentication Error: Please log in again.");
        setIsStarting(false);
        return;
    }

    try {
      // Send User ID so the backend knows to run "Healer" + "DB Save"
      await fetch("http://127.0.0.1:8000/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            repo_url: repoUrl, 
            user_id: userId 
        })
      });
    } catch (e) {
      alert("Agent Offline. Is the Python backend running?");
      setIsStarting(false);
    }
  };

  // 4. Render the Shared Layout
  return (
    <EntropyLayout 
        data={data} 
        onDeploy={handleDeploy} 
        isStarting={isStarting} 
        mode="DASHBOARD" // <--- This enables the Green/Pro theme
    />
  );
}