"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import MainGenerator from '../../components/MainGenerator';
import { ArrowLeft, Zap } from 'lucide-react'; // Make sure you have these icons or remove the import

export default function LightningPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      
      {/* --- 1. THE SOLID SYSTEM BAR (Z-Index 50) --- */}
      {/* This creates a dedicated 'shelf' at the top for your controls */}
      <header className="fixed top-0 left-0 w-full h-[60px] bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6">
        
        {/* LEFT: Exit Button */}
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Exit Session</span>
        </button>

        {/* CENTER: The Badge */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
           <span className="text-[10px] font-mono text-yellow-500 font-bold uppercase tracking-widest">
             Lightning Mode • RAM Only
           </span>
        </div>

        {/* RIGHT: Sign Up CTA */}
        <button 
          onClick={() => router.push('/auth/signup')}
          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-all shadow-lg shadow-purple-900/20"
        >
          Sign Up to Save
        </button>

      </header>

      {/* --- 2. THE MAIN TOOL (Pushed Down) --- */}
      {/* 'pt-[60px]' ensures the tool starts EXACTLY below the header, not behind it */}
      <div className="pt-[60px] relative z-0">
        <MainGenerator /> 
      </div>
      
    </div>
  );
}