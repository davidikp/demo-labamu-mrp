import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LabamuLogoPng from '../assets/labamu-logo.png';
import LoginHeroImg from '../assets/login-page-image.png';

/* ── MOCK credentials ────────────────────────────────────── */
const MOCK_EMAIL    = 'merchant@labamu.id';
const MOCK_PASSWORD = 'password123';

/* ── Icons ───────────────────────────────────────────────── */
function IconEmail() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 6l7 4.5L15 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.5 9s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6Z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2.5 2.5l13 13M7.5 7.6A2.25 2.25 0 0 0 11.4 11.5M5.8 5.8C4 6.9 2.5 9 2.5 9s2.5 5.5 6.5 5.5a6.8 6.8 0 0 0 3.2-.85M9 3.5c3.7 0 6 5.5 6 5.5a11 11 0 0 1-1.5 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Decorative rectangles — exact coords from Figma (1440px canvas) ── */
function BgRects() {
  const base = {
    position: 'absolute',
    width: '309px', height: '309px',
    background: '#FFFFFF',
    opacity: 0.10,
    borderRadius: '30px',
  };
  return (
    <>
      <div style={{ ...base, left: '984px', top: '-29px',  transform: 'rotate(-15.75deg)' }} />
      <div style={{ ...base, left: '-115px', top: '-140px', transform: 'rotate(37deg)'     }} />
      <div style={{ ...base, left: '508px', top: '283px',  transform: 'rotate(-30.26deg)' }} />
      <div style={{ ...base, left: '1211px', top: '720px', transform: 'rotate(-30.26deg)' }} />
      <div style={{ ...base, left: '115px', top: '894px',  transform: 'rotate(22.2deg)'   }} />
    </>
  );
}

/* ── Snackbar ─────────────────────────────────────────────── */
function Snackbar({ type, message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`lb-snackbar lb-snackbar-${type}`}>
      <svg className="lb-snack-icon" viewBox="0 0 20 20" fill="none">
        {type === 'error'
          ? <><circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v5M10 13.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>
          : <><circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
        }
      </svg>
      <span className="lb-snack-msg">{message}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOGIN PAGE
   ══════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [snack, setSnack]         = useState(null);
  const [emailErr, setEmailErr]   = useState('');
  const [pwErr, setPwErr]         = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  function handleLangChange(lng) {
    i18n.changeLanguage(lng);
    localStorage.setItem('lb_lang', lng);
    setLangMenuOpen(false);
    setEmailErr('');
    setPwErr('');
  }

  function validateEmail(v) {
    if (!v) return t('auth:errors.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t('auth:errors.emailInvalid');
    return '';
  }
  function validatePw(v) {
    if (!v) return t('auth:errors.passwordRequired');
    if (v.length < 6) return t('auth:errors.passwordMinLength');
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ee = validateEmail(email);
    const pe = validatePw(password);
    setEmailErr(ee); setPwErr(pe);
    if (ee || pe || !agreed) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      sessionStorage.setItem('lb_mock_auth', 'true');
      setSnack({ type: 'success', message: t('auth:errors.loginSuccess') });
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setLoading(false);
      setSnack({ type: 'error', message: t('auth:errors.loginFailed') });
    }
  }

  const canSubmit = email.length > 0 && password.length > 0 && agreed && !loading;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#006BFF',
      overflow: 'hidden',
      fontFamily: "'Lato', sans-serif",
      minHeight: '100vh',
    }}>
      {/* ── Decorative background rectangles ── */}
      <BgRects />

      {/* ── Two-column layout ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 95px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>

        {/* ════════════════════════════════
            LEFT PANEL — branding + illustration
            ════════════════════════════════ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '40px',
          width: '488px',
          flexShrink: 0,
        }}>
          {/* Illustration */}
          <div style={{
            width: '360px', height: '360px',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={LoginHeroImg}
              alt="Labamu Ecommerce illustration"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{
              margin: 0,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: '40px',
              lineHeight: '48px',
              letterSpacing: '0.17875px',
              color: '#FFFFFF',
              width: '488px',
            }}>
              {t('auth:hero.title')}
            </h1>
            <p style={{
              margin: 0,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '32px',
              letterSpacing: '0.1375px',
              color: '#FFFFFF',
              width: '488px',
            }}>
              {t('auth:hero.subtitle')}
            </p>
          </div>


        </div>

        {/* ════════════════════════════════
            RIGHT PANEL — white card
            Figma: 550×726px, padding 120px 90px
            ════════════════════════════════ */}
        <div style={{
          position: 'relative',
          width: '550px',
          minHeight: '726px',
          background: '#FFFFFF',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '90px 90px 90px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
          flexShrink: 0,
          alignSelf: 'center',
          marginRight: '0px',
          boxSizing: 'border-box',
        }}>

          {/* Logo — official PNG asset, centered at top of card */}
          <div style={{ marginBottom: '28px' }}>
            <img
              src={LabamuLogoPng}
              alt="Labamu"
              style={{ width: '161px', height: 'auto', display: 'block' }}
            />
          </div>

          {/* ── Main form area ── */}
          <div style={{ width: '335px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Heading */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <h2 style={{
                margin: 0,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '29px',
                letterSpacing: '0.165px',
                color: '#081B34',
              }}>
                {t('auth:form.title')}
              </h2>
              <p style={{
                margin: 0,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '17px',
                letterSpacing: '0.09625px',
                color: '#081B34',
              }}>
                {t('auth:form.subtitle')}
              </p>
            </div>

            <form id="login-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Email input — underline style matching Figma */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth:form.emailPlaceholder')}
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
                    onBlur={() => setEmailErr(validateEmail(email))}
                    disabled={loading}
                    style={{
                      width: '100%',
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '19px',
                      letterSpacing: '0.11px',
                      color: email ? '#081B34' : '#A9A9A9',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${emailErr ? '#d0021b' : 'rgba(40,40,40,0.15)'}`,
                      borderRadius: 0,
                      outline: 'none',
                      padding: '8px 0',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    aria-required="true"
                    aria-invalid={!!emailErr}
                  />
                </div>
                {emailErr && (
                  <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', color: '#d0021b', letterSpacing: '0.0825px' }}>
                    {emailErr}
                  </span>
                )}
              </div>

              {/* Password input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('auth:form.passwordPlaceholder')}
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (pwErr) setPwErr(''); }}
                    onBlur={() => setPwErr(validatePw(password))}
                    disabled={loading}
                    style={{
                      width: '100%',
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '19px',
                      letterSpacing: '0.11px',
                      color: password ? '#081B34' : '#A9A9A9',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${pwErr ? '#d0021b' : 'rgba(40,40,40,0.15)'}`,
                      borderRadius: 0,
                      outline: 'none',
                      padding: '8px 0',
                      paddingRight: '28px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    aria-required="true"
                    aria-invalid={!!pwErr}
                  />
                  <button
                    id="toggle-password-visibility"
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? t('auth:form.hidePassword') : t('auth:form.showPassword')}
                    style={{
                      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: '#A9A9A9', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {pwErr && (
                  <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', color: '#d0021b', letterSpacing: '0.0825px' }}>
                    {pwErr}
                  </span>
                )}
              </div>

              {/* Terms checkbox — exact Figma sizing */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '8px', width: '335px' }}>
                <div
                  role="checkbox"
                  aria-checked={agreed}
                  tabIndex={0}
                  className={`lb-checkbox ${agreed ? 'lb-checkbox-checked' : 'lb-checkbox-unchecked'}`}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setAgreed(v => !v)}
                  onKeyDown={e => e.key === ' ' && setAgreed(v => !v)}
                >
                  {agreed && (
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                      <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '14px',
                  letterSpacing: '0.0825px',
                  color: '#081B34',
                  paddingTop: '4px',
                }}>
                  {t('auth:terms.agreePrefix')}
                  <a href="https://labamu.co.id/terms/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '12px', fontWeight: 700, color: '#006BFF', letterSpacing: '0.0825px' }}>
                    {t('auth:terms.termsLink')}
                  </a>
                  {t('auth:terms.and')}
                  <a href="https://labamu.co.id/privacy/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '12px', fontWeight: 700, color: '#006BFF', letterSpacing: '0.0825px' }}>
                    {t('auth:terms.privacyLink')}
                  </a>
                  {t('auth:terms.suffix')}
                </p>
              </div>

              {/* Login button — grey/disabled until form ready + T&C agreed */}
              <button
                id="login-submit-btn"
                type="submit"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  width: '335px',
                  height: '51px',
                  background: canSubmit ? '#006BFF' : '#F4F4F4',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '19px',
                  letterSpacing: '0.11px',
                  color: canSubmit ? '#FFFFFF' : '#7E7E7E',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
                disabled={!canSubmit}
                aria-busy={loading}
              >
                {loading
                  ? <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'lb-spin 0.8s linear infinite' }}>
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="24 10" strokeLinecap="round"/>
                      </svg>
                      {t('auth:form.processing')}
                    </>
                  : t('auth:form.submit')
                }
              </button>
              <style>{`@keyframes lb-spin { to { transform: rotate(360deg); } }`}</style>

            </form>

            {/* Or divider — exactly from Figma */}
            <div style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center',
              padding: '0 20px', gap: '20px', width: '335px',
            }}>
              <div style={{ flex: 1, height: 0, borderTop: '1px solid #E9E9E9' }} />
              <span style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400, fontSize: '12px',
                lineHeight: '14px', letterSpacing: '0.09625px',
                color: '#7E7E7E',
              }}>
                {t('auth:divider')}
              </span>
              <div style={{ flex: 1, height: 0, borderTop: '1px solid #E9E9E9' }} />
            </div>

            {/* CTA — Login with Email icon (Figma: "CTA New") */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                id="login-with-email-cta"
                type="button"
                style={{
                  display: 'flex', flexDirection: 'row', alignItems: 'center',
                  gap: '8px', padding: '8px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                onClick={() => setSnack({ type: 'info', message: t('auth:forgotPassword.snackComingSoon') })}
              >
                <IconEmail />
                <span style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700, fontSize: '14px',
                  lineHeight: '20px', letterSpacing: '0.09625px',
                  color: '#006BFF',
                }}>
                  {t('auth:forgotPassword.button')}
                </span>
              </button>
            </div>
          </div>



          {/* Demo credentials hint */}
          <div style={{
            marginTop: '16px',
            padding: '8px 12px',
            background: '#f3f7fe',
            borderRadius: '8px',
            width: '335px',
            boxSizing: 'border-box',
          }}>
            <p style={{
              margin: 0, fontFamily: "'Lato', sans-serif",
              fontSize: '11px', color: '#005de0', lineHeight: '16px',
            }}>
              Demo: <code style={{ fontFamily: 'monospace' }}>{MOCK_EMAIL}</code> / <code style={{ fontFamily: 'monospace' }}>{MOCK_PASSWORD}</code>
            </p>
          </div>

          {/* New Language Switcher Dropdown — bottom center */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', width: '335px', position: 'relative' }}>
            <button type="button" onClick={() => setLangMenuOpen(!langMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'transparent', border: '1px solid #E9E9E9', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>
              <span>{lang === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {langMenuOpen && (
              <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 10, minWidth: '140px' }}>
                <button type="button" onClick={() => handleLangChange('id')} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: lang === 'id' ? '#F4F4F4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>🇮🇩 Indonesia</button>
                <button type="button" onClick={() => handleLangChange('en')} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', background: lang === 'en' ? '#F4F4F4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#081B34' }}>🇬🇧 English</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snack && (
        <Snackbar type={snack.type} message={snack.message} onDismiss={() => setSnack(null)} />
      )}
    </div>
  );
}
