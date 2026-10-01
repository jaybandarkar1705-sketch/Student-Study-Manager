import { useState } from 'react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, updateUser } = useAuth();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setDarkMode(!darkMode);
    if (user) {
      updateUser({ settings: { ...user.settings, theme: newTheme } });
    }
  };

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={onMenuClick}
          id="mobile-menu-btn"
          style={{ display: 'none' }}
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-actions">
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={toggleTheme}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
