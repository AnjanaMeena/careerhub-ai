import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Info } from 'lucide-react';

const MatchScoreBadge = ({ matchDetails }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!matchDetails) return null;

  const { score, matches = [], missing = [], reason } = matchDetails;

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  if (score < 50) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  } else if (score >= 80) {
    colorClasses = 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 dark:from-indigo-950/60 dark:to-purple-950/60 dark:text-indigo-300 dark:border-indigo-800';
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 ${colorClasses}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Match {score}%</span>
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Tooltip Popup */}
      {showTooltip && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white dark:bg-slate-800 rounded-xl shadow-xl text-xs z-30 border border-slate-700 space-y-2 animate-in fade-in duration-150">
          <div className="font-semibold border-b border-slate-700 pb-1 flex justify-between items-center">
            <span>AI Skill Alignment</span>
            <span className="text-indigo-400 font-bold">{score}%</span>
          </div>
          <p className="text-[11px] text-slate-300">{reason}</p>
          
          {matches.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-emerald-400">Matching Skills:</p>
              <div className="flex flex-wrap gap-1">
                {matches.map((m, idx) => (
                  <span key={idx} className="flex items-center text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-400" /> {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-rose-400">Missing Skills:</p>
              <div className="flex flex-wrap gap-1">
                {missing.map((m, idx) => (
                  <span key={idx} className="flex items-center text-[10px] bg-rose-900/60 text-rose-200 px-1.5 py-0.5 rounded">
                    <XCircle className="w-2.5 h-2.5 mr-1 text-rose-400" /> {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchScoreBadge;
