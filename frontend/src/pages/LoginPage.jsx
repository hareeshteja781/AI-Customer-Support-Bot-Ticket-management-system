import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle.jsx';

const DEMO_CREDENTIALS = {
  email: 'customer@example.com',
  password: 'password',
};

const getErrorMessage = (err) => {
  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || JSON.stringify(item))
      .join(', ');
  }

  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  if (err?.response?.status === 401) {
    return 'Invalid email or password.';
  }

  if (err?.response?.status === 422) {
    return 'Please enter a valid email and password.';
  }

  if (err?.response?.status >= 500) {
    return 'Server error. Please make sure the backend is running.';
  }

  return err?.message || 'Unable to sign in. Please try again.';
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const data = await login(normalizedEmail, password);

      if (!data?.user) {
        throw new Error(
          'Login succeeded but user information was not returned.'
        );
      }

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'agent') {
        navigate('/agent');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError(null);
  };

  return (
    <main className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <section className="auth-panel auth-panel-wider">
        <div className="auth-branding">
          <div className="auth-brand-icon">
            <Sparkles size={26} />
          </div>

          <div>
            <div className="eyebrow">AI CUSTOMER SUPPORT</div>
          </div>
        </div>

        <div className="auth-copy">
          <h1>Sign in to your support workspace</h1>

          <p>
            Manage tickets, chat with AI, and review your support history in a
            polished dashboard.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            <span>{loading ? 'Signing in…' : 'Continue'}</span>

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <span>New to the platform?</span>

          <Link to="/register">Create an account</Link>
        </div>

        <div className="demo-box">
          <div className="demo-header">
            <ShieldCheck size={20} />

            <div>
              <strong>Demo access</strong>

              <span>Use these credentials to test the platform.</span>
            </div>
          </div>

          <div className="demo-credentials">
            <div>
              <span className="demo-label">Customer</span>

              <span className="demo-value">
                {DEMO_CREDENTIALS.email}
              </span>

              <span className="demo-value">
                {DEMO_CREDENTIALS.password}
              </span>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={fillDemoCredentials}
            >
              <span>Fill demo credentials</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}