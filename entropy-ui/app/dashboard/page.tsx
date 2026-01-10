"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, History, Settings, LogOut, Plus, Search, 
  Activity, Zap, Shield, Loader2, Cpu, Eye, Save, Terminal 
} from 'lucide-react';

interface ScanData {
  _id: string;
  projectName: string;
  scanDate: string;
  entropyScore: number;
}

interface User {
  username: string;
  _id: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  // --- HYDRATION FIX STATE ---
  const [isMounted, setIsMounted] = useState(false); // <--- 1. Add this

  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, avg: 0, critical: 0 });
  
  const [settings, setSettings] = useState({
    aiModel: 'Gemini 1.5 Flash',
    analysisDepth: 'Standard',
    theme: 'Dark'
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    // 2. Mark as mounted immediately
    setIsMounted(true);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.replace('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const validId = parsedUser._id || parsedUser.id;
      if (!validId) throw new Error("ID Missing");
      
      setUser(parsedUser);
      fetchHistory(validId);
      
      const savedSettings = localStorage.getItem('entropy_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

    } catch (err) {
      console.error("Session Error:", err);
      localStorage.removeItem('user');
      router.replace('/auth/login');
    }
  }, [router]);

  const fetchHistory = async (userId: string) => {
    try {
      const res = await fetch(`/api/history?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setScans(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ScanData[]) => {
    const total = data.length;
    const avg = total > 0 ? Math.round(data.reduce((acc, c) => acc + c.entropyScore, 0) / total) : 0;
    const critical = data.filter(s => s.entropyScore > 50).length;
    setStats({ total, avg, critical });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const saveSettings = () => {
    localStorage.setItem('entropy_settings', JSON.stringify(settings));
    alert("System Configuration Updated");
  };

  const filteredScans = scans.filter(s => 
    s.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 3. HYDRATION GUARD ---
  // If we haven't mounted yet, render NOTHING. 
  // This ensures Server and Client HTML match (both are null initially).
  if (!isMounted) return null;

  // 4. Then check for user
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex overflow-hidden font-sans selection:bg-purple-500/30 relative">
      
      {/* --- NEW SCAN MODAL --- */}
      {showNewScanModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
             <button onClick={() => setShowNewScanModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
             <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                <Terminal size={24} />
             </div>
             <h2 className="text-xl font-bold mb-2">Initiate Neural Scan</h2>
             <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-xs text-green-400 mb-6">
                <p className="opacity-50 select-none"># Open your terminal and run:</p>
                <p className="mt-2">python strategist.py</p>
             </div>
             <button onClick={() => setShowNewScanModal(false)} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">
               Acknowledged
             </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col hidden md:flex z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse z-10 relative" />
            <div className="absolute inset-0 bg-purple-500 blur-sm animate-pulse" />
          </div>
          <span className="font-bold tracking-tight text-lg tracking-widest">ENTROPY.AI</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<History size={18} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-purple-900/20">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-bold truncate text-gray-200">{user.username}</p>
                 <p className="text-[10px] text-gray-500 truncate">Operative</p>
              </div>
              <button onClick={handleLogout}><LogOut size={16} className="text-gray-500 hover:text-red-400 transition-colors" /></button>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 relative z-10 bg-black/20 backdrop-blur-md">
           <div className="text-sm text-gray-500 flex gap-2">
             <span className="uppercase tracking-wider text-[10px]">Mission Control</span>/
             <span className="text-white font-medium capitalize">{activeTab}</span>
           </div>
           <div className="flex items-center gap-4">
              <button 
  onClick={() => router.push('/dashboard/new')} // <--- UPDATED: Navigate to new page
  className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-md text-xs transition"
>
  <Plus size={14} /> New Scan
</button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-md text-xs transition">
                <LogOut size={14} /> Disconnect
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
           {/* OVERVIEW */}
           {activeTab === 'overview' && (
             <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <StatCard title="Total Scans" value={stats.total} icon={<Activity className="text-blue-400" />} />
                  <StatCard title="Avg Entropy" value={`${stats.avg}%`} color={stats.avg > 50 ? 'text-red-400' : 'text-green-400'} icon={<Zap className="text-yellow-400" />} />
                  <StatCard title="Threats" value={stats.critical} color="text-red-400" icon={<Shield className="text-red-400" />} />
               </div>
               <h3 className="font-bold text-sm tracking-wide text-gray-200 mb-4">RECENT ACTIVITY</h3>
               <ScanList scans={scans.slice(0, 5)} loading={loading} router={router} />
             </>
           )}

           {/* HISTORY */}
           {activeTab === 'history' && (
             <div className="max-w-4xl mx-auto">
               <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Search className="text-gray-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search logs by project name..." 
                    className="bg-transparent border-none focus:outline-none text-white w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <ScanList scans={filteredScans} loading={loading} router={router} />
             </div>
           )}

           {/* SETTINGS */}
           {activeTab === 'settings' && (
             <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-6">Configuration</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                   <div className="flex items-center gap-3 mb-4">
                      <Cpu className="text-purple-400" /> <h3 className="font-bold">Neural Engine</h3>
                   </div>
                   <select 
                     value={settings.aiModel}
                     onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                     className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-purple-500 outline-none"
                   >
                     <option>Gemini 1.5 Flash</option>
                     <option>Gemini 1.5 Pro</option>
                     <option>GPT-4o</option>
                   </select>
                </div>
                <button onClick={saveSettings} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                   <Save size={18} /> Save Configurations
                </button>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

// SUB-COMPONENTS
function NavItem({ icon, label, active, onClick }: any) {
  return (
     <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative overflow-hidden group ${active ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all ${active ? 'bg-purple-500' : 'bg-transparent group-hover:bg-gray-600'}`} />
        {icon} <span className="font-medium">{label}</span>
     </button>
  );
}

function StatCard({ title, value, color, icon }: any) {
  return (
     <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] relative group hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-4">
           <div className="p-2.5 rounded-lg bg-white/5 text-white border border-white/5">{icon}</div>
        </div>
        <h3 className={`text-3xl font-bold mb-1 tracking-tight ${color || 'text-white'}`}>{value}</h3>
        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{title}</p>
     </div>
  );
}

function ScanList({ scans, loading, router }: any) {
  if (loading) return <div className="p-8 flex justify-center text-gray-500 gap-3"><Loader2 className="animate-spin" /> <span>Syncing...</span></div>;
  if (scans.length === 0) return <div className="p-8 text-center text-gray-600 border border-dashed border-white/10 rounded-xl">No logs found.</div>;

  return (
    <div className="space-y-2">
      {scans.map((scan: any) => (
        <div 
          key={scan._id} 
          onClick={() => router.push(`/dashboard/${scan._id}`)}
          className="px-6 py-4 flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-purple-500/30 transition-all cursor-pointer group"
        >
           <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${scan.entropyScore > 50 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_8px_green]'}`} />
              <div>
                 <p className="font-bold text-sm text-gray-200 group-hover:text-purple-300 transition-colors">{scan.projectName}</p>
                 <p className="text-xs text-gray-500 font-mono mt-0.5">{new Date(scan.scanDate).toLocaleString()}</p>
              </div>
           </div>
           <div className="text-right">
              <span className={`font-mono text-sm font-bold ${scan.entropyScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{scan.entropyScore}%</span>
           </div>
        </div>
      ))}
    </div>
  );
}