"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Zap, Activity, Server, AlertTriangle, 
  Code, Check, Terminal, Pause, Play as PlayIcon, Loader2 
} from "lucide-react";
import InsightModal from "./InsightModal"; 

// --- TYPES ---
interface Vulnerability {
  name: string;
  type: string;
  severity: string;
  thought_signature: string;
  trigger_endpoint: string;
  diagram_code?: string;
  fix_explanation?: string;
}

interface SystemData {
  status: string; // IDLE, RUNNING, SECURE, FAILED
  phase: string;  // READY, STRATEGY, ATTACK, HEAL, VERIFY, COMPLETE
  logs: string[];
  vulnerabilities: Vulnerability[];
  telemetry: {
    cpu: number;
    memory: number;
  };
}

export default function Dashboard() {
  // --- STATE ---
  const [data, setData] = useState<SystemData>({
    status: "IDLE",
    phase: "READY",
    logs: [],
    vulnerabilities: [],
    telemetry: { cpu: 10, memory: 20 }
  });
  
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [repoUrl, setRepoUrl] = useState("https://github.com/mithielesh/entropy-target-dummy");
  const [autoScroll, setAutoScroll] = useState(true);
  
  // NEW: Local loading state for immediate button feedback
  const [isStarting, setIsStarting] = useState(false);
  
  // CHANGED: Use a ref for the container div instead of an element at the end
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---

  // 1. Poll the Backend API
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/status");
        if (!res.ok) throw new Error("Backend Offline");
        const json = await res.json();
        
        setData(json);

        // If backend reports running, we can turn off our local loading spinner
        if (json.status === "RUNNING") {
            setIsStarting(false);
        }
      } catch (e) {
        // Keep UI alive
      }
    }, 800); 
    return () => clearInterval(interval);
  }, []);

  // 2. SMART AUTO-SCROLL
  // Only scroll to bottom if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [data.logs, autoScroll]);

  // 3. SCROLL HANDLER (The Logic)
  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    
    // Check if the user is near the bottom (within 50px)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // Logic: 
    // - If user is at the bottom, ENABLE auto-scroll.
    // - If user scrolls up (leaves the bottom), DISABLE auto-scroll.
    if (isAtBottom) {
        if (!autoScroll) setAutoScroll(true);
    } else {
        if (autoScroll) setAutoScroll(false);
    }
  };

  // --- ACTIONS ---
  const deploy = async () => {
    setIsStarting(true); 
    setAutoScroll(true); // Force scroll to bottom on start
    try {
      await fetch("http://127.0.0.1:8000/deploy", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl })
      });
    } catch (e) {
      alert("Failed to connect to Agent API. Is 'uvicorn api:app' running?");
      setIsStarting(false);
    }
  };

  // --- RENDER HELPERS ---
  const getPhaseColor = (phase: string) => {
    if (phase === "ATTACK") return "text-red-500";
    if (phase === "HEAL") return "text-blue-500";
    if (phase === "COMPLETE" || phase === "SECURE") return "text-green-500";
    return "text-gray-500";
  };

  // Helper to check if we are in the "Building/Loading" phase
  const isLoadingPhase = (data.status === "RUNNING" || isStarting) && data.logs.length === 0;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-green-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-xl tracking-wide font-mono">
                ENTROPY<span className="text-green-500">.AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Autonomous Defense Platform</p>
            </div>
          </div>
          <PhaseIndicator phase={data.phase} />
        </div>
      </nav>

      {/* --- MAIN GRID --- */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* LEFT COLUMN: CONTROLS & TELEMETRY (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* DEPLOY CARD */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Server className="w-32 h-32" />
             </div>

             <h2 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Mission Control</h2>
             
             <div className="relative z-10">
                <div className="mb-4">
                   <label className="text-[10px] text-gray-600 block mb-1 font-mono">TARGET REPOSITORY</label>
                   <input 
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={data.status === "RUNNING" || isStarting}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-green-500 font-mono focus:outline-none focus:border-green-500/50 transition-colors placeholder-gray-700"
                      placeholder="https://github.com/..."
                   />
                </div>

                <button 
                  onClick={deploy}
                  disabled={data.status === "RUNNING" || isStarting}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                    ${data.status === "RUNNING" || isStarting
                      ? 'bg-gray-800 text-gray-500 border border-white/5 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02]'}`}
                >
                  {data.status === "RUNNING" || isStarting ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                  {isStarting ? "INITIALIZING..." : data.status === "RUNNING" ? "AGENT ACTIVE..." : "INITIATE AUDIT"}
                </button>
             </div>
          </div>

          {/* TELEMETRY GAUGES */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 tracking-wider">
              <Activity className="w-4 h-4" /> Live Threat Radar
            </h2>
            <div className="space-y-6">
              <Gauge 
                 label="CPU Load" 
                 value={data.telemetry.cpu} 
                 color={data.telemetry.cpu > 80 ? "bg-red-500" : "bg-green-500"} 
                 textColor={data.telemetry.cpu > 80 ? "text-red-500" : "text-green-500"}
              />
              <Gauge 
                 label="Memory Usage" 
                 value={data.telemetry.memory} 
                 color={data.telemetry.memory > 80 ? "bg-red-500" : "bg-blue-500"} 
                 textColor={data.telemetry.memory > 80 ? "text-red-500" : "text-blue-500"}
              />
            </div>
            <div className="mt-6 text-xs font-mono border-t border-white/5 pt-4">
               <p className={`flex items-center gap-2 ${getPhaseColor(data.phase)}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                  </span>
                  STATUS: {data.phase}
               </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: VULNERABILITY INSIGHTS (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               Security Insights
            </h2>
            <span className="text-xs bg-white/5 border border-white/5 px-2 py-1 rounded text-gray-400 font-mono">
               {data.vulnerabilities.length} Issues Detected
            </span>
          </div>

          <div className="space-y-4">
            {/* Empty State / Loading State */}
            {data.vulnerabilities.length === 0 && (
               <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-gray-600 bg-white/[0.02]">
                  {data.status === "RUNNING" || isStarting ? (
                     <div className="text-center">
                        <Activity className="w-8 h-8 mb-4 animate-pulse opacity-50 mx-auto text-green-500" />
                        <p className="font-mono text-sm text-green-500 animate-pulse">Scanning Codebase...</p>
                        <p className="text-xs text-gray-600 mt-2">Analyzing Architecture & Logic Flows</p>
                     </div>
                  ) : (
                     <>
                        <Shield className="w-8 h-8 mb-4 opacity-20" />
                        <p>System Secure. No active threats.</p>
                     </>
                  )}
               </div>
            )}

            {/* Cards */}
            <AnimatePresence>
              {data.vulnerabilities.map((vuln, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedVuln(vuln)}
                  className="group cursor-pointer bg-[#0F0F0F] border border-white/5 rounded-2xl p-5 hover:border-green-500/30 hover:bg-[#141414] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                       </div>
                       <div>
                         <h3 className="font-bold text-white text-sm group-hover:text-green-400 transition-colors">
                            {vuln.name}
                         </h3>
                         <p className="text-[10px] text-red-400 uppercase tracking-wide font-bold">
                            {vuln.type} • {vuln.severity || "HIGH"}
                         </p>
                       </div>
                    </div>
                    {data.phase === "COMPLETE" || data.phase === "SECURE" ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20">
                        <Check className="w-3 h-3" /> PATCHED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded-full border border-red-500/20 animate-pulse">
                        OPEN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 pl-1">
                    {vuln.thought_signature}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono bg-black/40 rounded p-2 border border-white/5">
                    <span>Endpoint: {vuln.trigger_endpoint}</span>
                    <div className="flex items-center gap-1 text-gray-400 group-hover:text-white transition-colors">
                       <Code className="w-3 h-3" />
                       <span>View Fix</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: EVENT LOG (3 cols) */}
        <div className="lg:col-span-3">
           <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl h-[calc(100vh-140px)] sticky top-24 flex flex-col overflow-hidden shadow-2xl">
              <div className="p-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                   <Terminal className="w-3 h-3" /> Live Logs
                 </div>
                 <button 
                    onClick={() => setAutoScroll(!autoScroll)} 
                    className={`p-1 rounded hover:bg-white/10 transition-colors ${autoScroll ? 'text-green-500' : 'text-yellow-500'}`}
                    title={autoScroll ? "Auto-scroll ON" : "Auto-scroll PAUSED"}
                 >
                    {autoScroll ? <Pause className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
                 </button>
              </div>
              
              <div 
                // CHANGED: Attached ref and handler here
                ref={logsContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 relative"
              >
                
                {/* BOOT SEQUENCE ANIMATION */}
                {isLoadingPhase && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
                     <div className="w-full max-w-[80%] space-y-2 font-mono text-xs">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-green-500">{">"} ESTABLISHING SECURE CONNECTION...</motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="text-green-500">{">"} PROVISIONING ISOLATED CONTAINER...</motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.6 }} className="text-blue-400">{">"} INJECTING SECURITY PROBES...</motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 2.5 }} className="mt-4 flex items-center gap-2 text-gray-400"><Loader2 className="w-3 h-3 animate-spin" /><span>WAITING FOR TARGET SYSTEM</span></motion.div>
                     </div>
                  </div>
                )}

                {data.logs.map((log, i) => (
                   <div key={i} className="text-[10px] font-mono break-words border-l-2 border-transparent pl-2 hover:border-white/10 py-1">
                      <span className={
                        log.includes("ERROR") ? "text-red-400" : 
                        log.includes("SUCCESS") || log.includes("COMPLETE") ? "text-green-400" : 
                        log.includes("PHASE") ? "text-blue-400 font-bold block mt-2 border-t border-white/10 pt-2" : 
                        "text-gray-400"
                      }>
                        {log}
                      </span>
                   </div>
                ))}
                {/* REMOVED: LogsEndRef div is no longer needed */}
              </div>
           </div>
        </div>
      </main>

      {/* --- DRILL DOWN MODAL --- */}
      <AnimatePresence>
        {selectedVuln && (
          <InsightModal 
            vuln={selectedVuln} 
            onClose={() => setSelectedVuln(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function Gauge({ label, value, color, textColor }: { label: string, value: number, color: string, textColor: string }) {
   return (
      <div>
        <div className="flex justify-between text-xs mb-2 font-mono">
          <span className="text-gray-500 uppercase">{label}</span>
          <span className={`${textColor} font-bold`}>{value}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ type: "spring", stiffness: 50 }}
            className={`h-full rounded-full ${color} shadow-[0_0_10px_currentColor]`}
          />
        </div>
      </div>
   );
}

function PhaseIndicator({ phase }: { phase: string }) {
  const steps = ["READY", "STRATEGY", "ATTACK", "HEAL", "VERIFY", "COMPLETE"];
  const currentIdx = steps.indexOf(phase === "RUNNING" ? "STRATEGY" : phase);
  
  return (
    <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5">
      {steps.map((step, i) => {
         const isActive = i === currentIdx;
         const isPast = i < currentIdx;
         return (
            <div key={step} className="flex items-center">
               <div className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all duration-500 ${isActive ? 'bg-white text-black shadow-lg scale-105' : isPast ? 'text-green-500' : 'text-gray-700'}`}>{step}</div>
               {i < steps.length - 1 && (<div className={`w-2 h-[1px] mx-1 ${isPast ? 'bg-green-500/50' : 'bg-white/5'}`} />)}
            </div>
         );
      })}
    </div>
  );
}
