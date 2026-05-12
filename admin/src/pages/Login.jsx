import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👑`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.message === 'ADMIN_ONLY') {
        toast.error('Access denied. This portal is for administrators only.');
      } else {
        toast.error(err.response?.data?.error || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Animated background */}
      <div className="admin-login-bg">
        <div className="al-orb al-orb1" />
        <div className="al-orb al-orb2" />
        <div className="al-orb al-orb3" />
        <div className="al-grid" />
      </div>

      <div className="admin-login-wrap">
        {/* Left — branding */}
        <div className="admin-login-left">
          <div className="al-brand">
            <span className="al-brand-icon">◈</span>
            <div>
              <div className="al-brand-name">Siva's Photography</div>
              <div className="al-brand-sub">Admin Portal</div>
            </div>
          </div>
          <div className="al-headline-wrap">
            <h1 className="al-headline">
              Manage.<br />
              <span>Curate.</span><br />
              Control.
            </h1>
            <p className="al-sub">
              Secure admin workspace to upload, organize, and manage the entire photography gallery.
            </p>
            <div className="al-features">
              <div className="al-feat"><span>✦</span> Upload & manage photos</div>
              <div className="al-feat"><span>✦</span> Organize categories</div>
              <div className="al-feat"><span>✦</span> Full gallery control</div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="admin-login-right">
          <div className="al-form-box">
            <div className="al-form-header">
              <div className="al-badge">👑 Admin Access Only</div>
              <h2 className="al-form-title">Sign In</h2>
              <p className="al-form-sub">Enter your admin credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="al-form">
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="sivasphotograph@gmail.com"
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

              <button type="submit" className="btn btn-primary al-submit" disabled={loading}>
                {loading ? 'Authenticating…' : '👑 Sign In as Admin'}
              </button>
            </form>

            <p className="al-notice">
              🔒 This portal is restricted to administrators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
