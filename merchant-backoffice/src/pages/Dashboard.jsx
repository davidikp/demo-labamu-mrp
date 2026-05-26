import { useTranslation } from 'react-i18next';
import { useCompany } from '../contexts/CompanyContext';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { companyData } = useCompany();

  return (
    <main style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      padding: '48px 24px',
      minHeight: 'calc(100vh - 56px)', // Adjust for header height
    }}>
      <img src="/favicon.ico" alt="Labamu Icon" style={{ width: '64px', height: '64px' }} />
      <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-on-surface-primary)' }}>
        {t('dashboard:welcome.title')}{companyData?.brandName ? `, ${companyData.brandName}` : ''}
      </h1>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--neutral-on-surface-secondary)', textAlign: 'center', maxWidth: '360px', lineHeight: '22px' }}>
        {t('dashboard:welcome.messagePrefix')}
        <strong style={{ color: '#1a1a1a' }}>{t('dashboard:welcome.messageStrong')}</strong>
        {t('dashboard:welcome.messageSuffix')}
      </p>
    </main>
  );
}
