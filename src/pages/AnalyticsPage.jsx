import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { BarChart3, Lightbulb } from 'lucide-react';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#14b8a6', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', fontSize: 13, boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.unit || ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [studyHours, setStudyHours] = useState(null);
  const [taskProgress, setTaskProgress] = useState(null);
  const [subjectProgress, setSubjectProgress] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [shRes, tpRes, spRes, insRes] = await Promise.all([
          analyticsAPI.getStudyHours(),
          analyticsAPI.getTaskProgress(),
          analyticsAPI.getSubjectProgress(),
          analyticsAPI.getInsights(),
        ]);
        setStudyHours(shRes.data.data);
        setTaskProgress(tpRes.data.data);
        setSubjectProgress(spRes.data.data);
        setInsights(insRes.data.insights);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Analytics</h1></div>
        <div className="grid-2" style={{ gap: 20 }}>
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const tasksByStatus = taskProgress?.tasksByStatus || [];
  const tasksByPriority = taskProgress?.tasksByPriority || [];
  const assignmentsByStatus = taskProgress?.assignmentsByStatus || [];
  const totalTasks = tasksByStatus.reduce((acc, d) => acc + d.count, 0);
  const completedTasks = tasksByStatus.find(d => d.status === 'completed')?.count || 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Your study performance and productivity insights</p>
        </div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <Lightbulb size={18} color="var(--warning-600)" />
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Productivity Insights</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} className={`insight-card ${ins.type}`}>
                <span style={{ fontSize: 18 }}>{ins.icon}</span>
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Hours Charts */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
        {/* Weekly hours */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Weekly Study Hours</h3>
          {studyHours?.weekly?.every(d => d.hours === 0) ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>No sessions recorded this week</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studyHours?.weekly || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} name="Hours" unit="h" />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subject hours */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Study Hours by Subject</h3>
          {!studyHours?.bySubject?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>No study sessions recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={studyHours.bySubject} cx="50%" cy="50%" outerRadius={80} dataKey="hours" nameKey="name" label={({ name, value }) => `${name}: ${value}h`} labelLine={false}>
                  {studyHours.bySubject.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}h`, 'Study Hours']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task Progress Charts */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
        {/* Tasks by status */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Task Completion Rate</h3>
          {totalTasks === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>No tasks created yet</div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary-600)' }}>{totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0}%</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{completedTasks} of {totalTasks} tasks completed</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={tasksByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v.replace('-', ' ')} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Assignment status */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Assignment Status</h3>
          {!assignmentsByStatus.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>No assignments yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={assignmentsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="status">
                  {assignmentsByStatus.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name.replace('-', ' ')]} />
                <Legend formatter={v => v.replace(/-/g, ' ')} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subject Progress */}
      {subjectProgress?.subjects?.length > 0 && (
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Subject-wise Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {subjectProgress.subjects.map((subject) => (
              <div key={subject.id}>
                <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: subject.color }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tasks: {subject.completedTasks}/{subject.totalTasks}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-600)' }}>{subject.overallProgress}%</span>
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${subject.overallProgress}%`, background: `linear-gradient(90deg, ${subject.color}, ${subject.color}99)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly trend */}
      {studyHours?.monthly?.length > 0 && (
        <div className="card card-body">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Monthly Study Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={studyHours.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" stroke="#6366f1" fill="url(#areaGradient)" strokeWidth={2} name="Hours" unit="h" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
