"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Bell, 
  MoreVertical,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock Data for "Recent Scans"
  const projects = [
    { id: 1, name: "Alpha_Protocol_01", date: "2 mins ago", status: "Critical", entropy: "98%" },
    { id: 2, name: "Neural_Net_V2", date: "4 hours ago", status: "Stable", entropy: "12%" },
    { id: 3, name: "Encryption_Key_Gen", date: "1 day ago", status: "Analyzing", entropy: "45%" },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white flex overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col hidden md:flex">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="font-bold tracking-tight">ENTROPY.AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<History size={18} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs">
                OP
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-bold truncate">Operative_001</p>
                 <p className="text-[10px] text-gray-500 truncate">Pro License</p>
              </div>
              <LogOut size={14} className="text-gray-500 group-hover:text-red-400 transition-colors" onClick={() => router.push('/')} />
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
           <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-purple-900/10 blur-[100px] rounded-full" />
        </div>

        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 relative z-10 bg-black/20 backdrop-blur-sm">
           <div className="flex items-center text-sm text-gray-500 gap-2">
              <span>Mission Control</span>
              <span>/</span>
              <span className="text-white">Overview</span>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="Search logs..." 
                   className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-purple-500/50 transition-all w-64"
                 />
              </div>
              <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative">
                 <Bell size={14} />
                 <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
           </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
           
           {/* Welcome Section */}
           <div className="flex justify-between items-end mb-8">
              <div>
                 <h1 className="text-3xl font-bold mb-1">Command Center</h1>
                 <p className="text-gray-400 text-sm">System integrity is normal. 3 active analysis threads.</p>
              </div>
              <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                 <Plus size={16} />
                 New Analysis
              </button>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Total Entropy" value="84.3 TB" change="+12%" icon={<Activity className="text-blue-400" />} />
              <StatCard title="Threats Neutralized" value="1,204" change="+5%" icon={<Shield className="text-green-400" />} />
              <StatCard title="Processing Power" value="98%" change="High Load" icon={<Zap className="text-yellow-400" />} />
           </div>

           {/* Recent Projects Table */}
           <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                 <h3 className="font-bold">Recent Scans</h3>
                 <button className="text-xs text-purple-400 hover:text-purple-300">View All</button>
              </div>
              
              <div className="divide-y divide-white/5">
                 {projects.map((project) => (
                    <div key={project.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${project.status === 'Critical' ? 'bg-red-500 animate-pulse' : project.status === 'Stable' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                          <div>
                             <p className="font-bold text-sm text-gray-200">{project.name}</p>
                             <p className="text-xs text-gray-500">{project.date}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-8">
                          <div className="text-right">
                             <p className="text-[10px] text-gray-500 uppercase tracking-wider">Entropy</p>
                             <p className="font-mono text-sm">{project.entropy}</p>
                          </div>
                          <button className="text-gray-600 hover:text-white transition-colors">
                             <MoreVertical size={16} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

function NavItem({ icon, label, active, onClick }: any) {
   return (
      <button 
         onClick={onClick}
         className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
         {icon}
         <span className="font-medium">{label}</span>
      </button>
   )
}

function StatCard({ title, value, change, icon }: any) {
   return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] relative group overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-white/5 text-white">{icon}</div>
            <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">{change}</span>
         </div>
         <h3 className="text-2xl font-bold mb-1">{value}</h3>
         <p className="text-gray-500 text-xs uppercase tracking-wider">{title}</p>
      </div>
   )
}