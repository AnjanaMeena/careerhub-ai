import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AlertCircle, Plus, X, Trash2, Tag, BarChart3, List, Search, Edit2 } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ROUNDS = ['Online Test', 'Technical', 'HR', 'GD', 'Other'];
const SUGGESTED_TAGS = ['DSA', 'Communication', 'Project Depth', 'Nervousness', 'Domain Knowledge', 'System Design', 'Coding Speed', 'Behavioral', 'Resume Gap', 'HR Questions'];

const RejectionTrackerPage = () => {
  const { getChartColors, isDark } = useTheme();
  const [rejections, setRejections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('log');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ companyName: '', role: '', date: '', roundReached: 'Technical', notes: '', tags: [] });

  const fetchData = async () => {
    try {
      const [rejRes, anaRes] = await Promise.all([
        api.get('/rejections'),
        api.get('/rejections/analytics')
      ]);
      setRejections(rejRes.data || []);
      setAnalytics(anaRes.data || null);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = () => {
    setForm({ companyName: '', role: '', date: new Date().toISOString().split('T')[0], roundReached: 'Technical', notes: '', tags: [] });
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      companyName: item.companyName, role: item.role,
      date: new Date(item.date).toISOString().split('T')[0],
      roundReached: item.roundReached, notes: item.notes || '', tags: item.tags || []
    });
    setEditingItem(item);
    setShowModal(true);
  };

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/rejections/${editingItem._id}`, form);
        toast.success('Rejection updated');
      } else {
        await api.post('/rejections', form);
        toast.success('Rejection logged');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this rejection entry?')) return;
    try {
      await api.delete(`/rejections/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch (err) { toast.error('Error deleting'); }
  };

  const chartColors = getChartColors();
  const filtered = rejections.filter(r =>
    r.companyName.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-theme-text flex items-center">
            <AlertCircle className="w-6 h-6 text-primary mr-3" />
            Rejection Tracker
          </h1>
          <p className="text-sm text-theme-text-muted mt-1">Log rejections and find patterns to improve</p>
        </div>
        <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-primary text-white font-semibold text-xs rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /><span>Log Rejection</span>
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-surface border border-theme-border rounded-xl overflow-hidden w-fit">
        <button onClick={() => setActiveTab('log')} className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'log' ? 'bg-primary text-white' : 'text-theme-text-secondary hover:bg-surface-hover'}`}>
          <List className="w-4 h-4" /><span>Log View</span>
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-theme-text-secondary hover:bg-surface-hover'}`}>
          <BarChart3 className="w-4 h-4" /><span>Analytics</span>
        </button>
      </div>

      {activeTab === 'log' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
          </div>

          {/* Rejection List */}
          {filtered.length === 0 ? (
            <div className="bg-surface rounded-3xl border border-theme-border p-12 text-center">
              <AlertCircle className="w-10 h-10 text-theme-text-muted mx-auto mb-3" />
              <p className="text-sm text-theme-text-muted">No rejections logged yet. Start tracking to find patterns!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => (
                <div key={r._id} className="bg-surface rounded-2xl border border-theme-border p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-bold text-theme-text">{r.companyName}</h3>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">{r.roundReached}</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary mt-0.5">{r.role} · {new Date(r.date).toLocaleDateString()}</p>
                      {r.notes && <p className="text-xs text-theme-text-muted mt-2 leading-relaxed">{r.notes}</p>}
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {r.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button onClick={() => openEditModal(r)} className="p-1.5 rounded-lg hover:bg-surface-hover text-theme-text-muted hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-theme-text-muted hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Analytics View */
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl border border-theme-border p-5 text-center">
              <p className="text-3xl font-black text-theme-text">{analytics?.totalRejections || 0}</p>
              <p className="text-xs text-theme-text-muted mt-1">Total Rejections</p>
            </div>
            <div className="bg-surface rounded-2xl border border-theme-border p-5 text-center">
              <p className="text-lg font-black text-rose-500">{analytics?.topRound || '—'}</p>
              <p className="text-xs text-theme-text-muted mt-1">Most Common Round</p>
            </div>
            <div className="bg-surface rounded-2xl border border-theme-border p-5 text-center">
              <p className="text-lg font-black text-primary">{analytics?.topTag || '—'}</p>
              <p className="text-xs text-theme-text-muted mt-1">Top Weak Area</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Round Breakdown Chart */}
            <div className="bg-surface rounded-3xl border border-theme-border p-6 shadow-sm">
              <h3 className="font-bold text-theme-text text-base mb-4">Which Round I Fail At Most</h3>
              <div className="h-56">
                {analytics?.roundBreakdown && analytics.roundBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.roundBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <XAxis type="number" allowDecimals={false} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                      <YAxis type="category" dataKey="round" width={90} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} fill={chartColors.chart1} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-theme-text-muted text-center py-20">Not enough data yet</p>
                )}
              </div>
            </div>

            {/* Tag Breakdown Chart */}
            <div className="bg-surface rounded-3xl border border-theme-border p-6 shadow-sm">
              <h3 className="font-bold text-theme-text text-base mb-4">Most Common Weak Areas</h3>
              <div className="h-56">
                {analytics?.tagBreakdown && analytics.tagBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.tagBreakdown.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <XAxis type="number" allowDecimals={false} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                      <YAxis type="category" dataKey="tag" width={110} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} fill={chartColors.chart2} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-theme-text-muted text-center py-20">Add tags to see patterns</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-3xl shadow-2xl border border-theme-border w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-theme-text">{editingItem ? 'Edit Rejection' : 'Log Rejection'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-hover"><X className="w-5 h-5 text-theme-text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Company *</label>
                  <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Role *</label>
                  <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} required className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Round Reached *</label>
                  <select value={form.roundReached} onChange={e => setForm({...form, roundReached: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                    {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} placeholder="What went wrong? What was asked?" className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-text-secondary block mb-2">
                  <Tag className="w-3 h-3 inline mr-1" /> Tags (select what applied)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                        form.tags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-surface-hover text-theme-text-secondary border-theme-border hover:border-primary/40'
                      }`}
                    >{tag}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-primary text-white font-semibold text-sm rounded-xl shadow-md hover:opacity-90 transition-all">
                  {editingItem ? 'Update' : 'Log'} Rejection
                </button>
                {editingItem && (
                  <button type="button" onClick={() => { handleDelete(editingItem._id); setShowModal(false); }} className="px-4 py-2.5 bg-red-50 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectionTrackerPage;
