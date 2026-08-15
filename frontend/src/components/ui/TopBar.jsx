import { Menu, Bell, Search, Moon, SunMedium, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

export default function TopBar({ onMobileMenu }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const displayName = user?.full_name || 'there';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="mobile-menu-button" onClick={onMobileMenu} aria-label="Open navigation menu"><Menu size={20} /></button>
        <div>
          <p className="page-label">Welcome back</p>
          <h1 className="page-title">{`${displayName.split(' ')[0]}, here's your support center`}</h1>
        </div>
      </div>
      <div className="topbar-right">
        <button type="button" className="icon-button" aria-label="Search support" onClick={() => { setSearchOpen((prev) => !prev); setNotificationsOpen(false); }}><Search size={18} /></button>
        <button type="button" className="icon-button" aria-label="Notifications" onClick={() => { setNotificationsOpen((prev) => !prev); setSearchOpen(false); }}><Bell size={18} /></button>
        <button type="button" className="icon-button" aria-label="Toggle theme" onClick={toggleTheme}>{theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}</button>
      </div>
      {searchOpen && (
        <div className="topbar-panel topbar-search-panel">
          <div className="panel-header"><span>Search support</span><button type="button" className="icon-button panel-close" onClick={() => setSearchOpen(false)} aria-label="Close search panel"><X size={16} /></button></div>
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tickets, conversations, docs..." aria-label="Search support" />
          <p className="panel-note">{searchQuery ? `Searching for “${searchQuery}”...` : 'Start typing to search.'}</p>
        </div>
      )}
      {notificationsOpen && (
        <div className="topbar-panel topbar-notifications-panel">
          <div className="panel-header"><span>Notifications</span><button type="button" className="icon-button panel-close" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications panel"><X size={16} /></button></div>
          <div className="panel-item"><p className="panel-item-title">AI support</p><p className="panel-item-text">Your support workspace is ready.</p></div>
        </div>
      )}
    </header>
  );
}
