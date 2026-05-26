import React from 'react';
import LangPillsBar from '../components/LangPillsBar';
import InputField from '../components/InputField';

const LocationPanel = React.memo(({ map, businessAddress, langBarProps, updateConfig, updateAddress, companyData, t }) => {
  const fieldStyle = { width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' };
  const fieldLabel = (text) => (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>{text}</label>
  );

  return (
    <div style={{ padding: '40px 48px', maxWidth: '100%', margin: '0' }}>
      <LangPillsBar {...langBarProps} />
      <InputField label="Section Title" value={map?.title || ''} onChange={val => updateConfig('map', { ...map, title: val })} placeholder={t('template_houzez.map.title')} />
      <InputField label="Section Subtitle" value={map?.subtitle || ''} onChange={val => updateConfig('map', { ...map, subtitle: val })} placeholder={t('template_houzez.map.subtitle')} isTextarea />
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Business Address</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>Shown on the map and in your website footer.</p>
        <div style={{ marginBottom: '16px' }}>
          {fieldLabel('Street Address')}
          <input value={businessAddress.street} onChange={e => updateAddress('street', e.target.value)} placeholder={companyData?.address || 'Jl. Contoh No. 123'} style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            {fieldLabel('City')}
            <input value={businessAddress.city} onChange={e => updateAddress('city', e.target.value)} placeholder={companyData?.city || 'Jakarta'} style={fieldStyle} />
          </div>
          <div>
            {fieldLabel('Province / State')}
            <input value={businessAddress.province} onChange={e => updateAddress('province', e.target.value)} placeholder={companyData?.province || 'DKI Jakarta'} style={fieldStyle} />
          </div>
          <div>
            {fieldLabel('Postal Code')}
            <input value={businessAddress.postalCode} onChange={e => updateAddress('postalCode', e.target.value)} placeholder={companyData?.postalCode || '12345'} style={fieldStyle} />
          </div>
          <div>
            {fieldLabel('Country')}
            <input value={businessAddress.country} onChange={e => updateAddress('country', e.target.value)} placeholder={companyData?.country || 'Indonesia'} style={fieldStyle} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default LocationPanel;
