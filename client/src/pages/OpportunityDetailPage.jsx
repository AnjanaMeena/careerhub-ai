import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, MapPin, DollarSign, Calendar, Sparkles, 
  ExternalLink, Bookmark, CheckCircle2, XCircle, ArrowLeft, Award, ShieldCheck
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import MatchScoreBadge from '../components/MatchScoreBadge';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const OpportunityDetailPage = () => {
  const { id } = useParams();
  const { isStudent } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [appStatus, setAppStatus] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/opportunities/${id}`);
      setOpportunity(res.data);
      setIsBookmarked(res.data.isBookmarked || false);
      setAppStatus(res.data.applicationStatus || null);
    } catch (err) {
      toast.error('Failed to load opportunity details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!isStudent) {
      toast.error('Log in as student to save bookmarks');
      return;
    }
    try {
      const res = await api.post('/bookmarks/toggle', { opportunityId: id });
      setIsBookmarked(res.data.isBookmarked);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    }
  };

  const handleApply = async () => {
    if (isStudent) {
      try {
        await api.post('/applications', { opportunityId: id, status: 'Applied' });
        setAppStatus('Applied');
        toast.success('Tracked as Applied!');
      } catch (err) {
        console.error(err);
      }
    }
    window.open(opportunity.applyLink, '_blank');
  };

  if (loading) return <LoadingSpinner label="Loading opportunity details..." />;
  if (!opportunity) return <div className="p-8 text-center text-slate-500">Opportunity not found.</div>;

  const match = opportunity.matchDetails || { score: 85, matches: [], missing: [], reason: '' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Back Button */}
      <Link to="/student/opportunities" className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-black text-2xl border border-slate-200 dark:border-slate-600">
              {opportunity.companyLogo ? (
                <img src={opportunity.companyLogo} alt={opportunity.companyName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                opportunity.companyName.charAt(0)
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {opportunity.category}
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{opportunity.role}</h1>
              <p className="text-sm font-semibold text-slate-500 flex items-center mt-0.5">
                <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                {opportunity.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isStudent && (
              <button
                onClick={handleToggleBookmark}
                className={`p-3 rounded-2xl border transition-all ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            )}

            <button
              onClick={handleApply}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Skill Match Score Banner */}
        {isStudent && (
          <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-slate-900 dark:to-slate-900/80 border border-indigo-100 dark:border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">AI Profile Match Analysis</h3>
              </div>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl shadow-sm border">
                {match.score}% Match
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">{match.reason}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {match.matches && match.matches.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Matching Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {match.matches.map((m, idx) => (
                      <span key={idx} className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium">
                        ✔ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {match.missing && match.missing.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" /> Missing / Target Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {match.missing.map((m, idx) => (
                      <span key={idx} className="text-xs bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded-md font-medium">
                        ❌ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Opportunity Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-700/60">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stipend / Salary</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center">
              <DollarSign className="w-4 h-4 text-emerald-500 mr-1" />
              {opportunity.stipendSalary}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center">
              <MapPin className="w-4 h-4 text-indigo-500 mr-1" />
              {opportunity.location}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Application Deadline</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center">
              <Calendar className="w-4 h-4 text-rose-500 mr-1" />
              {new Date(opportunity.deadline).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CGPA Requirement</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center">
              <Award className="w-4 h-4 text-amber-500 mr-1" />
              {opportunity.cgpaRequirement > 0 ? `${opportunity.cgpaRequirement} CGPA` : 'Open for all'}
            </p>
          </div>
        </div>

        {/* Description & Eligibility */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Job Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Eligibility Criteria</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
              {opportunity.eligibility}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.requiredSkills?.map((s, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OpportunityDetailPage;
