import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, CheckSquare, Calendar, Timer, BarChart3, Target, ArrowRight, Star, Zap, Shield } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'Smart Dashboard', desc: 'Get a complete overview of your academic life at a glance. Stats, deadlines, and progress all in one place.' },
  { icon: CheckSquare, title: 'Task Management', desc: 'Organize tasks by subject, priority, and deadline. Never miss a study task with smart reminders.' },
  { icon: Calendar, title: 'Study Planner', desc: 'Plan your week with a visual calendar. Schedule study sessions for each subject and topic.' },
  { icon: BookOpen, title: 'Assignment Tracking', desc: 'Track all assignments with due dates, priority levels, and submission status in real time.' },
  { icon: GraduationCap, title: 'Exam Preparation', desc: 'Manage upcoming exams with countdown timers, preparation status, and study notes.' },
  { icon: BarChart3, title: 'Study Analytics', desc: 'Visualize your study hours, task completion rate, and productivity trends with beautiful charts.' },
];

const stats = [
  { value: '10+', label: 'Features' },
  { value: '100%', label: 'Free to Use' },
  { value: '∞', label: 'Notes & Tasks' },
  { value: '24/7', label: 'Accessible' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="flex items-center gap-3">
          <div className="auth-logo-icon" style={{ width: 38, height: 38, borderRadius: 10 }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'white' }}>
            StudySphere
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, transition: 'color 0.15s' }}>
            Login
          </Link>
          <Link to="/signup">
            <button className="hero-btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge">
            <Zap size={14} />
            <span>Complete Student Productivity Suite</span>
          </div>
          <h1 className="hero-title">
            Your Academic Life,<br />
            <span className="gradient-text">Organized.</span>
          </h1>
          <p className="hero-subtitle">
            Manage subjects, assignments, study sessions, exams and goals from one powerful workspace. 
            Built for serious students.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => navigate('/signup')}>
              Get Started Free <ArrowRight size={18} style={{ display: 'inline', marginLeft: 6 }} />
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/login')}>
              Login to Account
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 flex-wrap" style={{ marginTop: 56 }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>{value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: '42%', maxWidth: 600, opacity: 0.6, display: 'none' }}>
          {/* Placeholder for dashboard preview */}
        </div>
      </section>

      {/* Features */}
      <section className="section section-dark" id="features">
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Everything You Need</div>
            <h2 className="section-title">One Platform for Your Entire Academic Life</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              From managing subjects to tracking study hours — StudySphere has every tool you need to excel academically.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 20 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #1e1b4b, #0f172a)' }}>
        <div className="section-container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: 'var(--primary-300)', marginBottom: 24 }}>
            <Star size={14} fill="currentColor" />
            Start for free today
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: 'white', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            Plan Better. Study Smarter.<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Achieve More.
            </span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Join students who use StudySphere to organize their academic journey and reach their goals.
          </p>
          <div className="hero-buttons" style={{ justifyContent: 'center' }}>
            <button className="hero-btn-primary" onClick={() => navigate('/signup')} style={{ fontSize: 16, padding: '14px 32px' }}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', background: '#020617', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-3" style={{ marginBottom: 12 }}>
          <div className="auth-logo-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
            <GraduationCap size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>
            StudySphere
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          © 2024 StudySphere. Plan Better. Study Smarter. Achieve More.
        </p>
      </footer>
    </div>
  );
}
