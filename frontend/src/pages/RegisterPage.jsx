import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords must match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-shell">
      <div className="auth-panel auth-panel-wider">
        <div className="auth-branding">
          <div className="auth-brand-icon">AI</div>
          <div>
            <p className="eyebrow">AI Customer Support</p>
            <h2>Create your account</h2>
            <p className="auth-copy">Register to manage tickets, conversations, and support requests.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required minLength={8} />
          </div>
          <button type="submit" className="primary-button" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
