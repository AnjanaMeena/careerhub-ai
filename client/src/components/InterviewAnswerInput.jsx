import React, { useState } from 'react';
import { Send, Sparkles, Layers, Target, Zap, TrendingUp, CheckCircle, FileText, Mic } from 'lucide-react';
import VoiceInput from './VoiceInput';

const STAR_TEMPLATES = [
  { label: 'Situation', icon: Layers, text: 'In my previous project at [Company/College], we encountered a challenge where ' },
  { label: 'Task', icon: Target, text: 'My core responsibility was to design and implement ' },
  { label: 'Action', icon: Zap, text: 'I engineered the solution using [React / Node.js / Python] by implementing ' },
  { label: 'Result', icon: TrendingUp, text: 'As a result, we achieved a 35% improvement in performance and ' }
];

const TECHNICAL_STARTERS = [
  'Architected scalable RESTful APIs with JWT authentication and RBAC permissions.',
  'Optimized MongoDB database queries and indexed collections to lower latency by 40%.',
  'Containerized microservices using Docker and set up automated CI/CD deployment pipelines.',
  'Refactored state management using React Context and custom hooks for better component isolation.'
];

const InterviewAnswerInput = ({ onSubmit, loading = false }) => {
  const [answer, setAnswer] = useState('');

  const insertText = (snippet) => {
    setAnswer(prev => (prev ? `${prev}\n\n${snippet}` : snippet));
  };

  const handleVoiceTranscript = (transcriptText) => {
    if (transcriptText) {
      setAnswer(transcriptText);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    onSubmit(answer.trim());
    setAnswer('');
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-surface rounded-3xl border border-theme-border p-5 shadow-lg space-y-4">
      {/* Header Bar with Mode Selector & STAR Helper */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs font-black uppercase text-theme-text tracking-wider">Answer Assistant (Voice + Text)</span>
        </div>

        {/* STAR Framework Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-theme-text-muted mr-1 hidden sm:inline">STAR Helper:</span>
          {STAR_TEMPLATES.map((tmpl) => {
            const IconComponent = tmpl.icon;
            return (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => insertText(tmpl.text)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-surface-hover hover:bg-primary/15 text-theme-text-secondary hover:text-primary rounded-lg text-xs font-bold border border-theme-border transition-all"
                title={`Insert ${tmpl.label} template`}
              >
                <IconComponent className="w-3.5 h-3.5 text-primary" />
                <span>{tmpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Technical Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-theme-text-muted flex items-center">
          <FileText className="w-3.5 h-3.5 mr-1 text-primary" />
          Quick Technical Impact Presets (Click to Add):
        </label>
        <div className="flex flex-wrap gap-2">
          {TECHNICAL_STARTERS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertText(preset)}
              className="text-[11px] text-left px-3 py-1.5 bg-surface hover:bg-primary/10 text-theme-text-secondary hover:text-theme-text rounded-xl border border-theme-border hover:border-primary/30 transition-all truncate max-w-full"
            >
              + {preset.substring(0, 55)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Answer Area (Type or Speak) */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response or click 'Voice Input' to dictate speech... (Ctrl + Enter to submit)"
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none leading-relaxed transition-all"
          />

          <div className="absolute right-3 bottom-3 flex items-center space-x-3 text-[11px] text-theme-text-muted bg-surface/80 px-2 py-1 rounded-lg backdrop-blur-sm">
            <span>{wordCount} words</span>
            {wordCount >= 30 && (
              <span className="text-emerald-500 font-bold flex items-center">
                <CheckCircle className="w-3 h-3 mr-0.5 inline" /> Good depth
              </span>
            )}
          </div>
        </div>

        {/* Action Bar: Voice Toggle + Submit */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
            <span className="text-[11px] text-theme-text-muted hidden md:inline">
              Speak or type your answer directly
            </span>
          </div>

          <button
            type="submit"
            disabled={!answer.trim() || loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
          >
            <span>{loading ? 'Evaluating...' : 'Submit Answer'}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewAnswerInput;
