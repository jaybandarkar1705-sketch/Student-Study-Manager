import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api';
import { User, Mail, Building, BookOpen, GraduationCap, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || '', college: user?.college || '', course: user?.course || '', yearSemester: user?.yearSemester || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SS';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      {/* Profile header */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.fullName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>@{user?.username}</p>
            {user?.course && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.course} · {user?.yearSemester}</p>}
          </div>
          <button className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setEditing(!editing)}>
            {editing ? <><X size={15} /> Cancel</> : <><Edit2 size={15} /> Edit Profile</>}
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Personal Information</h3>

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            {editing ? (
              <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                <User size={16} color="var(--text-muted)" /> {user?.fullName || '—'}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              <Mail size={16} color="var(--text-muted)" /> {user?.email}
              <span className="badge badge-success">Verified</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Username</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
              <span style={{ color: 'var(--text-muted)' }}>@</span> {user?.username}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">College / Institution</label>
            {editing ? (
              <input className="form-input" placeholder="Your college name" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                <Building size={16} color="var(--text-muted)" /> {user?.college || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
              </div>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Course / Program</label>
              {editing ? (
                <input className="form-input" placeholder="e.g. B.Tech CSE" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                  <BookOpen size={16} color="var(--text-muted)" /> {user?.course || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </div>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Year / Semester</label>
              {editing ? (
                <input className="form-input" placeholder="e.g. 3rd Year" value={form.yearSemester} onChange={(e) => setForm({ ...form, yearSemester: e.target.value })} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                  <GraduationCap size={16} color="var(--text-muted)" /> {user?.yearSemester || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="card card-body">
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Account Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Member since</span>
            <span style={{ fontWeight: 600 }}>{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Account status</span>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Password</span>
            <span style={{ fontWeight: 600 }}>••••••••</span>
          </div>
        </div>
      </div>
    </div>
  );
}
