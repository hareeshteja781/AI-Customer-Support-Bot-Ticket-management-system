import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Moon,
  Save,
  Settings,
  Sun,
  UserCircle2,
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(
    user?.full_name || ''
  );

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFullName(user?.full_name || '');
  }, [user]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const trimmedName = fullName.trim();

    setSuccessMessage('');
    setErrorMessage('');

    if (trimmedName.length < 2) {
      setErrorMessage(
        'Please enter a valid full name.'
      );
      return;
    }

    setSaving(true);

    try {
      const { data } = await api.patch(
        '/users/me',
        {
          full_name: trimmedName,
        }
      );

      updateUser(data);

      setFullName(data.full_name || trimmedName);

      setSuccessMessage(
        'Your profile was updated successfully.'
      );
    } catch (error) {
      const detail = error?.response?.data?.detail;

      setErrorMessage(
        typeof detail === 'string'
          ? detail
          : 'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell settings-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">ACCOUNT</p>

          <h2>Profile &amp; Settings</h2>

          <p className="page-subtitle">
            Manage your profile information and
            application preferences.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              <UserCircle2 size={22} />
            </div>

            <div>
              <h3>Profile information</h3>

              <p>
                Update the name displayed throughout
                your support workspace.
              </p>
            </div>
          </div>

          <form
            className="form-stack"
            onSubmit={handleSaveProfile}
          >
            <label>
              Full name

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                maxLength={255}
              />
            </label>

            <label>
              Email address

              <input
                type="email"
                value={user?.email || ''}
                readOnly
              />
            </label>

            <label>
              Account role

              <input
                type="text"
                value={user?.role || ''}
                readOnly
              />
            </label>

            {errorMessage && (
              <div className="alert alert-error">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle2 size={16} />

                <span>{successMessage}</span>
              </div>
            )}

            <div className="settings-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <section className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              <Settings size={22} />
            </div>

            <div>
              <h3>Application settings</h3>

              <p>
                Change how the support application
                looks and behaves.
              </p>
            </div>
          </div>

          <div className="settings-option">
            <div className="settings-option-information">
              {theme === 'dark' ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}

              <div>
                <strong>Appearance</strong>

                <p>
                  Current theme:{' '}
                  {theme === 'dark'
                    ? 'Dark'
                    : 'Light'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={toggleTheme}
            >
              {theme === 'dark'
                ? 'Use light mode'
                : 'Use dark mode'}
            </button>
          </div>
        </section>

        <section className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h3>Account status</h3>

              <p>
                Current account information.
              </p>
            </div>
          </div>

          <div className="account-status-grid">
            <div>
              <span>Status</span>

              <strong>
                {user?.is_active === false
                  ? 'Inactive'
                  : 'Active'}
              </strong>
            </div>

            <div>
              <span>Account ID</span>

              <strong>
                {user?.id ?? 'Unavailable'}
              </strong>
            </div>

            <div>
              <span>Email</span>

              <strong>
                {user?.email || 'Unavailable'}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}