import React from 'react';

// Define what a "Scan" looks like for the UI
interface ScanSummary {
  _id: string;
  projectName: string;
  scanDate: string;
  entropyScore: number;
}

interface Props {
  scan: ScanSummary;
  onClick: (id: string) => void;
}

export default function HistoryCard({ scan, onClick }: Props) {
  // Format the date nicely
  const date = new Date(scan.scanDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Color-code the score (Lower score = Better security in our logic, or vice versa)
  // Let's assume: 100 = Safe, 0 = High Entropy/Risk
  const getScoreColor = (score: number) => {
    if (score > 80) return "text-green-400 border-green-500/30 bg-green-500/10";
    if (score > 50) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  return (
    <div 
      onClick={() => onClick(scan._id)}
      className="group relative flex items-center justify-between p-4 mb-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer backdrop-blur-sm"
    >
      {/* Left: Project Info */}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
          {scan.projectName}
        </span>
        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">
          {date}
        </span>
      </div>

      {/* Right: Entropy Score Badge */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-md border ${getScoreColor(scan.entropyScore)}`}>
        <span className="text-xs font-semibold uppercase">Security Score</span>
        <span className="text-xl font-bold">{scan.entropyScore}</span>
      </div>

      {/* Arrow Icon (Visible on Hover) */}
      <div className="absolute right-[-10px] opacity-0 group-hover:opacity-100 group-hover:right-[-20px] transition-all duration-300">
        ➡️
      </div>
    </div>
  );
}