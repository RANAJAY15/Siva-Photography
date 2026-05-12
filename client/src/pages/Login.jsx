import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [mode, setMode]         = useState('login');   // 'login' | 'register'
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const switchMode = (m) => {
    setMode(m);
    setForm({ name: '', email: '', password: '', confirm: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register') {
      if (form.password !== form.confirm) {
        toast.error('Passwords do not match');
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        if (user.role === 'admin') {
          toast.error('Please use the Admin Portal to manage the gallery.');
          return;
        }
        toast.success(`Welcome back, ${user.name}! 🎉`);
        navigate('/gallery', { replace: true });
      } else {
        const user = await register(form.name, form.email, form.password);
        toast.success(`Account created! Welcome, ${user.name} 🎉`);
        navigate('/gallery', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || (mode === 'login' ? 'Invalid email or password' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-bg">
        <div className="login-orb orb1" />
        <div className="login-orb orb2" />
        <div className="login-orb orb3" />
        <div className="login-grid" />
      </div>

      <div className="login-container">
        {/* Left panel */}
        <div className="login-panel-left">
          <Link to="/" className="login-logo">
            <span className="logo-icon">◈</span> Siva's Photography
          </Link>
          <div className="login-panel-content">
            <h1 className="login-headline">
              Capture.<br />
              <span className="accent">Curate.</span><br />
              Inspire.
            </h1>
            <p className="login-sub">
              Explore stunning photographs shared by visual storytellers from around the world.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="login-panel-right">
          <div className="login-form-box glass-card">
            <div className="login-form-header">
              <h2 className="login-form-title">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="login-form-sub">
                {mode === 'login' ? 'Sign in to your account' : 'Join the gallery community'}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="mode-toggle">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => switchMode('login')}
              >Sign In</button>
              <button
                type="button"
                className={mode === 'register' ? 'active' : ''}
                onClick={() => switchMode('register')}
              >Register</button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name — only on register */}
              {mode === 'register' && (
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    required
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  required
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    required
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Confirm password — only on register */}
              {mode === 'register' && (
                <div className="field">
                  <label>Confirm Password</label>
                  <div className="pass-wrap">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirm}
                      required
                      onChange={e => setForm({ ...form, confirm: e.target.value })}
                    />
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <span className="field-error">Passwords do not match</span>
                  )}
                </div>
              )}

              <button type="submit" className="btn submit-btn" disabled={loading}>
                {loading
                  ? 'Please wait…'
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch-text">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => switchMode('register')}>
                    Register
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => switchMode('login')}>
                    Sign In
                  </button>
                </>
              )}
            </p>

            <p className="login-footer-text">
              <Link to="/" className="back-home">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
