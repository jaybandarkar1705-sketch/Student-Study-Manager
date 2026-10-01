import { useState, useEffect } from 'react';
import { goalsAPI, subjectsAPI } from '../api';
import { Plus, Target, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const defaultForm = { title: '', description: '', subjectId: '', targetDate: '', progress: 0, status: 'active', category: 'academic' };

const statusConfig = {
  active: { label: 'Active', color: 'var(--primary-600)', bg: 'var(--primary-50)' },
  completed: { label: 'Completed', color: 'var(--success-600)', bg: 'var(--success-50)' },
  paused: { label: 'Paused', color: 'var(--warning-600)', bg: 'var(--warning-50)' },
  cancelled: { label: 'Cancelled', color: 'var(--danger-600)', bg: 'var(--danger-50)' },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([goalsAPI.getAll(filter ? { status: filter } : {}), subjectsAPI.getAll()]);
      setGoals(gRes.data.goals);
      setSubjects(sRes.data.subjects);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const openCreate = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (g) => {
    setEditItem(g);
    setForm({ title: g.title, description: g.description || '', subjectId: g.subjectId?._id || '', targetDate: g.targetDate ? format(new Date(g.targetDate), 'yyyy-MM-dd') : '', progress: g.progress, status: g.status, category: g.category });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Goal title is required');
    setSaving(true);
    try {
      const payload = { ...form, subjectId: form.subjectId || null };
      if (editItem) {
        const res = await goalsAPI.update(editItem._id, payload);
        setGoals(prev => prev.map(g => g._id === editItem._id ? res.data.goal : g).filter(g => !filter || g.status === filter));
        toast.success('Goal updated!');
      } else {
        const res = await goalsAPI.create(payload);
        if (!filter || res.data.goal.status === filter) setGoals(prev => [res.data.goal, ...prev]);
        toast.success('Goal created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await goalsAPI.delete(deleteItem._id);
      setGoals(prev => prev.filter(g => g._id !== deleteItem._id));
      toast.success('Goal deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const updateProgress = async (goal, delta) => {
    const newProgress = Math.max(0, Math.min(100, goal.progress + delta));
    try {
      const res = await goalsAPI.update(goal._id, { progress: newProgress, status: newProgress === 100 ? 'completed' : goal.status });
      setGoals(prev => prev.map(g => g._id === goal._id ? res.data.goal : g));
      if (newProgress === 100) toast.success('Goal completed! 🎉');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">{goals.length} {filter || 'total'} goals</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-goal-btn"><Plus size={16} /> Add Goal</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 20 }}>
        {['active', 'completed', 'paused', ''].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals found" description="Set academic goals to track your progress." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Goal</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {goals.map((goal) => {
            const statusInfo = statusConfig[goal.status];
            return (
              <div key={goal._id} className="card card-hover" style={{ padding: '20px' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{goal.title}</h3>
                      <span className="badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>{statusInfo.label}</span>
                    </div>
                    {goal.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{goal.description}</p>}
                    <div className="flex items-center gap-3" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {goal.subjectId && <span>📚 {goal.subjectId.name}</span>}
                      {goal.targetDate && <span>🎯 Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>}
                      <span>🏷️ {goal.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(goal)}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(goal)}><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Progress</span>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ padding: 2 }} onClick={() => updateProgress(goal, -10)} disabled={goal.progress === 0}>
                        <ChevronDown size={14} />
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-600)', minWidth: 36, textAlign: 'center' }}>{goal.progress}%</span>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ padding: 2 }} onClick={() => updateProgress(goal, 10)} disabled={goal.progress === 100}>
                        <ChevronUp size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.progress === 100 ? 'linear-gradient(90deg, var(--success-500), var(--success-600))' : undefined }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Goal' : 'Add Goal'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input className="form-input" placeholder="e.g. Complete DBMS revision" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Goal details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 70 }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">General</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="academic">Academic</option>
                <option value="personal">Personal</option>
                <option value="skill">Skill</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input type="date" className="form-input" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Initial Progress: {form.progress}%</label>
            <input type="range" min="0" max="100" step="5" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} style={{ width: '100%' }} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Goal" message={`Delete "${deleteItem?.title}"?`} loading={deleting} />
    </div>
  );
}
