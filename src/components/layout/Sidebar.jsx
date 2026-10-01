import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, CheckSquare, ClipboardList, Calendar,
  Timer, StickyNote, GraduationCap, Target, BarChart3, User,
  Settings, LogOut, GraduationCap as Logo, X, Menu
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = [
  { section: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Academic', items: [
    { to: '/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/exams', icon: GraduationCap, label: 'Exams' },
  ]},
  { section: 'Study', items: [
    { to: '/planner', icon: Calendar, label: 'Study Planner' },
    { to: '/sessions', icon: Timer, label: 'Study Sessions' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
  ]},
  { section: 'Progress', items: [
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]},
  { section: 'Account', items: [
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SS';

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Logo size={20} color="white" />
          </div>
          <span className="sidebar-logo-text">StudySphere</span>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon"
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', display: 'none' }}
            id="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <div className="sidebar-section">{section}</div>
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName || 'Student'}</div>
              <div className="user-role">{user?.course || 'Student'}</div>
            </div>
          </div>
          <button
            className="sidebar-link"
            style={{ width: '100%', marginTop: '4px', color: 'rgba(239,68,68,0.8)' }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
