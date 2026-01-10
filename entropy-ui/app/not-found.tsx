"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050000] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      
      {/* --- BACKGROUND RED GLOW --- */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#200505_1px,transparent_1px),linear-gradient(to_bottom,#200505_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 blur-[120px] rounded-full" />
      </div>

      {/* --- SCAN LINE ANIMATION --- */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <motion.div 
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[2px] bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
        />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 text-center max-w-2xl">
        
        {/* The Icon */}
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="mx-auto mb-6 w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
        >
           <ShieldAlert className="w-10 h-10 text-red-500" />
        </motion.div>

        {/* The Giant Number */}
        <h1 className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-red-900 mb-2 select-none">
           404
        </h1>

        <div className="h-px w-32 bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto mb-6" />

        <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-4 tracking-widest uppercase">
          Sector Unauthorized/Not Found
        </h2>

        <p className="text-gray-500 mb-10 text-sm md:text-base max-w-md mx-auto leading-relaxed">
          The requested trajectory is outside the known entropy field. <br/>
          Protocol <span className="text-red-400">#INVALID_VECTOR</span> has been triggered.
        </p>

        {/* The Button */}
        <div className="flex justify-center">
           <button 
             onClick={() => router.push('/')}
             className="group relative px-8 py-3 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
           >
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             <span>Re-establish Link</span>
           </button>
        </div>

        {/* Technical Footer */}
        {mount && (
          <div className="mt-16 p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-left font-mono text-[10px] text-red-400/60 max-w-sm mx-auto">
             <div className="flex items-center gap-2 mb-2 border-b border-red-900/30 pb-1">
                <Terminal size={10} /> SYSTEM_LOG
             </div>
             <p>{`> ERROR: TARGET_UNREACHABLE`}</p>
             <p>{`> TIMESTAMP: ${new Date().toISOString()}`}</p>
             <p>{`> MEMORY_DUMP: 0x${Math.floor(Math.random() * 999999).toString(16).toUpperCase()}`}</p>
          </div>
        )}

      </div>
    </div>
  );
}