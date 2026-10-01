import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, Building, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
    college: '', course: '', yearSemester: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Only letters, numbers, underscore';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome to StudySphere!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ alignItems: 'flex-start', padding: '24px' }}>
      <div className="auth-card animate-slide-up" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={24} color="white" />
          </div>
          <span className="auth-logo-text">StudySphere</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your organized academic journey today</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <input name="fullName" type="text" className="form-input" placeholder="John Doe" value={form.fullName} onChange={handleChange} id="signup-fullname" />
              </div>
              {errors.fullName && <p className="form-error">{errors.fullName}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <div className="input-with-icon">
                <span className="input-icon" style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>@</span>
                <input name="username" type="text" className="form-input" placeholder="johndoe" value={form.username} onChange={handleChange} id="signup-username" />
              </div>
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} id="signup-email" />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-with-icon relative">
                <Lock className="input-icon" />
                <input name="password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} style={{ paddingRight: 40 }} id="signup-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-with-icon">
                <Lock className="input-icon" />
                <input name="confirmPassword" type="password" className="form-input" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} id="signup-confirm-password" />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College / Institution</label>
            <div className="input-with-icon">
              <Building className="input-icon" />
              <input name="college" type="text" className="form-input" placeholder="Your college name" value={form.college} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Course / Program</label>
              <div className="input-with-icon">
                <BookOpen className="input-icon" />
                <input name="course" type="text" className="form-input" placeholder="e.g. B.Tech CSE" value={form.course} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Year / Semester</label>
              <input name="yearSemester" type="text" className="form-input" placeholder="e.g. 3rd Year Sem 5" value={form.yearSemester} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: 8 }} disabled={loading} id="signup-submit">
            {loading ? (
              <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
            ) : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
