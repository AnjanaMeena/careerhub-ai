import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, Sparkles } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Placement', 'Internship', 'Hackathon', 'Workshop', 'Scholarship'];

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category !== 'All') queryParams.append('category', category);

      const res = await api.get(`/opportunities?${queryParams.toString()}`);
      setOpportunities(res.data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center">
            <Briefcase className="w-6 h-6 text-indigo-600 mr-2" />
            Campus Opportunities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Discover placements, internships, hackathons & workshops with AI skill match scores.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role, company, skills..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <LoadingSpinner label="Fetching latest campus opportunities..." />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No Opportunities Found"
          message={`No matches found for category "${category}" ${search ? `and search "${search}"` : ''}.`}
          actionText="Reset Filters"
          onAction={() => { setSearch(''); setCategory('All'); fetchOpportunities(); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((op) => (
            <OpportunityCard
              key={op._id}
              opportunity={op}
              onBookmarkChange={fetchOpportunities}
              onStatusChange={fetchOpportunities}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default OpportunitiesPage;
