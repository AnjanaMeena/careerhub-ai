import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">CareerHub AI</span>
          <span className="text-xs text-slate-400">© 2026 major project edition. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
          <span>Built for Campus Opportunities</span>
          <span>•</span>
          <span>Google Gemini AI</span>
          <span>•</span>
          <span>Full-Stack MERN</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
