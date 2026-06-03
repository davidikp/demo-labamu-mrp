import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * Standardized PageHeader component for Labamu design system.
 * Following the convention: Back Button + Title, with Breadcrumbs underneath.
 * 
 * @param {string} title - The main heading of the page.
 * @param {Array} breadcrumbs - List of breadcrumb items [{ label, path }].
 * @param {string} backPath - Destination for the back button.
 * @param {function} onBack - Optional custom back handler.
 */
const PageHeader = ({ title, breadcrumbs = [], backPath, onBack, style = {} }) => {
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {/* Top Row: Back Action + Title */}
      <div 
        onClick={handleBack}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          cursor: (onBack || backPath) ? 'pointer' : 'default',
          color: '#111827',
          marginLeft: '-8px',
          padding: '2px 8px',
          borderRadius: '8px',
          transition: 'background 0.2s',
          width: 'fit-content'
        }}
        onMouseOver={(e) => { if (onBack || backPath) e.currentTarget.style.background = '#F9FAFB'; }}
        onMouseOut={(e) => { if (onBack || backPath) e.currentTarget.style.background = 'none'; }}
      >
        {(onBack || backPath) && (
          <ChevronLeft 
            size={28} 
            strokeWidth={1.2} 
            color="#282828"
            style={{ width: '14px', height: '28px', marginTop: '1px' }} 
          />
        )}
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: 800, 
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h1>
      </div>
      
      {/* Bottom Row: Breadcrumbs - Aligned with the title text (Chevron Width + Gap) */}
      {breadcrumbs.length > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '12px', 
          color: '#9CA3AF',
          marginTop: '2px',
          paddingLeft: (onBack || backPath) ? '18px' : '0'
        }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.path ? (
                <Link 
                  to={crumb.path} 
                  style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#4B5563'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
