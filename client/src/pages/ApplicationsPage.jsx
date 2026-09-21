import React, { useState, useEffect } from 'react';
import { FileText, Building2, CheckCircle2, Clock, Calendar, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}`, { status: newStatus });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      toast.success(`Application status updated to "${newStatus}"`);
    } catch (err) {
      toast.error('Failed to update application status');
    }
  };

  const getStatusBadgeStyle = (st) => {
    const map = {
      Saved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
      Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
      Interview: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
      Offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
      Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
    };
    return map[st] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center">
          <FileText className="w-6 h-6 text-indigo-600 mr-2" />
          Application Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track and manually update your application status (Saved, Applied, Interview, Offer, Rejected).
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading application tracking history..." />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Tracked Applications Yet"
          message="When you click 'Apply' on any opportunity, it will automatically appear here for status tracking."
          actionText="Browse Opportunities"
          onAction={() => window.location.href = '/student/opportunities'}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-6">Company & Role</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Date Tracked</th>
                  <th className="py-4 px-6">Status Pipeline</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
                {applications.map((app) => {
                  const op = app.opportunity;
                  if (!op) return null;

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      
                      {/* Role & Company */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold flex items-center justify-center text-indigo-600">
                            {op.companyName.charAt(0)}
                          </div>
                          <div>
                            <Link to={`/student/opportunity/${op._id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600">
                              {op.role}
                            </Link>
                            <p className="text-xs text-slate-400">{op.companyName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {op.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date(app.updatedAt || app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status Selector dropdown */}
                      <td className="py-4 px-6">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${getStatusBadgeStyle(app.status)}`}
                        >
                          <option value="Saved">Saved</option>
                          <option value="Applied">Applied</option>
                          <option value="Interview">Interview</option>
                          <option value="Offer">Offer 🎉</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* External Link */}
                      <td className="py-4 px-6 text-right">
                        <a
                          href={op.applyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          <span>Open Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationsPage;
