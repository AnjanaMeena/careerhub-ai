import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { value: 'online-test', label: 'Online Test', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { value: 'interview', label: 'Interview', color: 'bg-primary', textColor: 'text-primary', bgLight: 'bg-primary-50' },
  { value: 'deadline', label: 'Deadline', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
];

const CalendarPage = () => {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'interview', date: '', time: '', companyName: '', roundType: '', notes: '' });

  const fetchEvents = async () => {
    try {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const res = await api.get(`/calendar?month=${m}&year=${y}`);
      setEvents(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEvents(); }, [currentDate]);

  const openAddModal = (date) => {
    const d = date || new Date();
    setForm({ title: '', type: 'interview', date: d.toISOString().split('T')[0], time: '', companyName: '', roundType: '', notes: '' });
    setEditingEvent(null);
    setShowModal(true);
  };

  const openEditModal = (ev) => {
    setForm({
      title: ev.title, type: ev.type,
      date: new Date(ev.date).toISOString().split('T')[0],
      time: ev.time || '', companyName: ev.companyName || '',
      roundType: ev.roundType || '', notes: ev.notes || ''
    });
    setEditingEvent(ev);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/calendar/${editingEvent._id}`, form);
        toast.success('Event updated');
      } else {
        await api.post('/calendar', form);
        toast.success('Event created');
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) { toast.error('Error deleting event'); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventsByDay = {};
  events.forEach(ev => {
    const d = new Date(ev.date).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(ev);
  });

  // Week view helpers
  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getTypeConfig = (type) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[1];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-theme-text flex items-center">
            <CalendarIcon className="w-6 h-6 text-primary mr-3" />
            Placement Calendar
          </h1>
          <p className="text-sm text-theme-text-muted mt-1">Track tests, interviews, and deadlines</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-surface border border-theme-border rounded-xl overflow-hidden">
            <button onClick={() => setView('month')} className={`px-4 py-2 text-xs font-semibold transition-colors ${view === 'month' ? 'bg-primary text-white' : 'text-theme-text-secondary hover:bg-surface-hover'}`}>Month</button>
            <button onClick={() => setView('week')} className={`px-4 py-2 text-xs font-semibold transition-colors ${view === 'week' ? 'bg-primary text-white' : 'text-theme-text-secondary hover:bg-surface-hover'}`}>Week</button>
          </div>
          <button onClick={() => openAddModal()} className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-primary text-white font-semibold text-xs rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /><span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-surface rounded-3xl border border-theme-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-surface-hover transition-colors"><ChevronLeft className="w-5 h-5 text-theme-text-secondary" /></button>
          <h2 className="text-lg font-bold text-theme-text">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-surface-hover transition-colors"><ChevronRight className="w-5 h-5 text-theme-text-secondary" /></button>
        </div>

        {view === 'month' ? (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-xs font-bold text-theme-text-muted text-center py-2">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDow }, (_, i) => <div key={`empty-${i}`} className="min-h-[80px]" />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayEvents = eventsByDay[day] || [];
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div
                    key={day}
                    onClick={() => openAddModal(new Date(year, month, day))}
                    className={`min-h-[80px] p-1.5 rounded-xl border cursor-pointer transition-all hover:border-primary/40 ${
                      isToday ? 'bg-primary/5 border-primary/30' : 'border-theme-border-light hover:bg-surface-hover'
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isToday ? 'text-primary font-bold' : 'text-theme-text-secondary'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => {
                        const cfg = getTypeConfig(ev.type);
                        return (
                          <div key={ev._id} onClick={(e) => { e.stopPropagation(); openEditModal(ev); }}
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate ${cfg.bgLight} ${cfg.textColor}`}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && <p className="text-[9px] text-theme-text-muted pl-1">+{dayEvents.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Week View */
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((d, i) => {
                const dayEvents = events.filter(ev => {
                  const evDate = new Date(ev.date);
                  return evDate.getDate() === d.getDate() && evDate.getMonth() === d.getMonth();
                });
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className={`rounded-2xl border p-3 min-h-[200px] ${isToday ? 'border-primary/40 bg-primary/5' : 'border-theme-border'}`}>
                    <div className="text-center mb-3">
                      <p className="text-[10px] font-bold text-theme-text-muted uppercase">{d.toLocaleDateString('en', { weekday: 'short' })}</p>
                      <p className={`text-lg font-black ${isToday ? 'text-primary' : 'text-theme-text'}`}>{d.getDate()}</p>
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.map(ev => {
                        const cfg = getTypeConfig(ev.type);
                        return (
                          <div key={ev._id} onClick={() => openEditModal(ev)} className={`p-2 rounded-lg cursor-pointer ${cfg.bgLight} border border-transparent hover:border-primary/20`}>
                            <p className={`text-[10px] font-bold ${cfg.textColor}`}>{ev.title}</p>
                            {ev.time && <p className="text-[9px] text-theme-text-muted">{ev.time}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Type Legend */}
      <div className="flex items-center space-x-6">
        {EVENT_TYPES.map(t => (
          <div key={t.value} className="flex items-center space-x-2 text-xs text-theme-text-secondary">
            <div className={`w-3 h-3 rounded-full ${t.color}`}></div>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-3xl shadow-2xl border border-theme-border w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-theme-text">{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-hover"><X className="w-5 h-5 text-theme-text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Time</label>
                  <input value={form.time} onChange={e => setForm({...form, time: e.target.value})} placeholder="e.g. 10:00 AM" className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Company</label>
                  <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              {form.type === 'interview' && (
                <div>
                  <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Round Type</label>
                  <input value={form.roundType} onChange={e => setForm({...form, roundType: e.target.value})} placeholder="e.g. Technical Round 1" className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-theme-text-secondary block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-surface text-theme-text text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-primary text-white font-semibold text-sm rounded-xl shadow-md hover:opacity-90 transition-all">
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
                {editingEvent && (
                  <button type="button" onClick={() => { handleDelete(editingEvent._id); setShowModal(false); }} className="px-4 py-2.5 bg-red-50 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 transition-colors">
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

export default CalendarPage;
