import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.newPassword || form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-layout">
        <div className="auth-card animate-bounce-in" style={{ textAlign: 'center' }}>
          <CheckCircle2 size={64} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Password Reset!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon"><GraduationCap size={24} color="white" /></div>
          <span className="auth-logo-text">StudySphere</span>
        </div>

        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Set your new password</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon relative">
              <Lock className="input-icon" />
              <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 8 characters" value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })} style={{ paddingRight: 40 }} id="reset-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} id="reset-confirm-password" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: 8 }} disabled={loading} id="reset-submit">
            {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
