import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Trash2, X, GraduationCap, Award, BookOpen, ExternalLink, Mail, Phone } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students${search ? `?search=${search}` : ''}`);
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to fetch students list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewStudent = (st) => {
    setSelectedStudent(st);
    setShowDetailModal(true);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account? All applications and bookmarks will be removed.')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student account deleted');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center">
            <Users className="w-6 h-6 text-purple-600 mr-2" />
            Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">View student profiles, academic details, and manage campus user accounts.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            placeholder="Search student by name, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading student directory..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          message="No student accounts match your search query."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Department & Year</th>
                  <th className="py-4 px-6">CGPA</th>
                  <th className="py-4 px-6">Profile Completion</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 font-bold flex items-center justify-center text-sm">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{st.name}</p>
                          <p className="text-xs text-slate-400">{st.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{st.department || 'N/A'}</p>
                      <p className="text-[11px] text-slate-400">{st.year}</p>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-indigo-600">{st.cgpa || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${st.profileCompletion || 20}%` }}></div>
                        </div>
                        <span className="text-xs font-bold">{st.profileCompletion || 20}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleViewStudent(st)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(st._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Profile Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Student Profile Overview</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                  <p className="font-bold text-xs mt-0.5">{selectedStudent.department || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Academic Year</p>
                  <p className="font-bold text-xs mt-0.5">{selectedStudent.year}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                  <p className="text-[10px] uppercase font-bold text-slate-400">CGPA</p>
                  <p className="font-bold text-xs text-indigo-600 mt-0.5">{selectedStudent.cgpa || 0}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                  <p className="text-[10px] uppercase font-bold text-slate-400">University</p>
                  <p className="font-bold text-xs mt-0.5">{selectedStudent.university || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 mb-1.5">Registered Skills</p>
                <div className="flex flex-wrap gap-1">
                  {selectedStudent.skills?.map((sk, idx) => (
                    <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {selectedStudent.resumeUrl && (
                <div className="pt-2">
                  <a
                    href={selectedStudent.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <span>View Resume File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStudentsPage;
