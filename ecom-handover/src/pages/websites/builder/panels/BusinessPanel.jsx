import React from 'react';
import PhoneInput from '../../../../components/ui/PhoneInput';
import LangPillsBar from '../components/LangPillsBar';
import InputField from '../components/InputField';
import DeleteIconButton from '../components/DeleteIconButton';

const BusinessPanel = React.memo(({
  logoInputRef, bannerInputRef,
  headerLogo, banners, businessName, footerPhone, footerEmail,
  heroEnabled, heroTitle, heroSubtitle, footerDesc,
  langBarProps, updateConfig, updateSharedConfig,
  handleBannerUpload, handleBannerRemove,
  handleLogoFileSelect, handleBannerFileSelect,
  companyData, t,
}) => {
  const panelStyle = { padding: '40px 48px', maxWidth: '100%', margin: '0' };
  const fieldStyle = { width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' };
  const fieldLabel = (text) => (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>{text}</label>
  );

  return (
    <div style={panelStyle}>
      <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleLogoFileSelect} />
      <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleBannerFileSelect} />

      {/* ── Logo ── */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #F3F4F6' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{t('studio.editor.logo')}</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 4px 0' }}>
          <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span>{t('studio.editor.logoRequired')}
        </p>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px 0' }}>{t('studio.editor.logoUploadHint')}</p>
        {headerLogo ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ width: '160px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={headerLogo} alt="Business Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <DeleteIconButton onClick={() => updateSharedConfig('headerLogo', '')} style={{ position: 'absolute', top: '-8px', right: '-8px' }} />
          </div>
        ) : (
          <div onClick={() => logoInputRef.current?.click()} style={{ width: '160px', height: '60px', borderRadius: '8px', border: '1.5px dashed #D1D5DB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#9CA3AF'} onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
        )}
      </div>

      {/* ── Hero ── */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{t('studio.editor.hero')}</h3>
          <div onClick={() => updateConfig('heroEnabled', heroEnabled === false ? true : false)} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: heroEnabled !== false ? '#006BFF' : '#E5E7EB', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '2px', left: heroEnabled !== false ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
            </div>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>{t('studio.editor.heroDesc')}</p>
        {heroEnabled !== false && (
          <>
            <LangPillsBar {...langBarProps} />
            <InputField label={t('studio.basic.nav.heroLabel')} value={heroTitle} onChange={(val) => updateConfig('heroTitle', val)} placeholder={t('template_houzez.hero.title')} />
            <InputField label={t('studio.basic.nav.heroSubtitle')} value={heroSubtitle} onChange={(val) => updateConfig('heroSubtitle', val)} placeholder={t('template_houzez.hero.subtitle')} isTextarea />
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                {t('studio.editor.banner')} <span style={{ fontWeight: 400, color: '#9CA3AF' }}>({banners.length}/3)</span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{t('studio.editor.bannerUploadHint')}</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {banners.map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                      <img src={imgUrl} alt={`Banner ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <DeleteIconButton onClick={() => handleBannerRemove(idx)} style={{ position: 'absolute', top: '-8px', right: '-8px' }} />
                  </div>
                ))}
                {banners.length < 3 && (
                  <div onClick={handleBannerUpload} style={{ width: '120px', height: '90px', borderRadius: '8px', border: '1.5px dashed #D1D5DB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#9CA3AF'} onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Footer</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>Contact details and description displayed at the bottom of your website.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            {fieldLabel('Business Name')}
            <input value={businessName} onChange={e => updateSharedConfig('businessName', e.target.value)} placeholder={companyData?.businessName || 'Your business name'} style={fieldStyle} />
          </div>
          <div>
            {fieldLabel('Phone')}
            <PhoneInput value={footerPhone} onChange={val => updateSharedConfig('footerPhone', val)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            {fieldLabel('Email')}
            <input value={footerEmail} onChange={e => updateSharedConfig('footerEmail', e.target.value)} placeholder={companyData?.email || 'email@yourbusiness.com'} style={fieldStyle} />
          </div>
        </div>
        <LangPillsBar {...langBarProps} />
        <InputField label="Footer Description" value={footerDesc} onChange={val => updateConfig('footerDesc', val)} placeholder={t('template_houzez.footer.desc')} isTextarea />
      </div>
    </div>
  );
});

export default BusinessPanel;
