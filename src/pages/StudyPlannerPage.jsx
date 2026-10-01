import { useState, useEffect } from 'react';
import { studyPlansAPI, subjectsAPI } from '../api';
import { Plus, Calendar, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';

const studyTypes = ['reading', 'revision', 'practice', 'assignment', 'exam-preparation'];
const defaultForm = { subjectId: '', topic: '', date: '', startTime: '09:00', endTime: '10:00', studyType: 'reading', notes: '' };

const typeColors = {
  reading: '#6366f1',
  revision: '#f97316',
  practice: '#22c55e',
  assignment: '#ef4444',
  'exam-preparation': '#8b5cf6',
};

export default function StudyPlannerPage() {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 6);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        studyPlansAPI.getAll({ startDate: weekStart.toISOString(), endDate: weekEnd.toISOString() }),
        subjectsAPI.getAll()
      ]);
      setPlans(pRes.data.plans);
      setSubjects(sRes.data.subjects);
    } catch { toast.error('Failed to load plans'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [weekStart]);

  const openCreate = (date) => {
    setEditItem(null);
    setForm({ ...defaultForm, date: format(date || new Date(), 'yyyy-MM-dd') });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({ subjectId: p.subjectId?._id || '', topic: p.topic, date: format(new Date(p.date), 'yyyy-MM-dd'), startTime: p.startTime, endTime: p.endTime, studyType: p.studyType, notes: p.notes || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return toast.error('Topic is required');
    setSaving(true);
    try {
      const payload = { ...form, subjectId: form.subjectId || null };
      if (editItem) {
        const res = await studyPlansAPI.update(editItem._id, payload);
        setPlans(prev => prev.map(p => p._id === editItem._id ? res.data.plan : p));
        toast.success('Plan updated!');
      } else {
        const res = await studyPlansAPI.create(payload);
        setPlans(prev => [...prev, res.data.plan]);
        toast.success('Study session planned!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studyPlansAPI.delete(deleteItem._id);
      setPlans(prev => prev.filter(p => p._id !== deleteItem._id));
      toast.success('Plan deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const toggleComplete = async (plan) => {
    try {
      const res = await studyPlansAPI.update(plan._id, { completed: !plan.completed });
      setPlans(prev => prev.map(p => p._id === plan._id ? res.data.plan : p));
    } catch { toast.error('Failed to update'); }
  };

  const getPlansForDay = (day) => plans.filter(p => isSameDay(new Date(p.date), day));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Planner</h1>
          <p className="page-subtitle">Week of {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => openCreate()} id="add-plan-btn"><Plus size={16} /> Add Session</button>
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(prev => subWeeks(prev, 1))}><ChevronLeft size={16} /></button>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Today</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(prev => addWeeks(prev, 1))}><ChevronRight size={16} /></button>
      </div>

      {/* Calendar grid */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="week-header" style={{ padding: '0 12px', paddingTop: 12 }}>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="week-day-header">
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{format(day, 'EEE')}</div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isSameDay(day, new Date()) ? 'var(--primary-600)' : 'transparent',
                color: isSameDay(day, new Date()) ? 'white' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '4px auto 0', fontWeight: isSameDay(day, new Date()) ? 700 : 500, fontSize: 14
              }}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="week-grid" style={{ padding: '8px 12px 16px', minHeight: 300 }}>
          {weekDays.map(day => {
            const dayPlans = getPlansForDay(day);
            return (
              <div key={day.toISOString()} className={`week-cell ${isSameDay(day, new Date()) ? 'today' : ''}`}
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => openCreate(day)}>
                {dayPlans.map(plan => (
                  <div
                    key={plan._id}
                    className="plan-event"
                    style={{
                      borderLeftColor: typeColors[plan.studyType] || 'var(--primary-500)',
                      background: `${typeColors[plan.studyType] || 'var(--primary-500)'}18`,
                      color: typeColors[plan.studyType] || 'var(--primary-700)',
                      textDecoration: plan.completed ? 'line-through' : 'none',
                      opacity: plan.completed ? 0.6 : 1,
                    }}
                    onClick={(e) => { e.stopPropagation(); openEdit(plan); }}
                  >
                    {plan.startTime} {plan.topic}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap" style={{ marginTop: 16 }}>
        {studyTypes.map(type => (
          <div key={type} className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: typeColors[type] }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{type.replace(/-/g, ' ')}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Study Session' : 'Plan Study Session'}
        footer={
          <>
            {editItem && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-500)', marginRight: 'auto' }} onClick={() => { setDeleteItem(editItem); setShowModal(false); }}><Trash2 size={14} /> Delete</button>}
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Plan'}</button>
          </>
        }>
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">General</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Topic *</label>
            <input className="form-input" placeholder="What will you study?" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Study Type</label>
            <select className="form-select" value={form.studyType} onChange={(e) => setForm({ ...form, studyType: e.target.value })}>
              {studyTypes.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Session notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 70 }} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Plan" message={`Delete "${deleteItem?.topic}"?`} loading={deleting} />
    </div>
  );
}
