"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Zap, Activity, Server, AlertTriangle, 
  Terminal, Pause, Play as PlayIcon, Loader2,
  ArrowLeft, Cpu 
} from "lucide-react";
import InsightModal from "@/components/InsightModal"; 

// --- TYPES ---
export interface Vulnerability {
  name: string;
  type: string;
  severity: string;
  thought_signature: string;
  trigger_endpoint: string;
  diagram_code?: string;
  fix_explanation?: string;
}

export interface SystemData {
  status: string;
  phase: string;
  logs: string[];
  vulnerabilities: Vulnerability[];
  telemetry: { cpu: number; memory: number };
}

interface EntropyLayoutProps {
  data: SystemData;
  onDeploy: (repoUrl: string) => Promise<void>;
  isStarting: boolean;
  mode: "LIGHTNING" | "DASHBOARD";
}

export default function EntropyLayout({ data, onDeploy, isStarting, mode }: EntropyLayoutProps) {
  const router = useRouter(); 
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [repoUrl, setRepoUrl] = useState("https://github.com/mithielesh/entropy-target-dummy");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // AUTO-SCROLL LOGIC
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [data.logs, autoScroll]);

  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (isAtBottom) !autoScroll && setAutoScroll(true);
    else autoScroll && setAutoScroll(false);
  };

  const isLoadingPhase = (data.status === "RUNNING" || isStarting) && data.logs.length === 0;

  // THEME CONFIGURATION
  const theme = mode === 'DASHBOARD' ? {
     accent: "text-purple-400",
     bgAccent: "bg-purple-500",
     borderAccent: "border-purple-500/30",
     shadowAccent: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
     gradient: "from-purple-600 to-indigo-600"
  } : {
     accent: "text-amber-400",
     bgAccent: "bg-amber-500",
     borderAccent: "border-amber-500/30",
     shadowAccent: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
     gradient: "from-amber-500 to-orange-600"
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-300 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            {/* --- UPDATED BACK BUTTON (Works for both) --- */}
            <button 
              onClick={() => router.push(mode === 'DASHBOARD' ? '/dashboard' : '/')}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors mr-2"
              title={mode === 'DASHBOARD' ? "Return to Command Center" : "Return Home"}
            >
              <ArrowLeft size={20} />
            </button>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.shadowAccent} bg-gradient-to-br ${theme.gradient}`}>
              {mode === 'LIGHTNING' ? <Zap className="w-5 h-5 text-white" /> : <Cpu className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
                ENTROPY
                <span className={`text-xs px-1.5 py-0.5 rounded border ${mode === 'LIGHTNING' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' : 'border-purple-500/30 bg-purple-500/10 text-purple-400'}`}>
                    {mode === 'LIGHTNING' ? 'LITE' : 'PRO'}
                </span>
              </h1>
            </div>
          </div>

          <PhaseIndicator phase={data.phase} theme={theme} />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        
        {/* LEFT COL: CONTROLS */}
        <div className="lg:col-span-3 space-y-6">
          {/* DEPLOY CARD */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 relative overflow-hidden group">
             <div className="relative z-10">
                <div className="mb-4">
                   <label className="text-[10px] text-gray-500 font-bold tracking-widest block mb-2">TARGET REPOSITORY</label>
                   <input 
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={data.status === "RUNNING" || isStarting}
                      className={`w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-opacity-50 transition-colors placeholder-gray-700 ${theme.accent} focus:${theme.borderAccent}`}
                      placeholder="https://github.com/..."
                   />
                </div>
                <button 
                  onClick={() => onDeploy(repoUrl)}
                  disabled={data.status === "RUNNING" || isStarting}
                  className={`w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300
                    ${data.status === "RUNNING" || isStarting
                      ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed' 
                      : `bg-white text-black hover:bg-gray-200 ${theme.shadowAccent} hover:scale-[1.02]`}`}
                >
                  {data.status === "RUNNING" || isStarting ? <Activity className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                  {isStarting ? "INITIALIZING..." : data.status === "RUNNING" ? "AGENT ACTIVE" : "INITIATE SCAN"}
                </button>
             </div>
          </div>

          {/* TELEMETRY */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <Activity className="w-4 h-4" /> System Telemetry
            </h2>
            <div className="space-y-6">
              <Gauge label="CPU Load" value={data.telemetry.cpu} color={data.telemetry.cpu > 80 ? "bg-red-500" : mode === 'DASHBOARD' ? "bg-purple-500" : "bg-amber-500"} />
              <Gauge label="Memory Usage" value={data.telemetry.memory} color={data.telemetry.memory > 80 ? "bg-red-500" : "bg-blue-500"} />
            </div>
          </div>
        </div>

        {/* CENTER COL: INSIGHT CARDS */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">Detected Anomalies</h2>
            <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded text-gray-400 font-mono">{data.vulnerabilities.length} Active</span>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {data.vulnerabilities.length === 0 && (
               <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl text-gray-600 bg-white/[0.01]">
                  {data.status === "RUNNING" || isStarting ? (
                     <div className="text-center">
                        <Activity className={`w-8 h-8 mb-4 animate-pulse opacity-50 mx-auto ${theme.accent}`} />
                        <p className={`font-mono text-sm animate-pulse ${theme.accent}`}>Analyzing Neural Pathways...</p>
                     </div>
                  ) : (
                     <>
                        <Shield className="w-8 h-8 mb-4 opacity-20" />
                        <p className="text-xs">System Secure. Waiting for target.</p>
                     </>
                  )}
               </div>
            )}
            <AnimatePresence>
              {data.vulnerabilities.map((vuln, i) => (
                <motion.div 
                  key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedVuln(vuln)}
                  className={`group cursor-pointer bg-[#0a0a0a] border border-white/5 rounded-xl p-5 hover:border-opacity-50 hover:bg-[#0f0f0f] transition-all duration-200 relative overflow-hidden ${mode === 'DASHBOARD' ? 'hover:border-purple-500' : 'hover:border-amber-500'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                       <div>
                          <h3 className="font-bold text-gray-200 text-sm group-hover:text-white transition-colors">{vuln.name}</h3>
                          <p className="text-[10px] text-red-400 uppercase tracking-wide font-bold">{vuln.type}</p>
                       </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${vuln.severity === 'CRITICAL' ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-orange-500/30 bg-orange-500/10 text-orange-400'}`}>
                        {vuln.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed pl-1 line-clamp-2 group-hover:text-gray-400">{vuln.thought_signature}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COL: LOGS */}
        <div className="lg:col-span-3">
           <div className="bg-[#0a0a0a] border border-white/10 rounded-xl h-[calc(100vh-120px)] sticky top-24 flex flex-col overflow-hidden shadow-2xl">
              <div className="p-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider"><Terminal className="w-3 h-3" /> Console Output</div>
                 <button onClick={() => setAutoScroll(!autoScroll)} className={`p-1 rounded hover:bg-white/10 ${autoScroll ? 'text-green-500' : 'text-yellow-500'}`}>
                    {autoScroll ? <Pause className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
                 </button>
              </div>
              
              <div ref={logsContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 relative font-mono text-[10px]">
                 {isLoadingPhase && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
                       <div className="w-full max-w-[80%] space-y-2">
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={theme.accent}>{">"} INITIALIZING HANDSHAKE...</motion.div>
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className={theme.accent}>{">"} ALLOCATING RESOURCES...</motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-4 flex items-center gap-2 text-gray-500"><Loader2 className="w-3 h-3 animate-spin" /><span>WAITING FOR AGENT</span></motion.div>
                       </div>
                    </div>
                 )}
                 {data.logs.map((log, i) => (
                    <div key={i} className="break-words border-l-2 border-transparent pl-2 hover:border-white/10 py-0.5 opacity-80 hover:opacity-100 transition-opacity">
                       <span className={log.includes("ERROR") ? "text-red-400" : log.includes("SUCCESS") || log.includes("COMPLETE") ? "text-green-400" : log.includes("PHASE") ? `${theme.accent} font-bold block mt-2 pt-2 border-t border-white/5` : "text-gray-500"}>{log}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedVuln && <InsightModal vuln={selectedVuln} onClose={() => setSelectedVuln(null)} />}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function Gauge({ label, value, color }: { label: string, value: number, color: string }) {
   return (
      <div>
        <div className="flex justify-between text-[10px] mb-1.5 font-mono text-gray-500 uppercase tracking-wider">
          <span>{label}</span>
          <span className="text-white">{value}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ type: "spring", stiffness: 50 }} className={`h-full rounded-full ${color} shadow-[0_0_8px_currentColor]`} />
        </div>
      </div>
   );
}

function PhaseIndicator({ phase, theme }: { phase: string, theme: any }) {
  const steps = ["READY", "STRATEGY", "ATTACK", "HEAL", "VERIFY", "COMPLETE"];
  const currentIdx = steps.indexOf(phase === "RUNNING" ? "STRATEGY" : phase);
  
  return (
    <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/5">
      {steps.map((step, i) => {
         const isActive = i === currentIdx;
         const isPast = i < currentIdx;
         return (
            <div key={step} className="flex items-center">
               <div className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest transition-all duration-500 ${isActive ? `bg-white text-black shadow-lg scale-105` : isPast ? `${theme.accent} opacity-80` : 'text-gray-700'}`}>{step}</div>
               {i < steps.length - 1 && (<div className={`w-2 h-[1px] mx-1 ${isPast ? 'bg-gray-600' : 'bg-white/5'}`} />)}
            </div>
         );
      })}
    </div>
  );
}