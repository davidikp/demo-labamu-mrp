import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const lang = i18n.language;

  function handleLogout() {
    sessionStorage.removeItem('lb_mock_auth');
    navigate('/login', { replace: true });
  }

  function handleLangChange(newLang) {
    i18n.changeLanguage(newLang);
    localStorage.setItem('lb_lang', newLang);
    setLangMenuOpen(false);
  }

  // Active menu helper
  const isActive = (path) => location.pathname === path;

  const navigateToProfile = () => {
    navigate('/profile');
    setUserMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neutral-background)', fontFamily: 'var(--font-family)' }}>
      {/* Sidebar - Unified at 260px */}
      <aside style={{
        width: '260px',
        background: 'var(--neutral-surface-primary)',
        borderRight: '1px solid var(--neutral-line-separator-1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 200,
      }}>
        {/* Sidebar Header */}
        <div style={{
          height: '56px',
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0 24px',
          borderBottom: '1px solid var(--neutral-line-separator-1)'
        }}>
          <img src="/favicon.ico" alt="Labamu Icon" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-on-surface-primary)' }}>
            {t('dashboard:header.title')}
          </span>
        </div>

        {/* Sidebar Nav */}
        <div style={{ flex: 1, padding: '24px 0' }}>
          {/* Dashboard Item */}
          <div 
            onClick={() => navigate('/dashboard')}
            style={{ 
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px', 
              fontSize: '14px', fontWeight: isActive('/dashboard') ? 700 : 500, cursor: 'pointer', marginBottom: '4px',
              background: isActive('/dashboard') ? '#F4F9FF' : 'transparent', 
              color: isActive('/dashboard') ? '#006BFF' : '#4B5563',
              borderRadius: '0 8px 8px 0',
              marginRight: '12px',
              transition: 'all 0.2s' 
            }}
          >
            {/* Active Indicator Pill */}
            {isActive('/dashboard') && (
              <div style={{ position: 'absolute', left: 0, top: '4px', bottom: '4px', width: '4px', background: '#006BFF', borderRadius: '0 4px 4px 0' }} />
            )}
            
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            {t('dashboard:sidebar.dashboard')}
          </div>

          {/* Websites Item */}
          <div
            onClick={() => navigate('/websites')}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px',
              fontSize: '14px', fontWeight: isActive('/websites') ? 700 : 500, cursor: 'pointer', marginBottom: '4px',
              background: isActive('/websites') ? '#F4F9FF' : 'transparent',
              color: isActive('/websites') ? '#006BFF' : '#4B5563',
              borderRadius: '0 8px 8px 0',
              marginRight: '12px',
              transition: 'all 0.2s'
            }}
          >
            {/* Active Indicator Pill */}
            {isActive('/websites') && (
              <div style={{ position: 'absolute', left: 0, top: '4px', bottom: '4px', width: '4px', background: '#006BFF', borderRadius: '0 4px 4px 0' }} />
            )}

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {t('dashboard:sidebar.websites')}
          </div>

          {/* Catalog Item */}
          <div
            onClick={() => navigate('/catalog')}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px',
              fontSize: '14px', fontWeight: isActive('/catalog') ? 700 : 500, cursor: 'pointer', marginBottom: '4px',
              background: isActive('/catalog') ? '#F4F9FF' : 'transparent',
              color: isActive('/catalog') ? '#006BFF' : '#4B5563',
              borderRadius: '0 8px 8px 0',
              marginRight: '12px',
              transition: 'all 0.2s'
            }}
          >
            {/* Active Indicator Pill */}
            {isActive('/catalog') && (
              <div style={{ position: 'absolute', left: 0, top: '4px', bottom: '4px', width: '4px', background: '#006BFF', borderRadius: '0 4px 4px 0' }} />
            )}

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {t('dashboard:sidebar.catalog', 'Catalog')}
          </div>

        </div>

        {/* Sidebar Footer (Language Switcher) - Height-fixed to 88px to match page footer */}
        <div style={{ 
          height: '88px',
          padding: '0 24px', 
          borderTop: '1px solid var(--neutral-line-separator-1)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <button type="button" onClick={() => setLangMenuOpen(!langMenuOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid #E9E9E9', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34', outline: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {lang === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {langMenuOpen && (
              <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 300 }}>
                <button type="button" onClick={() => handleLangChange('id')} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: lang === 'id' ? '#F4F4F4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>🇮🇩 Indonesia</button>
                <button type="button" onClick={() => handleLangChange('en')} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: lang === 'en' ? '#F4F4F4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>🇬🇧 English</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar - Unified at 56px */}
        <header style={{
          height: '56px',
          background: 'var(--neutral-surface-primary)',
          borderBottom: '1px solid var(--neutral-line-separator-1)',
          boxShadow: 'var(--elevation-sticky-header)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
          gap: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* View Website Button */}
          <button
            onClick={() => window.open('/storefront', '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Inter', 'Lato', sans-serif", fontSize: '14px', fontWeight: 700, color: '#006BFF', transition: 'background-color 0.2s', outline: 'none' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F4F8FF'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}
          >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
             </svg>
             {t('dashboard:header.viewStorefront')}
          </button>
          
          <div style={{ width: '1px', height: '32px', background: '#E9E9E9' }} />

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', outline: 'none' }}
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1B1B1B', fontFamily: "'Inter', 'Lato', sans-serif", letterSpacing: '-0.3px', lineHeight: '18px' }}>John Doe</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6A7282', fontFamily: "'Inter', 'Lato', sans-serif" }}>Admin</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '4px', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#1B1B1B' }}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {userMenuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: '200px', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden', zIndex: 150 }}>
                <button 
                  onClick={navigateToProfile} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '15px', fontWeight: 500, color: '#1B1B1B', textAlign: 'left', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F4F8FF'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Company Profile
                </button>
                <div style={{ height: '1px', background: '#F3F4F6' }} />
                <button 
                  onClick={handleLogout} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '15px', fontWeight: 500, color: '#D0021B', textAlign: 'left', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FFF0F0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('dashboard:sidebar.logout')}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
           <Outlet />
        </div>
      </div>
    </div>
  );
}
