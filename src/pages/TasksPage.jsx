import { useState, useEffect } from 'react';
import { tasksAPI, subjectsAPI } from '../api';
import { Plus, CheckSquare, Edit2, Trash2, Search, Filter, Check } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const defaultForm = { title: '', description: '', subjectId: '', priority: 'medium', status: 'pending', dueDate: '', estimatedTime: '', tags: '' };

const priorityConfig = {
  low: { label: 'Low', className: 'badge priority-low' },
  medium: { label: 'Medium', className: 'badge priority-medium' },
  high: { label: 'High', className: 'badge priority-high' },
};

const statusConfig = {
  pending: { label: 'Pending', className: 'badge status-pending' },
  'in-progress': { label: 'In Progress', className: 'badge status-in-progress' },
  completed: { label: 'Completed', className: 'badge status-completed' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', subjectId: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, subjectsRes] = await Promise.all([
        tasksAPI.getAll({ ...filters, page: pagination.page, limit: 20, sortBy: 'dueDate' }),
        subjectsAPI.getAll()
      ]);
      setTasks(tasksRes.data.tasks);
      setPagination({ page: tasksRes.data.page, pages: tasksRes.data.pages, total: tasksRes.data.total });
      setSubjects(subjectsRes.data.subjects);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters, pagination.page]);

  const openCreate = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (t) => {
    setEditItem(t);
    setForm({
      title: t.title, description: t.description || '', subjectId: t.subjectId?._id || '',
      priority: t.priority, status: t.status,
      dueDate: t.dueDate ? format(new Date(t.dueDate), 'yyyy-MM-dd') : '',
      estimatedTime: t.estimatedTime || '', tags: (t.tags || []).join(', ')
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    const payload = { ...form, subjectId: form.subjectId || null, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], dueDate: form.dueDate || null, estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : 0 };
    setSaving(true);
    try {
      if (editItem) {
        const res = await tasksAPI.update(editItem._id, payload);
        setTasks(prev => prev.map(t => t._id === editItem._id ? res.data.task : t));
        toast.success('Task updated!');
      } else {
        const res = await tasksAPI.create(payload);
        setTasks(prev => [res.data.task, ...prev]);
        toast.success('Task created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tasksAPI.delete(deleteItem._id);
      setTasks(prev => prev.filter(t => t._id !== deleteItem._id));
      toast.success('Task deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await tasksAPI.update(task._id, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? res.data.task : t));
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task reopened');
    } catch { toast.error('Failed to update task'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{pagination.total} task{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-task-btn"><Plus size={16} /> Add Task</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
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

      {/* Tasks List */}
      {loading ? (
        <div className="card"><div style={{ padding: 20 }}><div className="skeleton" style={{ height: 50, marginBottom: 12 }} /><div className="skeleton" style={{ height: 50, marginBottom: 12 }} /><div className="skeleton" style={{ height: 50 }} /></div></div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Create your first task to get started." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Task</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
            return (
              <div key={task._id} className="card card-hover" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, opacity: task.status === 'completed' ? 0.7 : 1 }}>
                <button
                  onClick={() => toggleComplete(task)}
                  style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.status === 'completed' ? 'var(--success-500)' : 'var(--border-color)'}`, background: task.status === 'completed' ? 'var(--success-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
                >
                  {task.status === 'completed' && <Check size={13} color="white" strokeWidth={3} />}
                </button>

                {task.subjectId && <div style={{ width: 6, height: 36, borderRadius: 3, background: task.subjectId.color, flexShrink: 0 }} />}

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {task.subjectId && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.subjectId.name}</span>}
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger-600)' : 'var(--text-muted)' }}>
                        📅 {format(new Date(task.dueDate), 'MMM d')} {isOverdue && '(Overdue)'}
                      </span>
                    )}
                    {task.estimatedTime > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱ {task.estimatedTime}min</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={priorityConfig[task.priority]?.className}>{priorityConfig[task.priority]?.label}</span>
                  <span className={statusConfig[task.status]?.className}>{statusConfig[task.status]?.label}</span>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(task)}><Edit2 size={14} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(task)}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPagination(prev => ({ ...prev, page: p }))}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Task' : 'Add Task'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
              <label className="form-label">Due Date</label>
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
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Est. Time (minutes)</label>
              <input type="number" className="form-input" placeholder="60" value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="e.g. revision, urgent" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Task" message={`Delete "${deleteItem?.title}"?`} loading={deleting} />
    </div>
  );
}
