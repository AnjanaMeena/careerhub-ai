import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar
} from 'recharts';
import { 
  Sparkles, Bookmark, Briefcase, Calendar, Award, Target, 
  ArrowUpRight, Clock, TrendingUp, Activity, Bell, FileText, Mic
} from 'lucide-react';
import StatCard from '../components/StatCard';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getChartColors, isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [rejectionStats, setRejectionStats] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/students/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const res = await api.get('/calendar/upcoming');
      setCalendarEvents(res.data || []);
    } catch (err) {
      // Calendar might not have events yet
    }
  };

  const fetchRejectionStats = async () => {
    try {
      const res = await api.get('/rejections/analytics');
      setRejectionStats(res.data || null);
    } catch (err) {
      // Rejections might not exist yet
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCalendarEvents();
    fetchRejectionStats();
  }, []);

  if (loading) return <LoadingSpinner label="Loading your personalized career dashboard..." />;

  const chartColors = getChartColors();

  // Donut chart data for application status
  const statusChartData = data?.applicationStatusChart || [
    { status: 'Saved', count: 0 },
    { status: 'Applied', count: 0 },
    { status: 'Interview', count: 0 },
    { status: 'Offer', count: 0 },
    { status: 'Rejected', count: 0 }
  ];

  const donutColors = [chartColors.chart1, chartColors.chart2, chartColors.chart3, '#10b981', '#ef4444'];

  // Monthly trend data (line chart)
  const monthlyTrend = data?.monthlyApplicationTrend || [
    { month: 'Jun', count: 0 }, { month: 'Jul', count: 0 },
    { month: 'Aug', count: 0 }, { month: 'Sep', count: 0 },
    { month: 'Oct', count: 0 }, { month: 'Nov', count: 0 }
  ];

  // Activity feed: combine notifications + recent applications
  const activityFeed = [
    ...(data?.recentNotifications || []).map(n => ({
      id: n._id, type: 'notification', title: n.title, message: n.message,
      time: n.createdAt, icon: Bell
    })),
    ...(data?.recentApplications || []).map(a => ({
      id: a._id, type: 'application', title: `Applied to ${a.opportunity?.role || 'a role'}`,
      message: `at ${a.opportunity?.companyName || 'a company'} — Status: ${a.status}`,
      time: a.updatedAt, icon: FileText
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  // Calendar mini-heatmap: build current month grid
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const eventsByDate = {};
  calendarEvents.forEach(ev => {
    const d = new Date(ev.date).getDate();
    eventsByDate[d] = (eventsByDate[d] || 0) + 1;
  });
  // Also add upcoming deadlines
  (data?.upcomingDeadlines || []).forEach(d => {
    const date = new Date(d.deadline);
    if (date.getMonth() === currentMonth) {
      const day = date.getDate();
      eventsByDate[day] = (eventsByDate[day] || 0) + 1;
    }
  });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const totalDonutCount = statusChartData.reduce((sum, d) => sum + d.count, 0);

  const typeColors = {
    'online-test': 'bg-blue-500',
    'interview': 'bg-primary',
    'deadline': 'bg-amber-500'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-primary rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Assistant Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            Your profile completion is at <strong className="text-white underline">{data?.profileCompletion || 20}%</strong>. Explore top campus opportunities or run an AI resume score check!
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/student/opportunities"
              className="px-5 py-2.5 bg-white text-primary font-bold text-xs rounded-xl hover:bg-white/90 transition-all shadow-md"
            >
              Browse Opportunities
            </Link>
            <Link
              to="/student/resume-analysis"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/20"
            >
              Run AI Resume Check
            </Link>
            <Link
              to="/student/mock-interview"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all border border-white/20"
            >
              <Mic className="w-3.5 h-3.5 inline mr-1" />
              Mock Interview
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Profile Completion"
          value={`${data?.profileCompletion || 20}%`}
          icon={Award}
          color="primary"
          subtitle={user?.department || 'Student Profile'}
        />
        <StatCard
          title="Saved Bookmarks"
          value={data?.savedCount || 0}
          icon={Bookmark}
          color="amber"
          subtitle="In your wishlist"
        />
        <StatCard
          title="Applied Opportunities"
          value={data?.appliedCount || 0}
          icon={Briefcase}
          color="emerald"
          subtitle="Tracked applications"
        />
        <StatCard
          title="Rejections Logged"
          value={rejectionStats?.totalRejections || 0}
          icon={Target}
          color="rose"
          subtitle={rejectionStats?.topTag ? `Top: ${rejectionStats.topTag}` : 'Track patterns'}
        />
      </div>

      {/* Main Grid: Charts + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Line Chart */}
          <div className="bg-surface rounded-3xl p-6 border border-theme-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-theme-text text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 text-primary mr-2" />
                  Application Progress
                </h3>
                <p className="text-xs text-theme-text-muted">Monthly application trend over 6 months</p>
              </div>
              <Link to="/student/applications" className="text-xs font-semibold text-primary hover:underline">
                View All →
              </Link>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#fff', 
                      borderColor: isDark ? '#334155' : '#e2e8f0', 
                      borderRadius: '12px', 
                      color: isDark ? '#fff' : '#0f172a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={chartColors.chart1} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: chartColors.chart1, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart + Activity Feed side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Donut Chart */}
            <div className="bg-surface rounded-3xl p-6 border border-theme-border shadow-sm">
              <h3 className="font-bold text-theme-text text-base mb-4">Application Status</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="count"
                      nameKey="status"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#fff', 
                        borderRadius: '10px', 
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {statusChartData.map((entry, i) => (
                  <div key={entry.status} className="flex items-center space-x-1.5 text-[11px] text-theme-text-secondary">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutColors[i] }}></div>
                    <span>{entry.status} ({entry.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-surface rounded-3xl p-6 border border-theme-border shadow-sm">
              <h3 className="font-bold text-theme-text text-base mb-4 flex items-center">
                <Activity className="w-4 h-4 text-primary mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {activityFeed.length === 0 ? (
                  <p className="text-xs text-theme-text-muted py-6 text-center">No recent activity yet.</p>
                ) : (
                  activityFeed.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-theme-text line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-theme-text-muted line-clamp-1">{item.message}</p>
                          <p className="text-[10px] text-theme-text-muted mt-0.5">
                            {new Date(item.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar + Upcoming */}
        <div className="space-y-6">
          
          {/* Mini Calendar Heatmap */}
          <div className="bg-surface rounded-3xl p-6 border border-theme-border shadow-sm">
            <h3 className="font-bold text-theme-text text-base mb-4 flex items-center">
              <Calendar className="w-4 h-4 text-primary mr-2" />
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-theme-text-muted text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const eventCount = eventsByDate[day] || 0;
                const isToday = day === now.getDate();
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium relative
                      ${isToday ? 'bg-primary text-white font-bold ring-2 ring-primary/30' : ''}
                      ${!isToday && eventCount > 0 ? 'bg-primary/15 text-primary font-semibold' : ''}
                      ${!isToday && eventCount === 0 ? 'text-theme-text-secondary hover:bg-surface-hover' : ''}
                    `}
                  >
                    {day}
                    {eventCount > 0 && !isToday && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <Link to="/student/calendar" className="block mt-4 text-center py-2 bg-surface-hover text-primary text-xs font-semibold rounded-xl hover:bg-primary/10 transition-colors">
              Open Full Calendar →
            </Link>
          </div>

          {/* Upcoming This Week */}
          <div className="bg-surface rounded-3xl p-6 border border-theme-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-theme-text text-base flex items-center">
                <Clock className="w-4 h-4 text-amber-500 mr-2" />
                Upcoming This Week
              </h3>
            </div>

            <div className="space-y-3">
              {calendarEvents.length === 0 && (!data?.upcomingDeadlines || data.upcomingDeadlines.length === 0) ? (
                <p className="text-xs text-theme-text-muted py-6 text-center">No events this week.</p>
              ) : (
                <>
                  {calendarEvents.slice(0, 3).map(ev => (
                    <div key={ev._id} className="p-3 bg-surface-hover rounded-xl border border-theme-border">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${typeColors[ev.type] || 'bg-primary'}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                          {ev.type?.replace('-', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-theme-text line-clamp-1">{ev.title}</h4>
                      <p className="text-[11px] text-theme-text-muted">
                        {ev.companyName && `${ev.companyName} · `}
                        {new Date(ev.date).toLocaleDateString()} {ev.time && `at ${ev.time}`}
                      </p>
                    </div>
                  ))}
                  {(data?.upcomingDeadlines || []).slice(0, 2).map(item => (
                    <div key={item._id} className="p-3 bg-surface-hover rounded-xl border border-theme-border">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">Deadline</span>
                      </div>
                      <h4 className="text-xs font-bold text-theme-text line-clamp-1">{item.role}</h4>
                      <p className="text-[11px] text-theme-text-muted">
                        {item.companyName} · {new Date(item.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>

            <Link to="/student/calendar" className="block mt-4 text-center py-2 bg-surface-hover text-primary text-xs font-semibold rounded-xl hover:bg-primary/10 transition-colors">
              View All Events →
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-theme-text text-xl flex items-center">
              <Sparkles className="w-5 h-5 text-primary mr-2" />
              Recommended for You
            </h3>
            <p className="text-xs text-theme-text-muted">Matched with your profile skills: {user?.skills?.join(', ') || 'General'}</p>
          </div>
          <Link to="/student/opportunities" className="text-xs font-semibold text-primary hover:underline">
            View All ({data?.recommendedOpportunities?.length || 0}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!data?.recommendedOpportunities || data.recommendedOpportunities.length === 0 ? (
            <p className="text-sm text-theme-text-muted col-span-3 py-8 text-center bg-surface rounded-2xl border border-theme-border">
              No recommended opportunities available right now.
            </p>
          ) : (
            data.recommendedOpportunities.slice(0, 3).map(op => (
              <OpportunityCard key={op._id} opportunity={op} onBookmarkChange={fetchDashboard} />
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
