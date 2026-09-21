import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Calendar, MapPin, DollarSign, Building2, CheckCircle2, Clock } from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const OpportunityCard = ({ opportunity, onBookmarkChange, onStatusChange }) => {
  const { isStudent } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(opportunity.isBookmarked || false);
  const [appStatus, setAppStatus] = useState(opportunity.applicationStatus || null);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStudent) {
      toast.error('Log in as a student to bookmark opportunities');
      return;
    }
    setLoadingBookmark(true);
    try {
      const res = await api.post('/bookmarks/toggle', { opportunityId: opportunity._id });
      setIsBookmarked(res.data.isBookmarked);
      toast.success(res.data.message);
      if (onBookmarkChange) onBookmarkChange(opportunity._id, res.data.isBookmarked);
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    } finally {
      setLoadingBookmark(false);
    }
  };

  const handleQuickApply = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStudent) {
      window.open(opportunity.applyLink, '_blank');
      return;
    }

    try {
      await api.post('/applications', { opportunityId: opportunity._id, status: 'Applied' });
      setAppStatus('Applied');
      toast.success('Marked as Applied! Redirecting to official application...');
      if (onStatusChange) onStatusChange(opportunity._id, 'Applied');
      window.open(opportunity.applyLink, '_blank');
    } catch (err) {
      window.open(opportunity.applyLink, '_blank');
    }
  };

  const getCategoryBadge = (cat) => {
    const map = {
      Placement: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
      Internship: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
      Hackathon: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
      Workshop: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
      Scholarship: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200',
    };
    return map[cat] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  };

  return (
    <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/70 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
      <div>
        
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-lg border border-slate-200 dark:border-slate-600 flex-shrink-0">
              {opportunity.companyLogo ? (
                <img src={opportunity.companyLogo} alt={opportunity.companyName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                opportunity.companyName ? opportunity.companyName.charAt(0) : 'C'
              )}
            </div>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadge(opportunity.category)}`}>
                {opportunity.category}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <Link to={`/student/opportunity/${opportunity._id}`}>{opportunity.role}</Link>
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                {opportunity.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isStudent && <MatchScoreBadge matchDetails={opportunity.matchDetails} />}

            {isStudent && (
              <button
                onClick={handleToggleBookmark}
                disabled={loadingBookmark}
                className={`p-2 rounded-xl border transition-all ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Opportunity Meta Info */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{opportunity.stipendSalary}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate">{opportunity.location}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span className="truncate">Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
            <span className="font-semibold text-slate-500">Min CGPA:</span>
            <span>{opportunity.cgpaRequirement > 0 ? `${opportunity.cgpaRequirement}` : 'N/A'}</span>
          </div>
        </div>

        {/* Required Skills Badges */}
        {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opportunity.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                {skill}
              </span>
            ))}
            {opportunity.requiredSkills.length > 4 && (
              <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-md">
                +{opportunity.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
        <Link
          to={`/student/opportunity/${opportunity._id}`}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View Details
        </Link>

        <div className="flex items-center space-x-2">
          {appStatus && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {appStatus}
            </span>
          )}

          <button
            onClick={handleQuickApply}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
