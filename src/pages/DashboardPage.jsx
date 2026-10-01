import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, tasksAPI, assignmentsAPI, studySessionsAPI } from '../api';
import { CheckSquare, ClipboardList, GraduationCap, Timer, Target, TrendingUp, Plus, BookOpen, StickyNote, Clock, ChevronRight, Zap, CalendarDays } from 'lucide-react';
import { SkeletonStatCard } from '../components/common/SkeletonLoader';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color, bgColor, change }) {
  return (
    <div className="stat-card card-hover">
      <div className="stat-icon" style={{ background: bgColor, color }}>
        <Icon size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change !== undefined && (
          <div className="stat-change" style={{ color }}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDeadlineStatus(date) {
  const d = new Date(date);
  if (isPast(d)) return { label: 'Overdue', color: 'var(--danger-600)', bg: 'var(--danger-50)' };
  const diff = (d - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 2) return { label: 'Due Soon', color: 'var(--warning-600)', bg: 'var(--warning-50)' };
  return { label: formatDistanceToNow(d, { addSuffix: true }), color: 'var(--success-600)', bg: 'var(--success-50)' };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        setData(res.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {};

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          {format(new Date(), "EEEE, MMMM do yyyy")} — Here's your academic overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard icon={CheckSquare} label="Tasks Due Today" value={stats.tasksDueToday ?? 0} color="#6366f1" bgColor="#eef2ff" />
            <StatCard icon={ClipboardList} label="Pending Assignments" value={stats.pendingAssignments ?? 0} color="#f97316" bgColor="#fff7ed" />
            <StatCard icon={GraduationCap} label="Upcoming Exams" value={stats.upcomingExams ?? 0} color="#ef4444" bgColor="#fef2f2" />
            <StatCard icon={Timer} label="Study Hours This Week" value={stats.weekStudyHours ?? 0} color="#3b82f6" bgColor="#eff6ff" />
            <StatCard icon={TrendingUp} label="Tasks Completed" value={stats.completedTasks ?? 0} color="#22c55e" bgColor="#f0fdf4" change={stats.taskCompletionRate ? `${stats.taskCompletionRate}% completion rate` : undefined} />
            <StatCard icon={Target} label="Active Goals" value={stats.activeGoals ?? 0} color="#8b5cf6" bgColor="#f5f3ff" />
          </>
        )}
      </div>

      {/* Main content */}
      <div className="dashboard-main">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upcoming deadlines */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Upcoming Deadlines</span>
              </div>
              <Link to="/assignments" className="text-sm" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                View all
              </Link>
            </div>
            <div>
              {!loading && (data?.upcomingDeadlines?.length === 0) && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  🎉 No upcoming deadlines this week!
                </div>
              )}
              {(data?.upcomingDeadlines || []).map((item) => {
                const status = getDeadlineStatus(item.dueDate);
                return (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.subjectId?.color || 'var(--primary-500)', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.subjectId?.name || 'No subject'}</div>
                    </div>
                    <span className="badge" style={{ background: status.bg, color: status.color, fontSize: 11 }}>{status.label}</span>
                  </div>
                );
              })}
              {loading && <div style={{ padding: 20 }}><div className="skeleton" style={{ height: 14, marginBottom: 12 }} /><div className="skeleton" style={{ height: 14, width: '80%' }} /></div>}
            </div>
          </div>

          {/* Today's Study Plan */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Clock size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Today's Schedule</span>
              </div>
              <Link to="/planner" className="text-sm" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>View planner</Link>
            </div>
            <div>
              {!loading && (data?.todayPlans?.length === 0) && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  📅 No study sessions planned today. <Link to="/planner" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Add one?</Link>
                </div>
              )}
              {(data?.todayPlans || []).map((plan) => (
                <div key={plan._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ background: 'var(--primary-50)', borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)' }}>{plan.startTime}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{plan.topic}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plan.subjectId?.name || 'General'} · {plan.studyType}</div>
                  </div>
                  {plan.completed && <span className="badge badge-success">Done</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div className="card card-body">
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/tasks', icon: CheckSquare, label: 'Add Task', color: 'var(--primary-600)', bg: 'var(--primary-50)' },
                { to: '/assignments', icon: ClipboardList, label: 'Add Assignment', color: 'var(--warning-600)', bg: 'var(--warning-50)' },
                { to: '/sessions', icon: Timer, label: 'Start Study Session', color: 'var(--secondary-600)', bg: '#eff6ff' },
                { to: '/notes', icon: StickyNote, label: 'Add Note', color: '#8b5cf6', bg: '#f5f3ff' },
                { to: '/exams', icon: GraduationCap, label: 'Add Exam', color: 'var(--danger-600)', bg: 'var(--danger-50)' },
              ].map(({ to, icon: Icon, label, color, bg }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', transition: 'all 0.15s', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                      <Icon size={16} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Goals */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Target size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Active Goals</span>
              </div>
              <Link to="/goals" className="text-sm" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>All goals</Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              {!loading && (data?.activeGoals?.length === 0) && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No active goals. <Link to="/goals" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Set one!</Link>
                </div>
              )}
              {(data?.activeGoals || []).map((goal) => (
                <div key={goal._id} style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{goal.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)' }}>{goal.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <StickyNote size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Recent Notes</span>
              </div>
              <Link to="/notes" className="text-sm" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>All notes</Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              {!loading && (data?.recentNotes?.length === 0) && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No notes yet. <Link to="/notes" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Create one!</Link>
                </div>
              )}
              {(data?.recentNotes || []).map((note) => (
                <div key={note._id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{note.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {note.subjectId?.name || 'General'} · {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
