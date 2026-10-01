import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, profileAPI } from '../api';
import { Moon, Sun, Bell, Lock, LogOut, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(user?.settings?.theme || 'light');
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [emailNotifications, setEmailNotifications] = useState(user?.settings?.emailNotifications ?? true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleThemeToggle = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    updateUser({ settings: { ...user?.settings, theme: newTheme } });
    try {
      await profileAPI.updateSettings({ theme: newTheme, notifications, emailNotifications });
    } catch { /* ignore */ }
  };

  const handleSavePreferences = async () => {
    setSavingSettings(true);
    try {
      await profileAPI.updateSettings({ theme, notifications, emailNotifications });
      updateUser({ settings: { theme, notifications, emailNotifications } });
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return toast.error('Please fill all fields');
    if (passwordForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    setChangingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setChangingPassword(false); }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      {/* Appearance */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🎨 Appearance</h3>
        <div>
          <label className="form-label">Theme</label>
          <div className="flex gap-3">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
            ].map(({ value, icon: Icon, label }) => (
              <div
                key={value}
                onClick={() => handleThemeToggle(value)}
                style={{
                  flex: 1, padding: '16px', borderRadius: 12, border: `2px solid ${theme === value ? 'var(--primary-500)' : 'var(--border-color)'}`,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  background: theme === value ? 'var(--primary-50)' : 'var(--bg-secondary)', transition: 'all 0.15s'
                }}
              >
                <Icon size={22} color={theme === value ? 'var(--primary-600)' : 'var(--text-muted)'} />
                <span style={{ fontSize: 13, fontWeight: 600, color: theme === value ? 'var(--primary-600)' : 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🔔 Notifications</h3>
        {[
          { label: 'In-app notifications', value: notifications, onChange: setNotifications },
          { label: 'Email notifications', value: emailNotifications, onChange: setEmailNotifications },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex justify-between items-center" style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
            <button
              onClick={() => onChange(!value)}
              style={{
                width: 44, height: 24, borderRadius: 12, background: value ? 'var(--primary-500)' : 'var(--border-color)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        ))}
        <button className="btn btn-primary btn-sm" onClick={handleSavePreferences} disabled={savingSettings}>
          {savingSettings ? 'Saving...' : <><Save size={14} /> Save Preferences</>}
        </button>
      </div>

      {/* Change Password */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🔒 Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} id="current-password" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Min. 8 characters" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} id="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} id="confirm-new-password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={changingPassword}>
            {changingPassword ? 'Changing...' : <><Lock size={14} /> Change Password</>}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card card-body" style={{ borderColor: 'var(--danger-200)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--danger-600)' }}>⚠️ Danger Zone</h3>
        <div className="flex justify-between items-center">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Sign out of StudySphere</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>You will be redirected to the login page</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
