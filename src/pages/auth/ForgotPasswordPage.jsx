import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP sent to your email (check server console in dev mode)');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon"><GraduationCap size={24} color="white" /></div>
          <span className="auth-logo-text">StudySphere</span>
        </div>

        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive an OTP</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} id="forgot-email" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: 8 }} disabled={loading} id="forgot-submit">
            {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
              : <><span>Send OTP</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
