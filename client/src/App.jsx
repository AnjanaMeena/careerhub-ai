import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import BookmarksPage from './pages/BookmarksPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import SkillGapPage from './pages/SkillGapPage';
import AIChatPage from './pages/AIChatPage';
import CalendarPage from './pages/CalendarPage';
import RejectionTrackerPage from './pages/RejectionTrackerPage';
import MockInterviewPage from './pages/MockInterviewPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOpportunitiesPage from './pages/AdminOpportunitiesPage';
import AdminStudentsPage from './pages/AdminStudentsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Student Portal Routes */}
      <Route element={<ProtectedRoute allowedRole="Student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="opportunity/:id" element={<OpportunityDetailPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="skill-gap" element={<SkillGapPage />} />
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="rejections" element={<RejectionTrackerPage />} />
          <Route path="mock-interview" element={<MockInterviewPage />} />
        </Route>
      </Route>

      {/* Protected Admin Portal Routes */}
      <Route element={<ProtectedRoute allowedRole="Admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="opportunities" element={<AdminOpportunitiesPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
        </Route>
      </Route>

      {/* Catch-all Wildcard Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
