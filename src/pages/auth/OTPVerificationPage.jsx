import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp });
      toast.success('OTP verified!');
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend OTP'); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon"><GraduationCap size={24} color="white" /></div>
          <span className="auth-logo-text">StudySphere</span>
        </div>

        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-subtitle">Enter the 6-digit OTP sent to <strong style={{ color: 'var(--primary-400)' }}>{email}</strong></p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24, marginTop: -16 }}>
          💡 In development mode, check your backend server console for the OTP.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">OTP Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: 24, fontWeight: 700 }}
              id="otp-input"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: 8 }} disabled={loading} id="otp-submit">
            {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
              : <><span>Verify OTP</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Didn't receive OTP?{' '}
          <button onClick={resendOTP} style={{ background: 'none', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
