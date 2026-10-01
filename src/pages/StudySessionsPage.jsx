import { useState, useEffect, useRef } from 'react';
import { studySessionsAPI, subjectsAPI } from '../api';
import { Play, Pause, Square, Timer, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { format, formatDuration } from 'date-fns';

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [timer, setTimer] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [startForm, setStartForm] = useState({ subjectId: '', topic: '', notes: '' });
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const intervalRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);

  const fetchData = async () => {
    try {
      const [sRes, subRes] = await Promise.all([studySessionsAPI.getAll({ status: 'completed' }), subjectsAPI.getAll()]);
      setSessions(sRes.data.sessions);
      setSubjects(subRes.data.subjects);
      // Check for active session
      const activeRes = await studySessionsAPI.getAll({ status: 'active' });
      if (activeRes.data.sessions.length > 0) {
        const s = activeRes.data.sessions[0];
        setActiveSession(s);
        const elapsed = Math.floor((new Date() - new Date(s.startTime)) / 1000);
        setTimer(elapsed);
      }
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (activeSession && !paused) {
      intervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [activeSession, paused]);

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startSession = async (e) => {
    e.preventDefault();
    try {
      const res = await studySessionsAPI.create(startForm);
      setActiveSession(res.data.session);
      setTimer(0);
      setPaused(false);
      setShowStartModal(false);
      toast.success('Study session started! 📚');
    } catch { toast.error('Failed to start session'); }
  };

  const pauseSession = async () => {
    if (!paused) {
      pauseStartRef.current = Date.now();
      setPaused(true);
      await studySessionsAPI.update(activeSession._id, { status: 'paused' });
      toast('Session paused', { icon: '⏸️' });
    } else {
      const pausedMs = Date.now() - pauseStartRef.current;
      pausedTimeRef.current += pausedMs;
      setPaused(false);
      await studySessionsAPI.update(activeSession._id, { status: 'active' });
      toast('Session resumed', { icon: '▶️' });
    }
  };

  const stopSession = async () => {
    if (!activeSession) return;
    try {
      const res = await studySessionsAPI.update(activeSession._id, { status: 'completed' });
      setSessions(prev => [res.data.session, ...prev]);
      setActiveSession(null);
      setTimer(0);
      setPaused(false);
      clearInterval(intervalRef.current);
      toast.success('Session completed and saved! 🎉');
    } catch { toast.error('Failed to stop session'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studySessionsAPI.delete(deleteItem._id);
      setSessions(prev => prev.filter(s => s._id !== deleteItem._id));
      toast.success('Session deleted');
      setDeleteItem(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const totalThisWeek = sessions
    .filter(s => new Date(s.startTime) >= new Date(Date.now() - 7 * 86400000))
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Sessions</h1>
          <p className="page-subtitle">Track your study time and productivity</p>
        </div>
        {!activeSession && (
          <button className="btn btn-primary" onClick={() => setShowStartModal(true)} id="start-session-btn">
            <Play size={16} /> Start Session
          </button>
        )}
      </div>

      {/* Active Session Timer */}
      {activeSession && (
        <div className="card card-body timer-card animate-bounce-in" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))', color: 'white', border: 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>
            📚 {activeSession.subjectId?.name || 'General Study'} {activeSession.topic ? `· ${activeSession.topic}` : ''}
          </div>
          <div className="session-timer" style={{ WebkitTextFillColor: 'white', background: 'none', marginBottom: 24 }}>
            {formatTimer(timer)}
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 24 }}>
            {paused ? '⏸️ Session Paused' : '🔴 Session Active'}
          </div>
          <div className="flex justify-center gap-3">
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} onClick={pauseSession}>
              {paused ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
            </button>
            <button className="btn" style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }} onClick={stopSession}>
              <Square size={16} /> Stop & Save
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: 'var(--secondary-600)' }}><Timer size={22} /></div>
          <div>
            <div className="stat-value">{Math.round(totalThisWeek / 60 * 10) / 10}h</div>
            <div className="stat-label">Study hours this week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: 'var(--success-600)' }}><Clock size={22} /></div>
          <div>
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Total sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}><Timer size={22} /></div>
          <div>
            <div className="stat-value">{sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + (s.duration || 0), 0) / sessions.length) : 0}m</div>
            <div className="stat-label">Avg session length</div>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="card card-body"><div className="skeleton" style={{ height: 50, marginBottom: 12 }} /><div className="skeleton" style={{ height: 50 }} /></div>
      ) : sessions.length === 0 ? (
        <EmptyState icon={Timer} title="No sessions yet" description="Start your first study session to begin tracking your time." action={!activeSession && <button className="btn btn-primary" onClick={() => setShowStartModal(true)}><Play size={16} /> Start Session</button>} />
      ) : (
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: 15 }}>Session History</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontSize: 13 }}>{format(new Date(s.startTime), 'MMM d, yyyy · HH:mm')}</td>
                    <td>
                      {s.subjectId ? (
                        <div className="flex items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.subjectId.color }} />
                          {s.subjectId.name}
                        </div>
                      ) : '—'}
                    </td>
                    <td>{s.topic || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      <span className="badge badge-primary">{Math.round(s.duration || 0)} min</span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger-500)' }} onClick={() => setDeleteItem(s)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)} title="Start Study Session"
        footer={<><button className="btn btn-secondary" onClick={() => setShowStartModal(false)}>Cancel</button><button className="btn btn-primary" onClick={startSession}><Play size={15} /> Start</button></>}>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <select className="form-select" value={startForm.subjectId} onChange={(e) => setStartForm({ ...startForm, subjectId: e.target.value })}>
            <option value="">General Study</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Topic</label>
          <input className="form-input" placeholder="What will you study?" value={startForm.topic} onChange={(e) => setStartForm({ ...startForm, topic: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea" placeholder="Session notes..." value={startForm.notes} onChange={(e) => setStartForm({ ...startForm, notes: e.target.value })} style={{ minHeight: 80 }} />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Session" message="Delete this study session record?" loading={deleting} />
    </div>
  );
}
