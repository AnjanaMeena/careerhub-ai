import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-theme-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-primary bg-clip-text text-transparent">
              CareerHub AI
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-primary font-bold ml-2 px-1.5 py-0.5 rounded bg-primary-50">
              Campus AI
            </span>
          </div>
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User Auth state navigation */}
          {user ? (
            <div className="flex items-center space-x-3">
              {isStudent && <NotificationDropdown />}

              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-theme-text hover:bg-surface-hover transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              <div className="flex items-center space-x-2 border-l border-theme-border pl-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 text-primary font-bold flex items-center justify-center text-sm border border-primary-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-theme-text-muted hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-medium text-theme-text hover:text-primary px-3 py-2 rounded-xl transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-gradient-primary hover:opacity-90 px-4 py-2 rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
