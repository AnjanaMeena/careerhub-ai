import React, { useState, useEffect } from 'react';
import { 
  Target, Sparkles, CheckCircle2, XCircle, BookOpen, 
  Layers, ArrowRight, Award, Compass 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SkillGapPage = () => {
  const { user } = useAuth();
  const targetRoles = ['Full Stack Developer', 'Software Engineer', 'Cyber Security Analyst', 'Data Analyst'];
  
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSkillGap = async (role) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/skill-gap', { targetRole: role });
      setAnalysis(res.data);
    } catch (err) {
      toast.error('Failed to generate skill gap analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGap(selectedRole);
  }, [selectedRole]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI Career Roadmap</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Target Role Skill Gap Analysis</h1>
        <p className="text-sm text-purple-100 mt-2 max-w-2xl">
          Select your target industry role to compare your current profile against required technologies and generate a custom learning plan.
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {targetRoles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === role
                  ? 'bg-white text-purple-700 shadow-md scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label={`Analyzing skill requirements for ${selectedRole}...`} />
      ) : !analysis ? (
        <div className="text-center p-8 text-slate-400">Select a role to analyze.</div>
      ) : (
        <div className="space-y-8">
          
          {/* Current vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Skills */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Current Profile Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.currentSkills?.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center">
                    ✔ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-rose-600 dark:text-rose-400">
                <XCircle className="w-5 h-5 mr-2" />
                Missing Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center">
                    ❌ {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Recommended Courses & Suggested Technologies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Suggested Tech */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-indigo-600">
                <Layers className="w-5 h-5 mr-2" />
                Key Technologies to Learn
              </h3>
              <div className="space-y-2">
                {analysis.suggestedTechnologies?.map((tech, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{tech}</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded">High Priority</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center text-purple-600">
                <BookOpen className="w-5 h-5 mr-2" />
                Recommended Learning Resources
              </h3>
              <div className="space-y-3">
                {analysis.recommendedCourses?.map((course, idx) => (
                  <div key={idx} className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{course.title}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                      <span>Provider: {course.provider}</span>
                      <span>•</span>
                      <span>Level: {course.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Structured Learning Roadmap Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-6 flex items-center">
              <Compass className="w-5 h-5 text-indigo-600 mr-2" />
              Structured Learning Roadmap ({selectedRole})
            </h3>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
              {analysis.learningPlan?.map((item, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-800"></div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{item.week}</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{item.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SkillGapPage;
