import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected pages
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import TasksPage from './pages/TasksPage';
import AssignmentsPage from './pages/AssignmentsPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import StudySessionsPage from './pages/StudySessionsPage';
import NotesPage from './pages/NotesPage';
import ExamsPage from './pages/ExamsPage';
import GoalsPage from './pages/GoalsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const pageConfig = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your academic overview' },
  '/subjects': { title: 'Subjects', subtitle: 'Manage your courses' },
  '/tasks': { title: 'Tasks', subtitle: 'Track your study tasks' },
  '/assignments': { title: 'Assignments', subtitle: 'Stay on top of deadlines' },
  '/planner': { title: 'Study Planner', subtitle: 'Plan your weekly study schedule' },
  '/sessions': { title: 'Study Sessions', subtitle: 'Track your study time' },
  '/notes': { title: 'Notes', subtitle: 'Your personal academic notes' },
  '/exams': { title: 'Exams', subtitle: 'Prepare for your examinations' },
  '/goals': { title: 'Goals', subtitle: 'Set and track academic goals' },
  '/analytics': { title: 'Analytics', subtitle: 'Insights into your study habits' },
  '/profile': { title: 'Profile', subtitle: 'Manage your account' },
  '/settings': { title: 'Settings', subtitle: 'Customize your experience' },
};

function ProtectedLayout({ path, element }) {
  const config = pageConfig[path] || {};
  return (
    <ProtectedRoute>
      <Layout title={config.title} subtitle={config.subtitle}>
        {/* Layout uses Outlet, so we wrap element inside Route */}
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected - using Layout with Outlet */}
      <Route element={
        <ProtectedRoute>
          <Layout title="Dashboard" subtitle="Your academic overview" />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Subjects" subtitle="Manage your courses" />
        </ProtectedRoute>
      }>
        <Route path="/subjects" element={<SubjectsPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Tasks" subtitle="Track your study tasks" />
        </ProtectedRoute>
      }>
        <Route path="/tasks" element={<TasksPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Assignments" subtitle="Stay on top of deadlines" />
        </ProtectedRoute>
      }>
        <Route path="/assignments" element={<AssignmentsPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Study Planner" subtitle="Plan your weekly schedule" />
        </ProtectedRoute>
      }>
        <Route path="/planner" element={<StudyPlannerPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Study Sessions" subtitle="Track your study time" />
        </ProtectedRoute>
      }>
        <Route path="/sessions" element={<StudySessionsPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Notes" subtitle="Your personal academic notes" />
        </ProtectedRoute>
      }>
        <Route path="/notes" element={<NotesPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Exams" subtitle="Prepare for your examinations" />
        </ProtectedRoute>
      }>
        <Route path="/exams" element={<ExamsPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Goals" subtitle="Set and track academic goals" />
        </ProtectedRoute>
      }>
        <Route path="/goals" element={<GoalsPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Analytics" subtitle="Insights into your study habits" />
        </ProtectedRoute>
      }>
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Profile" subtitle="Manage your account" />
        </ProtectedRoute>
      }>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={
        <ProtectedRoute>
          <Layout title="Settings" subtitle="Customize your experience" />
        </ProtectedRoute>
      }>
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
