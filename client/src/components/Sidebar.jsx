import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, User, Briefcase, Bookmark, FileText, 
  Sparkles, Target, MessageSquare, Users, LogOut,
  Calendar, AlertCircle, Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isStudent, isAdmin, logout } = useAuth();

  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Opportunities', path: '/student/opportunities', icon: Briefcase },
    { name: 'My Bookmarks', path: '/student/bookmarks', icon: Bookmark },
    { name: 'Application Tracker', path: '/student/applications', icon: FileText },
    { name: 'Placement Calendar', path: '/student/calendar', icon: Calendar },
    { name: 'Rejection Tracker', path: '/student/rejections', icon: AlertCircle },
    { name: 'Mock Interview', path: '/student/mock-interview', icon: Mic },
    { name: 'AI Resume Analysis', path: '/student/resume-analysis', icon: Sparkles },
    { name: 'Skill Gap Analysis', path: '/student/skill-gap', icon: Target },
    { name: 'AI Career Advisor', path: '/student/ai-chat', icon: MessageSquare },
  ];

  const adminNav = [
    { name: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Opportunities', path: '/admin/opportunities', icon: Briefcase },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
  ];

  const navItems = isStudent ? studentNav : adminNav;

  return (
    <aside className="w-64 bg-sidebar-bg border-r border-theme-border min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 transition-colors">
      <div className="space-y-6">
        
        {/* User Role Badge Header */}
        <div className="px-3 py-2.5 rounded-xl bg-surface-hover border border-theme-border">
          <p className="text-xs uppercase tracking-wider font-semibold text-theme-text-muted">Signed in as</p>
          <p className="text-sm font-bold text-theme-text truncate mt-0.5">{user?.name || 'User'}</p>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isAdmin ? 'bg-primary-50 text-primary' : 'bg-primary-50 text-primary'
          }`}>
            {user?.role} Portal
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-md shadow-primary/20'
                      : 'text-theme-text-secondary hover:bg-sidebar-hover hover:text-primary'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Progress for Students */}
      <div className="space-y-4 pt-4 border-t border-theme-border">
        {isStudent && (
          <div className="p-3.5 rounded-xl bg-primary-50 border border-primary-200">
            <div className="flex justify-between items-center text-xs font-semibold text-theme-text mb-1.5">
              <span>Profile Completion</span>
              <span className="text-primary">{user?.profileCompletion || 20}%</span>
            </div>
            <div className="w-full bg-theme-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${user?.profileCompletion || 20}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-theme-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
