import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Headphones,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const navigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['customer', 'agent', 'admin'],
  },
  {
    to: '/chat',
    label: 'AI Support',
    icon: MessageCircle,
    roles: ['customer', 'agent', 'admin'],
  },
  {
    to: '/conversations',
    label: 'Conversations',
    icon: Sparkles,
    roles: ['customer', 'agent', 'admin'],
  },
  {
    to: '/tickets',
    label: 'Tickets',
    icon: Box,
    roles: ['customer', 'agent', 'admin'],
  },
  {
    to: '/voice',
    label: 'Voice Support',
    icon: Headphones,
    roles: ['customer', 'agent', 'admin'],
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: CircleDollarSign,
    roles: ['agent', 'admin'],
  },
  {
    to: '/agent',
    label: 'Agent',
    icon: ShieldCheck,
    roles: ['agent', 'admin'],
  },
  {
    to: '/admin',
    label: 'Admin',
    icon: ShieldCheck,
    roles: ['admin'],
  },
];

export default function Sidebar({
  open,
  onClose,
}) {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const displayName =
    user?.full_name?.trim() ||
    'Customer User';

  const email =
    user?.email ||
    'No email available';

  const role =
    user?.role ||
    'customer';

  const initial =
    displayName
      .charAt(0)
      .toUpperCase() || 'U';

  const openSettings = () => {
    setProfileOpen(false);
    navigate('/settings');

    if (onClose) {
      onClose();
    }
  };

  const closeProfile = () => {
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();

    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`sidebar ${
        collapsed
          ? 'sidebar-collapsed'
          : ''
      } ${
        open
          ? 'sidebar-open'
          : ''
      }`}
    >
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">
            AI
          </div>

          {!collapsed && (
            <div>
              <p className="brand-name">
                AI Customer Support
              </p>

              <p className="brand-subtext">
                AI-powered customer support.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="collapse-toggle"
          onClick={() =>
            setCollapsed(
              (previous) => !previous
            )
          }
          aria-label={
            collapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navigation
          .filter((item) =>
            item.roles.includes(
              user?.role
            )
          )
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? 'active'
                      : ''
                  }`
                }
                onClick={() => {
                  setProfileOpen(false);

                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <Icon
                  className="sidebar-icon"
                />

                {!collapsed && (
                  <span>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && profileOpen && (
          <div
            className="sidebar-profile-panel"
            role="dialog"
            aria-label="User profile"
          >
            <div className="sidebar-profile-panel-header">
              <div className="sidebar-profile-heading">
                <div className="profile-avatar large">
                  {initial}
                </div>

                <div>
                  <p className="profile-name">
                    {displayName}
                  </p>

                  <p className="profile-role">
                    {role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeProfile}
                aria-label="Close profile"
              >
                <X size={16} />
              </button>
            </div>

            <div className="profile-summary">
              <div className="profile-summary-row">
                <span>
                  Full name
                </span>

                <strong>
                  {displayName}
                </strong>
              </div>

              <div className="profile-summary-row">
                <span>
                  Email
                </span>

                <strong>
                  {email}
                </strong>
              </div>

              <div className="profile-summary-row">
                <span>
                  Role
                </span>

                <strong>
                  {role}
                </strong>
              </div>
            </div>

            <p className="panel-note">
              Manage your profile information
              and application preferences.
            </p>

            <button
              type="button"
              className="primary-button sidebar-panel-action-button"
              onClick={openSettings}
            >
              <Settings size={16} />

              Edit profile &amp; settings
            </button>
          </div>
        )}

        <button
          type="button"
          className="sidebar-profile-button"
          onClick={() =>
            setProfileOpen(
              (previous) => !previous
            )
          }
          aria-expanded={profileOpen}
          aria-label="Open user profile"
        >
          <div className="profile-avatar">
            {initial}
          </div>

          {!collapsed && (
            <div className="sidebar-profile-info">
              <p className="profile-name">
                {displayName}
              </p>

              <p className="profile-role">
                {role}
              </p>
            </div>
          )}

          {!collapsed && (
            <UserCircle
              size={18}
              className="profile-menu-icon"
            />
          )}
        </button>

        <div className="sidebar-actions">
          <button
            type="button"
            className="sidebar-action-button"
            onClick={openSettings}
          >
            <Settings size={16} />

            {!collapsed && (
              <span>
                Settings
              </span>
            )}
          </button>

          <button
            type="button"
            className="sidebar-action-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}