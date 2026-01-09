import { useState, useEffect } from "react";
import mermaid from "mermaid";
import { X, Play, Code, Activity, Image as ImageIcon, CheckCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Mermaid
mermaid.initialize({ startOnLoad: true, theme: 'dark' });

export default function InsightModal({ vuln, onClose }: { vuln: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("anatomy");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Render diagram when tab opens
  useEffect(() => {
    if (activeTab === "anatomy" && vuln.diagram_code) {
      setTimeout(() => {
        mermaid.contentLoaded();
      }, 100);
    }
  }, [activeTab, vuln]);

  // SIMULATE VIDEO GENERATION
  const handleGenerateVideo = () => {
    setVideoLoading(true);
    // Fake a 3.5 second processing time
    setTimeout(() => {
        setVideoLoading(false);
        setVideoReady(true);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#141414]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {vuln.severity || "CRITICAL"}
              </span>
              <span className="text-gray-400 text-xs font-mono">{vuln.type}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{vuln.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          <TabButton id="anatomy" label="Anatomy" icon={Activity} active={activeTab} set={setActiveTab} />
          <TabButton id="fix" label="The Fix" icon={Code} active={activeTab} set={setActiveTab} />
          <TabButton id="concept" label="Concept & Video" icon={ImageIcon} active={activeTab} set={setActiveTab} />
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto min-h-[400px]">
          
          {/* TAB 1: ANATOMY (Diagram) */}
          {activeTab === "anatomy" && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                {vuln.thought_signature}
              </p>
              <div className="bg-black/50 p-6 rounded-xl border border-white/5 flex justify-center">
                <div className="mermaid">
                  {vuln.diagram_code || `
                    sequenceDiagram
                    participant Attacker
                    participant API
                    participant Database
                    Attacker->>API: Send Malicious Payload
                    API->>Database: Query without validation
                    Database-->>API: Return Sensitive Data
                    API-->>Attacker: Data Leak Confirmed
                  `}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE FIX (Mock Diff for Demo) */}
          {activeTab === "fix" && (
            <div className="space-y-4 font-mono text-sm">
              <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
                <div className="text-xs text-red-400 mb-2 font-bold uppercase">- VULNERABLE CODE</div>
                <code className="text-red-200 block opacity-70">
                   {/* Fallback code snippets if no real code logic is connected yet */}
                   private int inventory = 100; <br/>
                   if (inventory &gt; 0) inventory--;
                </code>
              </div>
              <div className="flex justify-center">
                <div className="h-8 w-[1px] bg-white/10"></div>
              </div>
              <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg">
                <div className="text-xs text-green-400 mb-2 font-bold uppercase">+ PATCHED CODE</div>
                <code className="text-green-200 block">
                   private AtomicInteger inventory = new AtomicInteger(100); <br/>
                   inventory.decrementAndGet();
                </code>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                 <div className="text-xs text-blue-400 mb-1 font-bold uppercase">AI ARCHITECT NOTE</div>
                 <p className="text-xs text-blue-200">
                    {vuln.fix_explanation || "The system replaced the non-thread-safe integer with an Atomic wrapper to prevent race conditions during concurrent access."}
                 </p>
              </div>
            </div>
          )}

          {/* TAB 3: CONCEPT & VIDEO */}
          {activeTab === "concept" && (
            <div className="text-center space-y-8 py-4">
              
              {!videoReady ? (
                  // STATE A: BEFORE GENERATION
                  <>
                    <div className="mx-auto w-64 h-40 bg-gradient-to-tr from-gray-800 to-gray-900 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <Activity className="w-12 h-12 text-gray-600 group-hover:text-green-500 transition-colors duration-500" />
                        <span className="absolute bottom-3 text-xs text-gray-500">AI Concept Visualization</span>
                    </div>
                    
                    <div className="max-w-md mx-auto">
                        <h3 className="text-white font-bold mb-2">Generate Video Lesson</h3>
                        <p className="text-gray-400 text-sm mb-6">
                        Create a personalized 30-second explanation video for <strong>{vuln.name}</strong>.
                        </p>
                        <button 
                        onClick={handleGenerateVideo}
                        disabled={videoLoading}
                        className={`bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors ${videoLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                        {videoLoading ? <Activity className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        {videoLoading ? "RENDERING VIDEO..." : "GENERATE LESSON"}
                        </button>
                        {videoLoading && (
                        <div className="mt-4 space-y-1">
                            <p className="text-xs text-green-500 animate-pulse">Analyzing Code Logic...</p>
                            <div className="w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
                                <motion.div 
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3.5 }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </div>
                        )}
                    </div>
                  </>
              ) : (
                  // STATE B: VIDEO READY
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                     <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] bg-black">
                        {/* Fake Video Player Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
                             <span className="text-[10px] font-bold bg-green-500 text-black px-2 py-1 rounded">AI GENERATED</span>
                        </div>
                        
                        {/* Placeholder Tech Video */}
                        <video 
                            autoPlay 
                            loop 
                            muted 
                            className="w-full h-auto opacity-80"
                            poster="https://media.istockphoto.com/id/1339466666/vector/cyber-security-background-padlock-lock-security-system-concept-combination-lock-security.jpg?s=612x612&w=0&k=20&c=M0r0oXfWf6-O3vT8xJ8r8xJ8r8xJ8r8xJ8r8xJ8r8xJ8"
                        >
                             {/* A generic abstract tech background video */}
                             <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-lines-996-large.mp4" type="video/mp4" />
                        </video>

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             {/* Keep it clean, the video is autoplaying muted */}
                        </div>
                     </div>

                     <div className="flex items-center justify-center gap-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                            <Download className="w-4 h-4" /> SAVE MP4
                        </button>
                        <span className="text-gray-600">|</span>
                        <div className="flex items-center gap-2 text-xs text-green-500">
                             <CheckCircle className="w-4 h-4" /> Lesson Ready
                        </div>
                     </div>
                  </motion.div>
              )}

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ id, label, icon: Icon, active, set }: any) {
  return (
    <button 
      onClick={() => set(id)}
      className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
        active === id ? "border-green-500 text-green-400" : "border-transparent text-gray-500 hover:text-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}