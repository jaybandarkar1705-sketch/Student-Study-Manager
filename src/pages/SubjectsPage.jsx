import { useState, useEffect } from 'react';
import { subjectsAPI } from '../api';
import { Plus, BookOpen, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899', '#06b6d4'];

const defaultForm = { name: '', code: '', faculty: '', semester: '', color: '#6366f1', description: '', credits: '' };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getAll({ search });
      setSubjects(res.data.subjects);
    } catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, [search]);

  const openCreate = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, code: s.code, faculty: s.faculty, semester: s.semester, color: s.color, description: s.description, credits: s.credits || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Subject name is required');
    setSaving(true);
    try {
      if (editItem) {
        const res = await subjectsAPI.update(editItem._id, form);
        setSubjects(prev => prev.map(s => s._id === editItem._id ? res.data.subject : s));
        toast.success('Subject updated!');
      } else {
        const res = await subjectsAPI.create(form);
        setSubjects(prev => [res.data.subject, ...prev]);
        toast.success('Subject created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await subjectsAPI.delete(deleteItem._id);
      setSubjects(prev => prev.filter(s => s._id !== deleteItem._id));
      toast.success('Subject deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-subtitle">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-subject-btn">
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ maxWidth: 380, marginBottom: 20 }}>
        <Search size={16} color="var(--text-muted)" />
        <input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card card-body">
              <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Add your first subject to start organizing your studies."
          action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add First Subject</button>}
        />
      ) : (
        <div className="grid-3">
          {subjects.map((subject) => (
            <div key={subject._id} className="card card-hover" style={{ overflow: 'hidden' }}>
              <div style={{ height: 6, background: subject.color }} />
              <div className="card-body">
                <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${subject.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subject.color, fontWeight: 800, fontSize: 18 }}>
                    {subject.name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(subject)} title="Edit"><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(subject)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{subject.name}</h3>
                {subject.code && <span className="badge badge-neutral" style={{ marginBottom: 8 }}>{subject.code}</span>}
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {subject.faculty && <span>👨‍🏫 {subject.faculty}</span>}
                  {subject.semester && <span>📅 {subject.semester}</span>}
                  {subject.description && <span style={{ marginTop: 4, lineHeight: 1.5 }}>{subject.description.slice(0, 80)}{subject.description.length > 80 ? '...' : ''}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Subject' : 'Add Subject'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-subject-btn">
              {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input className="form-input" placeholder="e.g. Data Structures" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input className="form-input" placeholder="e.g. CS301" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Faculty Name</label>
              <input className="form-input" placeholder="Prof. Smith" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input className="form-input" placeholder="e.g. Semester 5" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-swatches">
              {COLORS.map(c => (
                <div key={c} className={`color-swatch ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
