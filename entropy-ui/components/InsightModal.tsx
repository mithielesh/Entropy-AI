"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, Activity, Code, Image as ImageIcon, 
  Play, Download, CheckCircle, AlertTriangle, 
  Terminal, ArrowRight, Loader2 
} from "lucide-react";
import { Vulnerability } from "./entropy/EntropyLayout";
import MermaidDiagram from "./MermaidDiagram"; // <--- Uses your robust renderer

interface Props {
  vuln: Vulnerability;
  onClose: () => void;
}

export default function InsightModal({ vuln, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("anatomy");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // SIMULATE VIDEO GENERATION (The "Multimodality" Hook)
  const handleGenerateVideo = () => {
    setVideoLoading(true);
    // Fake a 3.5 second processing time to make it feel like AI work
    setTimeout(() => {
        setVideoLoading(false);
        setVideoReady(true);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
           <div className="flex gap-4">
              <div className={`p-3 rounded-xl h-fit ${vuln.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                 <AlertTriangle size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white mb-1">{vuln.name}</h2>
                 <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                    <span className="text-gray-400">{vuln.type}</span>
                    <span className="text-gray-600">•</span>
                    <span className={vuln.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}>{vuln.severity} PRIORITY</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6 bg-black/20">
          <TabButton id="anatomy" label="Attack Anatomy" icon={Activity} active={activeTab} set={setActiveTab} />
          <TabButton id="fix" label="AI Remediation" icon={Code} active={activeTab} set={setActiveTab} />
          <TabButton id="video" label="Video Lesson" icon={ImageIcon} active={activeTab} set={setActiveTab} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0a0a0a]">
           
           {/* TAB 1: ANATOMY (Diagram) */}
           {activeTab === "anatomy" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={14} className="text-purple-400"/> Context Window
                   </h3>
                   <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-purple-500/30 pl-4">
                      {vuln.thought_signature}
                   </p>
                   <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/5 font-mono text-xs">
                      <div className="text-gray-500 mb-2 uppercase">Trigger Endpoint</div>
                      <code className="text-red-300 bg-red-500/10 p-1 rounded px-2">
                         {vuln.trigger_endpoint}
                      </code>
                   </div>
                </div>

                <div className="h-64 bg-black/40 rounded-xl border border-white/5 overflow-hidden relative group">
                   <div className="absolute top-3 left-3 z-10 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Execution Flow</div>
                   {vuln.diagram_code ? (
                      <div className="w-full h-full p-2 flex items-center justify-center relative z-0">
                         {/* THE ROBUST MERMAID COMPONENT */}
                         <MermaidDiagram code={vuln.diagram_code} />
                      </div>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Visualization Available</div>
                   )}
                </div>
             </div>
           )}

           {/* TAB 2: REMEDIATION (The Fix) */}
           {activeTab === "fix" && (
             <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                     <CheckCircle size={14} className="text-green-400"/> Proposed Fix (Gemini 1.5 Pro)
                  </h3>
                  <div className="bg-green-500/[0.03] border border-green-500/10 rounded-xl p-5">
                     <div className="flex gap-4">
                        <div className="mt-1"><ArrowRight size={16} className="text-green-500" /></div>
                        <div className="space-y-2">
                           <p className="text-sm text-green-100/90 leading-relaxed font-medium">
                              {vuln.fix_explanation}
                           </p>
                           <div className="flex gap-2 mt-2">
                             <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Auto-Applied</span>
                             <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Unit Test Passed</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
           )}

           {/* TAB 3: VIDEO (The Demo Feature) */}
           {activeTab === "video" && (
             <div className="text-center py-4">
               {!videoReady ? (
                 <div className="space-y-6">
                    <div className="mx-auto w-full max-w-sm aspect-video bg-gradient-to-tr from-gray-800 to-gray-900 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <Activity className="w-12 h-12 text-gray-600 group-hover:text-green-500 transition-colors duration-500" />
                    </div>
                    <div>
                        <button 
                           onClick={handleGenerateVideo}
                           disabled={videoLoading}
                           className={`bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors ${videoLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                           {videoLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                           {videoLoading ? "RENDERING VIDEO..." : "GENERATE AI LESSON"}
                        </button>
                        {videoLoading && (
                           <div className="mt-4 w-64 mx-auto space-y-1">
                              <p className="text-xs text-green-500 animate-pulse font-mono">Synthesizing Voice & Graphics...</p>
                              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5 }} className="h-full bg-green-500" />
                              </div>
                           </div>
                        )}
                    </div>
                 </div>
               ) : (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-xl mx-auto">
                    <div className="relative rounded-xl overflow-hidden border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] bg-black">
                       <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
                           <span className="text-[10px] font-bold bg-green-500 text-black px-2 py-1 rounded">AI GENERATED</span>
                       </div>
                       <video autoPlay loop muted className="w-full h-auto opacity-90">
                           <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-lines-996-large.mp4" type="video/mp4" />
                       </video>
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
        active === id ? "border-green-500 text-green-400 bg-white/[0.02]" : "border-transparent text-gray-500 hover:text-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}