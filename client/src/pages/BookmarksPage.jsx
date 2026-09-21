import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks');
      setBookmarks(res.data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleBookmarkRemoved = (id) => {
    setBookmarks(prev => prev.filter(op => op._id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center">
          <Bookmark className="w-6 h-6 text-amber-500 mr-2 fill-amber-500/20" />
          My Bookmarks
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Saved opportunities wishlist. Remove bookmarks anytime.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching your saved bookmarks..." />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="No Bookmarked Opportunities"
          message="You haven't bookmarked any opportunities yet. Browse active placements and click the bookmark icon to save them here."
          actionText="Browse Opportunities"
          onAction={() => navigate('/student/opportunities')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((op) => (
            <OpportunityCard
              key={op._id}
              opportunity={op}
              onBookmarkChange={handleBookmarkRemoved}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default BookmarksPage;
