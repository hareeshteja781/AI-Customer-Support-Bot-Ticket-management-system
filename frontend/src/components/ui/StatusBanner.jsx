import { Info } from 'lucide-react';

export default function StatusBanner({ title, message, variant = 'info' }) {
  return (
    <div className={`status-banner status-banner-${variant}`}>
      <div className="status-banner-icon">
        <Info size={20} />
      </div>
      <div>
        <p className="status-banner-title">{title}</p>
        <p className="status-banner-message">{message}</p>
      </div>
    </div>
  );
}
