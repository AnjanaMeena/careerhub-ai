import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Users, Briefcase, FileText, PlusCircle, Activity, ShieldCheck } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  if (loading) return <LoadingSpinner label="Loading campus administrative analytics..." />;

  const pieData = data?.opportunitiesByCategoryChart || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Admin Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Admin Management Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1">Monitor student registrations, opportunity postings & application activity.</p>
        </div>

        <Link
          to="/admin/opportunities"
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Opportunity</span>
        </Link>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Registered Students"
          value={data?.totalStudents || 0}
          icon={Users}
          color="purple"
          subtitle="Active campus profiles"
        />
        <StatCard
          title="Total Opportunities"
          value={data?.totalOpportunities || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="Placements, internships, etc."
        />
        <StatCard
          title="Applications Submitted"
          value={data?.totalApplications || 0}
          icon={FileText}
          color="emerald"
          subtitle="Student applications tracked"
        />
      </div>

      {/* Analytics Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pie Chart: Opportunities by Category */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Opportunities by Category</h3>
              <p className="text-xs text-slate-500">Distribution across placements, internships, hackathons & workshops</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Timeline Feed */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center">
            <Activity className="w-4 h-4 text-purple-600 mr-2" />
            Recent Activity Feed
          </h3>

          <div className="space-y-3">
            {!data?.recentActivity || data.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity logged yet.</p>
            ) : (
              data.recentActivity.map(act => (
                <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/50 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{act.text}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(act.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
