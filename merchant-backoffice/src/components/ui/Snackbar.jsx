import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../contexts/SnackbarContext';

const Snackbar = () => {
  const { t } = useTranslation('common');
  const { snackbar, hideSnackbar } = useSnackbar();
  const { isOpen, message, variant } = snackbar;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hideSnackbar();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hideSnackbar]);

  if (!isOpen) return null;

  const bgColors = {
    grey: '#282828',
    green: '#54A73F',
    red: '#D0021B'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '72px', // 56px header + 16px gap
      right: '24px',
      width: '335px',
      height: '51px',
      backgroundColor: bgColors[variant] || bgColors.grey,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxSizing: 'border-box',
      zIndex: 9999,
      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
      animation: 'snackbar-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes snackbar-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <span style={{ 
        color: '#FFFFFF', 
        fontSize: '14px', 
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginRight: '12px'
      }}>
        {message}
      </span>
      
      <button 
        onClick={hideSnackbar}
        style={{
          background: 'none',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '4px 0',
          fontFamily: 'inherit'
        }}
      >
        {t('action.oke')}
      </button>
    </div>
  );
};

export default Snackbar;
