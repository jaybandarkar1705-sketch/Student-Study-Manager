import { Link } from 'react-router-dom';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 120, fontWeight: 900, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 24 }}>
          404
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 36 }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard">
            <button className="btn btn-primary">
              <Home size={16} /> Go to Dashboard
            </button>
          </Link>
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
