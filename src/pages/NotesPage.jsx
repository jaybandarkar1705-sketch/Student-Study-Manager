import { useState, useEffect } from 'react';
import { notesAPI, subjectsAPI } from '../api';
import { Plus, StickyNote, Edit2, Trash2, Search, Pin, PinOff } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const NOTE_COLORS = ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7aa'];
const defaultForm = { title: '', content: '', subjectId: '', tags: '', color: '#fef3c7', isPinned: false };

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', subjectId: '', tag: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nRes, sRes] = await Promise.all([notesAPI.getAll(filters), subjectsAPI.getAll()]);
      setNotes(nRes.data.notes);
      setSubjects(sRes.data.subjects);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const openCreate = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (n) => {
    setEditItem(n);
    setForm({ title: n.title, content: n.content, subjectId: n.subjectId?._id || '', tags: (n.tags || []).join(', '), color: n.color, isPinned: n.isPinned });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    const payload = { ...form, subjectId: form.subjectId || null, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    setSaving(true);
    try {
      if (editItem) {
        const res = await notesAPI.update(editItem._id, payload);
        setNotes(prev => prev.map(n => n._id === editItem._id ? res.data.note : n));
        toast.success('Note updated!');
      } else {
        const res = await notesAPI.create(payload);
        setNotes(prev => [res.data.note, ...prev]);
        toast.success('Note created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await notesAPI.delete(deleteItem._id);
      setNotes(prev => prev.filter(n => n._id !== deleteItem._id));
      toast.success('Note deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const togglePin = async (note) => {
    try {
      const res = await notesAPI.update(note._id, { isPinned: !note.isPinned });
      setNotes(prev => prev.map(n => n._id === note._id ? res.data.note : n).sort((a, b) => b.isPinned - a.isPinned));
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned!');
    } catch { toast.error('Failed to pin note'); }
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-note-btn"><Plus size={16} /> New Note</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search notes..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        {allTags.length > 0 && (
          <select className="form-select" style={{ width: 'auto' }} value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}>
            <option value="">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid-3">{Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}</div>
      ) : notes.length === 0 ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Create your first note to keep track of important information." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Create Note</button>} />
      ) : (
        <div className="grid-3">
          {notes.map((note) => (
            <div key={note._id} className="card-hover" style={{ background: note.color || '#fef3c7', borderRadius: 12, padding: 20, border: '1px solid transparent', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}
              onClick={() => openEdit(note)}>
              {note.isPinned && (
                <div style={{ position: 'absolute', top: 12, right: 12, color: '#6366f1' }}><Pin size={14} /></div>
              )}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 8, paddingRight: note.isPinned ? 20 : 0 }}>{note.title}</h3>
              {note.content && (
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>
              )}
              {(note.tags?.length > 0 || note.subjectId) && (
                <div className="flex gap-2 flex-wrap" style={{ marginBottom: 8 }}>
                  {note.subjectId && <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(0,0,0,0.1)', borderRadius: 20, padding: '2px 8px', color: '#334155' }}>{note.subjectId.name}</span>}
                  {note.tags?.slice(0, 2).map(t => <span key={t} style={{ fontSize: 10, fontWeight: 600, background: 'rgba(0,0,0,0.08)', borderRadius: 20, padding: '2px 8px', color: '#475569' }}># {t}</span>)}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ padding: 4 }} onClick={() => togglePin(note)}>{note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}</button>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ padding: 4, color: 'var(--danger-500)' }} onClick={() => setDeleteItem(note)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Note' : 'Create Note'} size="lg"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Note title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-textarea" placeholder="Write your note here..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ minHeight: 180, fontFamily: 'var(--font-primary)', lineHeight: 1.7 }} />
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
              <label className="form-label">Tags</label>
              <input className="form-input" placeholder="tag1, tag2, ..." value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-swatches">
              {NOTE_COLORS.map(c => (
                <div key={c} className={`color-swatch ${form.color === c ? 'selected' : ''}`} style={{ background: c, border: '2px solid transparent' }} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Note" message={`Delete "${deleteItem?.title}"?`} loading={deleting} />
    </div>
  );
}
