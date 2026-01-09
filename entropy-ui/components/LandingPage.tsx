import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Activity, Shield, Cpu, BarChart3, Terminal } from 'lucide-react';

interface LandingPageProps {
  onEnterLightning: () => void;
  onEnterAuth: (type: 'login' | 'signup') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterLightning, onEnterAuth }) => {

  // --- 1. THE FAKE TERMINAL LOGIC ---
  const [terminalStep, setTerminalStep] = useState(0);
  const terminalLogs = [
    "> Initializing entropy kernels...",
    "> Connecting to neural mesh [SECURE]...",
    "> Allocating volatile memory...",
    "> Bypass authorized...",
    "> STREAM DETECTED: ID_9928X",
    "> Calculating variance...",
    "> ENTROPY LEVELS: CRITICAL (98.2%)",
    "> Optimization suggestions generated."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < terminalLogs.length - 1 ? prev + 1 : 0));
    }, 800); // New log every 0.8 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-6 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          ENTROPY<span className="text-gray-600">.AI</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onEnterAuth('login')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => onEnterAuth('signup')}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white transition-all backdrop-blur-sm"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {/* FIX: Increased padding-top (pt-40) to push content down below navbar */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-40">
        
        {/* Badge (Now properly spaced) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-bold uppercase tracking-widest"
        >
          v2.0 Public Beta
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-6">
            <span className="inline-block bg-[linear-gradient(110deg,#939393,45%,#1e2631,55%,#939393)] bg-[length:250%_100%] bg-clip-text text-transparent animate-text-shimmer">
              Chaos
            </span>{' '}
            <span className="text-white">Into Order.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The next-generation entropy analysis engine. <br className="hidden md:block"/>
            Visualize data complexity in <span className="text-purple-400">real-time</span> with zero latency.
          </p>
        </motion.div>

        {/* Action Buttons with CLEAR Explanation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4 mt-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={onEnterLightning}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>Launch Lightning</span>
            </button>
            
            <button 
              onClick={() => onEnterAuth('signup')}
              className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition-all flex items-center gap-2"
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Explicit Lightning Mode Explanation */}
          <p className="text-xs text-gray-500 mt-2 tracking-wide">
            <span className="text-purple-400 font-semibold">Lightning Mode:</span> Instant Access • No Login Required • RAM-Only Privacy
          </p>
        </motion.div>

        {/* --- THE NEW "LIVE TERMINAL" PREVIEW --- */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 w-full max-w-5xl rounded-t-xl border border-white/10 bg-[#0A0A0A] shadow-2xl shadow-purple-900/20 overflow-hidden relative"
        >
          {/* Window Chrome */}
          <div className="h-9 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="text-[10px] font-mono text-gray-600 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> entropy_kernel_v2.exe
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* TERMINAL CONTENT */}
          <div className="h-[300px] md:h-[450px] w-full p-6 font-mono text-sm md:text-base text-left bg-black/80 backdrop-blur-xl">
             <div className="space-y-2">
                {terminalLogs.slice(0, terminalStep + 1).map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${log.includes('CRITICAL') ? 'text-red-400' : log.includes('DETECTED') ? 'text-purple-400 font-bold' : 'text-green-400/80'}`}
                  >
                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </motion.div>
                ))}
                <motion.div 
                  animate={{ opacity: [0, 1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-3 h-5 bg-green-500 inline-block align-middle ml-1"
                />
             </div>

             {/* Background Decoration to make it look "techy" */}
             <div className="absolute bottom-0 right-0 p-8 opacity-20 pointer-events-none">
                <div className="w-32 h-32 border-r-2 border-b-2 border-purple-500 rounded-br-3xl" />
             </div>
          </div>
          
          {/* Overlay fade at bottom */}
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/* --- BENTO GRID FEATURES (Unchanged) --- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:opacity-40 transition-opacity">
                  <BarChart3 className="w-32 h-32 text-purple-500" />
               </div>
               <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Heuristic Algorithms</h3>
                  <p className="text-gray-400 max-w-md">Our engine breaks down data streams into fundamental entropy components, identifying chaos patterns that standard tools miss.</p>
               </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: 0.1 }}
               className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden"
            >
               <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                 <Activity className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold mb-2">Real-time Vis</h3>
               <p className="text-gray-400 text-sm">60fps rendering of data complexity as it happens. Zero lag.</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: 0.2 }}
               className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden"
            >
               <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                 <Shield className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold mb-2">Volatile Mode</h3>
               <p className="text-gray-400 text-sm">Lightning mode processes data in RAM only. Nothing is ever written to disk.</p>
            </motion.div>

             {/* Card 4 */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden flex items-center justify-between"
            >
               <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to deploy?</h3>
                  <p className="text-gray-400">Start analyzing your data streams in less than 30 seconds.</p>
               </div>
               <button onClick={onEnterLightning} className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">
                 Start Now
               </button>
            </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-xs text-gray-700 border-t border-white/5">
        <p>© 2026 ENTROPY AI SYSTEMS</p>
      </footer>
    </div>
  );
};

export default LandingPage;