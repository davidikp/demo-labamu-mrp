import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: "'Lato', sans-serif" }}>
      <img src="/favicon.ico" alt="Labamu Icon" style={{ width: '80px', height: '80px', marginBottom: '24px' }} />
      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#081B34', textAlign: 'center' }}>
        {t('website:landing.title')}
      </h1>
      <p style={{ marginTop: '16px', fontSize: '16px', color: '#7E7E7E', maxWidth: '400px', textAlign: 'center', lineHeight: '24px' }}>
        {t('website:landing.subtitle')}
      </p>
    </div>
  );
}
