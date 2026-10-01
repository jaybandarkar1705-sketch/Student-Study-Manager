import { useState, useEffect } from 'react';
import { examsAPI, subjectsAPI } from '../api';
import { Plus, GraduationCap, Edit2, Trash2, Clock } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format, differenceInDays, isPast } from 'date-fns';

const defaultForm = { name: '', subjectId: '', examDate: '', examTime: '', location: '', preparationStatus: 'not-started', notes: '' };

const prepStatus = {
  'not-started': { label: 'Not Started', color: 'var(--neutral-600)', bg: 'var(--neutral-100)' },
  'preparing': { label: 'Preparing', color: 'var(--warning-600)', bg: 'var(--warning-50)' },
  'ready': { label: 'Ready', color: 'var(--success-600)', bg: 'var(--success-50)' },
};

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([examsAPI.getAll(), subjectsAPI.getAll()]);
      setExams(eRes.data.exams);
      setSubjects(sRes.data.subjects);
    } catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (e) => {
    setEditItem(e);
    setForm({ name: e.name, subjectId: e.subjectId?._id || '', examDate: format(new Date(e.examDate), 'yyyy-MM-dd'), examTime: e.examTime || '', location: e.location || '', preparationStatus: e.preparationStatus, notes: e.notes || '' });
    setShowModal(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!form.name.trim() || !form.examDate) return toast.error('Name and date are required');
    setSaving(true);
    try {
      const payload = { ...form, subjectId: form.subjectId || null };
      if (editItem) {
        const res = await examsAPI.update(editItem._id, payload);
        setExams(prev => prev.map(e => e._id === editItem._id ? res.data.exam : e));
        toast.success('Exam updated!');
      } else {
        const res = await examsAPI.create(payload);
        setExams(prev => [...prev, res.data.exam].sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
        toast.success('Exam added!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await examsAPI.delete(deleteItem._id);
      setExams(prev => prev.filter(e => e._id !== deleteItem._id));
      toast.success('Exam deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const upcoming = exams.filter(e => !isPast(new Date(e.examDate)));
  const past = exams.filter(e => isPast(new Date(e.examDate)));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-subtitle">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-exam-btn"><Plus size={16} /> Add Exam</button>
      </div>

      {loading ? (
        <div className="grid-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}</div>
      ) : exams.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No exams added" description="Add your upcoming exams to track preparation." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Exam</button>} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Upcoming Exams</h2>
              <div className="grid-3" style={{ marginBottom: 32 }}>
                {upcoming.map((exam) => {
                  const daysLeft = differenceInDays(new Date(exam.examDate), new Date());
                  const urgency = daysLeft <= 3 ? 'var(--danger-600)' : daysLeft <= 7 ? 'var(--warning-600)' : 'var(--primary-600)';
                  const statusInfo = prepStatus[exam.preparationStatus];
                  return (
                    <div key={exam._id} className="card card-hover" style={{ overflow: 'hidden' }}>
                      <div style={{ height: 4, background: urgency }} />
                      <div className="card-body">
                        <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{exam.name}</h3>
                            {exam.subjectId && (
                              <div className="flex items-center gap-2">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: exam.subjectId.color }} />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{exam.subjectId.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(exam)}><Edit2 size={13} /></button>
                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(exam)}><Trash2 size={13} /></button>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', margin: '12px 0' }}>
                          <div className="countdown-number" style={{ color: urgency }}>{daysLeft}</div>
                          <div className="countdown-label">Days Remaining</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            {format(new Date(exam.examDate), 'MMM d, yyyy')}{exam.examTime ? ` · ${exam.examTime}` : ''}
                          </div>
                          {exam.location && <div style={{ color: 'var(--text-muted)' }}>📍 {exam.location}</div>}
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <span className="badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {past.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)' }}>Past Exams</h2>
              <div className="grid-3">
                {past.map((exam) => (
                  <div key={exam._id} className="card" style={{ opacity: 0.6 }}>
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700 }}>{exam.name}</h3>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{format(new Date(exam.examDate), 'MMM d, yyyy')}</div>
                        </div>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(exam)}><Edit2 size={13} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(exam)}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Exam' : 'Add Exam'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Exam Name *</label>
            <input className="form-input" placeholder="e.g. DBMS Mid-Semester Exam" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">No subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preparation Status</label>
              <select className="form-select" value={form.preparationStatus} onChange={(e) => setForm({ ...form, preparationStatus: e.target.value })}>
                <option value="not-started">Not Started</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Exam Date *</label>
              <input type="date" className="form-input" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Exam Time</label>
              <input type="time" className="form-input" value={form.examTime} onChange={(e) => setForm({ ...form, examTime: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location / Hall</label>
            <input className="form-input" placeholder="e.g. Hall A, Room 101" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Exam notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 70 }} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Exam" message={`Delete "${deleteItem?.name}"?`} loading={deleting} />
    </div>
  );
}
