import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary border-primary-200',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    indigo: 'bg-primary/10 text-primary border-primary-200',
  };

  return (
    <div className="bg-surface rounded-2xl p-5 border border-theme-border shadow-sm flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-xs font-semibold text-theme-text-muted uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-theme-text mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-theme-text-muted mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorStyles[color] || colorStyles.primary}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
