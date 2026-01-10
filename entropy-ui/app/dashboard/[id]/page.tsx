"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Terminal, Loader2 
} from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchReport(id as string);
  }, [id]);

  const fetchReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/analysis/${reportId}`);
      if (res.ok) {
        setReport(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-purple-500" />
        <span className="font-mono text-sm tracking-widest uppercase">Decryption in progress...</span>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <span className="text-red-500 font-mono">ERR_404: INTELLIGENCE NOT FOUND</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
               <h1 className="font-bold text-xs tracking-widest uppercase text-gray-500">Mission Report</h1>
               <p className="font-bold text-white text-lg tracking-tight">{report.projectName}</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
             <span className="text-xs text-gray-600 font-mono hidden sm:block">ID: {id}</span>
             <div className={`px-3 py-1 rounded border text-xs font-bold font-mono ${
                 report.entropyScore > 50 
                 ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                 : 'border-green-500/30 bg-green-500/10 text-green-400'
             }`}>
                 ENTROPY: {report.entropyScore}%
             </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 gap-6">
           {report.cards.map((card: any, index: number) => (
             <div key={index} className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all group shadow-2xl">
                
                {/* Card Header */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-4 bg-white/[0.01]">
                   <div className="flex gap-4">
                      <div className={`p-3 rounded-lg h-fit ${
                         card.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                         <AlertTriangle size={20} />
                      </div>
                      <div>
                         <h2 className="text-lg font-bold text-gray-100 leading-tight">{card.name}</h2>
                         <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono uppercase tracking-wide">
                                {card.type}
                            </span>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <span className="text-xs font-mono text-gray-400">Target: {card.trigger_endpoint}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                         card.severity === 'Critical' 
                         ? 'border-red-500/20 bg-red-500/5 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                         : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-500'
                      }`}>
                         {card.severity}
                      </span>
                   </div>
                </div>

                {/* Analysis Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-8">
                      <div>
                         <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Terminal size={12} className="text-purple-500" /> Thought Process
                         </h3>
                         <p className="text-gray-300 text-sm leading-7 border-l-2 border-purple-500/30 pl-4">
                            {card.thought_signature}
                         </p>
                      </div>

                      <div>
                         <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-500" /> Remediation Strategy
                         </h3>
                         <div className="bg-green-500/[0.05] p-4 rounded-lg border border-green-500/10">
                            <p className="text-green-100/80 text-sm leading-relaxed">
                                {card.fix_explanation}
                            </p>
                         </div>
                      </div>
                   </div>

                  {/* Right: Diagram Code */}
<div className="flex flex-col h-full min-h-[300px]">
   <div className="flex justify-between items-center mb-2 px-1">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Execution Flow</span>
      <span className="text-[9px] text-gray-700 font-mono border border-gray-800 px-1 rounded">MERMAID RENDERER</span>
   </div>

   {/* THE DIAGRAM COMPONENT */}
   <div className="bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden grow shadow-inner flex items-center justify-center relative">
       {/* Background Grid Effect for the chart area */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

       <div className="relative z-10 w-full p-4">
          <MermaidDiagram code={card.diagram_code} />
       </div>
   </div>
</div>
                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}