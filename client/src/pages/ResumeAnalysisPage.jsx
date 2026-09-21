import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Upload, FileText, CheckCircle2, AlertTriangle, 
  Lightbulb, Check, ArrowRight, Award, ListChecks
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResumeAnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchLatestAnalysis = async () => {
    try {
      const res = await api.get('/resumes/latest');
      if (res.data) {
        setAnalysis(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch latest resume analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(res.data.analysis);
      toast.success('Resume uploaded & analyzed by Gemini AI!');
    } catch (err) {
      toast.error('Failed to analyze resume PDF');
    } finally {
      setUploading(false);
    }
  };

  const runQuickDirectAnalysis = async () => {
    setUploading(true);
    try {
      const res = await api.post('/ai/resume-analysis', { resumeText: 'Computer Science Major Resume' });
      setAnalysis(res.data);
      toast.success('Instant AI Resume Check generated!');
    } catch (err) {
      toast.error('Failed to trigger AI resume check');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading AI Resume Feedback system..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini AI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">AI Resume Analysis & ATS Checker</h1>
          <p className="text-sm text-indigo-100 mt-2 max-w-xl">
            Get instant AI scoring, ATS readability evaluation, missing skills feedback, and project enhancement suggestions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <label className="px-6 py-3 bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs rounded-2xl shadow-lg cursor-pointer transition-all flex items-center justify-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Analyzing...' : 'Upload PDF Resume'}</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
          <button
            onClick={runQuickDirectAnalysis}
            disabled={uploading}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl backdrop-blur-md transition-all border border-white/20"
          >
            Run Quick AI Check
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {!analysis ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <FileText className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Resume Analyzed Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Upload your PDF resume or click 'Run Quick AI Check' to receive personalized scoring & recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top 2 Score Gauge Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Resume Score */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Resume Score</span>
                <h2 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {analysis.resumeScore || 82}<span className="text-lg text-slate-400 font-normal">/100</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Evaluated by Gemini AI algorithms</p>
              </div>
              <div className="w-20 h-20 rounded-full border-8 border-indigo-500/20 border-t-indigo-600 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xl">
                {analysis.resumeScore || 82}%
              </div>
            </div>

            {/* ATS Compatibility Score */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Readiness Score</span>
                <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {analysis.atsScore || 78}<span className="text-lg text-slate-400 font-normal">/100</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Recruiter applicant tracking score</p>
              </div>
              <div className="w-20 h-20 rounded-full border-8 border-purple-500/20 border-t-purple-600 flex items-center justify-center font-black text-purple-600 dark:text-purple-400 text-xl">
                {analysis.atsScore || 78}%
              </div>
            </div>

          </div>

          {/* Missing Skills Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-3 flex items-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Missing High-Demand Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900">
                  ❌ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 3 Detailed Suggestion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Resume Improvement Suggestions */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-indigo-600">
                <Lightbulb className="w-5 h-5 mr-2" />
                Impact Suggestions
              </h3>
              <ul className="space-y-3">
                {analysis.improvementSuggestions?.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grammar & Formatting */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Grammar & Verbs
              </h3>
              <ul className="space-y-3">
                {analysis.grammarSuggestions?.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Better Project Descriptions */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-purple-600">
                <ListChecks className="w-5 h-5 mr-2" />
                Project Descriptions
              </h3>
              <ul className="space-y-3">
                {analysis.projectSuggestions?.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ResumeAnalysisPage;
