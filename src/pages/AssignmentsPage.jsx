import { useState, useEffect } from 'react';
import { assignmentsAPI, subjectsAPI } from '../api';
import { Plus, ClipboardList, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format, isPast, differenceInDays } from 'date-fns';

const defaultForm = { title: '', description: '', subjectId: '', dueDate: '', status: 'not-started', priority: 'medium', notes: '' };

function DeadlineBadge({ dueDate, status }) {
  if (status === 'submitted' || status === 'completed') return <span className="badge badge-success">Submitted</span>;
  const d = new Date(dueDate);
  if (isPast(d)) return <span className="badge" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>Overdue</span>;
  const diff = differenceInDays(d, new Date());
  if (diff <= 2) return <span className="badge" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>Due Soon ({diff === 0 ? 'Today' : `${diff}d`})</span>;
  return <span className="badge badge-neutral">In {diff} days</span>;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', subjectId: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([assignmentsAPI.getAll(filters), subjectsAPI.getAll()]);
      setAssignments(aRes.data.assignments);
      setSubjects(sRes.data.subjects);
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const openCreate = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (a) => {
    setEditItem(a);
    setForm({ title: a.title, description: a.description || '', subjectId: a.subjectId?._id || '', dueDate: format(new Date(a.dueDate), 'yyyy-MM-dd'), status: a.status, priority: a.priority, notes: a.notes || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.dueDate) return toast.error('Due date is required');
    setSaving(true);
    try {
      const payload = { ...form, subjectId: form.subjectId || null };
      if (editItem) {
        const res = await assignmentsAPI.update(editItem._id, payload);
        setAssignments(prev => prev.map(a => a._id === editItem._id ? res.data.assignment : a));
        toast.success('Assignment updated!');
      } else {
        const res = await assignmentsAPI.create(payload);
        setAssignments(prev => [res.data.assignment, ...prev]);
        toast.success('Assignment created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assignmentsAPI.delete(deleteItem._id);
      setAssignments(prev => prev.filter(a => a._id !== deleteItem._id));
      toast.success('Assignment deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const markSubmitted = async (item) => {
    try {
      const res = await assignmentsAPI.update(item._id, { status: 'submitted' });
      setAssignments(prev => prev.map(a => a._id === item._id ? res.data.assignment : a));
      toast.success('Marked as submitted! 📤');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-assignment-btn"><Plus size={16} /> Add Assignment</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="completed">Completed</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card"><div style={{ padding: 20 }}><div className="skeleton" style={{ height: 50, marginBottom: 12 }} /><div className="skeleton" style={{ height: 50 }} /></div></div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments found" description="Add your first assignment to start tracking deadlines." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Assignment</button>} />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Subject</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{a.title}</div>
                      {a.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.description.slice(0, 60)}...</div>}
                    </td>
                    <td>
                      {a.subjectId ? (
                        <div className="flex items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.subjectId.color }} />
                          <span style={{ fontSize: 13 }}>{a.subjectId.name}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{format(new Date(a.dueDate), 'MMM d, yyyy')}</div>
                      <DeadlineBadge dueDate={a.dueDate} status={a.status} />
                    </td>
                    <td><span className={`badge priority-${a.priority}`}>{a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}</span></td>
                    <td>
                      <span className={`badge ${a.status === 'submitted' || a.status === 'completed' ? 'badge-success' : a.status === 'in-progress' ? 'status-in-progress' : 'badge-neutral'}`}>
                        {a.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {(a.status === 'not-started' || a.status === 'in-progress') && (
                          <button className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => markSubmitted(a)}>Submit</button>
                        )}
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(a)}><Edit2 size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(a)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Assignment' : 'Add Assignment'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Assignment title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80 }} />
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
              <label className="form-label">Due Date *</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 60 }} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Assignment" message={`Delete "${deleteItem?.title}"?`} loading={deleting} />
    </div>
  );
}
