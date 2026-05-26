import React from 'react';
import LangPillsBar from '../components/LangPillsBar';
import DeleteIconButton from '../components/DeleteIconButton';

const TOGGLE_FIELDS = [
  { key: 'salutation', label: 'Salutation' },
  { key: 'email',      label: 'Email',  group: 'contact' },
  { key: 'phone',      label: 'Phone',  group: 'contact' },
];

const ALWAYS_REQUIRED = ['Name', 'Message'];

const ContactPanel = React.memo(({ contact, langBarProps, updateConfig }) => (
  <div style={{ padding: '32px 48px', width: '100%', boxSizing: 'border-box' }}>
    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '0px' }}>

      {/* ── General Section ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>General</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>Configure how user see this section.</p>
        <LangPillsBar {...langBarProps} />
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span> Section Title
            </label>
            <input type="text" value={contact?.title || ''} onChange={e => updateConfig('contact', { ...contact, title: e.target.value })} placeholder="Contact Us" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span> Section Description
            </label>
            <input type="text" value={contact?.description || ''} onChange={e => updateConfig('contact', { ...contact, description: e.target.value })} placeholder="Contact us For further business inquiries or collaborations" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '10px' }}>
            <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span> Contact Section Header Image
          </label>
          {contact?.headerImage ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
                <img src={contact.headerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <DeleteIconButton onClick={() => updateConfig('contact', { ...contact, headerImage: '' })} style={{ position: 'absolute', top: '4px', right: '4px' }} />
              </div>
            </div>
          ) : (
            <div onClick={() => updateConfig('contact', { ...contact, headerImage: `https://picsum.photos/seed/contact${Math.random()}/1200/400` })} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '8px', border: '1px dashed #D1D5DB', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Drag and drop or click to upload image</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5' }}>Accepted formats: JPG, JPEG &amp; PNG<br/>(Max 5MB)</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Required Fields ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Required Fields</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>Select which fields customers must fill in to submit a message</p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          {ALWAYS_REQUIRED.map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>{label}</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Always required</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {TOGGLE_FIELDS.map(field => {
            const isOn = contact?.requiredFields?.[field.key] ?? false;
            const peerKey = field.group === 'contact' ? (field.key === 'email' ? 'phone' : 'email') : null;
            const peerIsOn = peerKey ? (contact?.requiredFields?.[peerKey] ?? false) : true;
            const isInteractive = !field.group || peerIsOn;
            return (
              <div
                key={field.key}
                onClick={isInteractive ? () => updateConfig('contact', { ...contact, requiredFields: { ...contact?.requiredFields, [field.key]: !isOn } }) : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', cursor: isInteractive ? 'pointer' : 'not-allowed', userSelect: 'none' }}
              >
                <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: isOn ? '#006BFF' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: '2px', left: isOn ? '18px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.12)' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{field.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Forward Contact Us Form ── */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Forward Contact Us Form</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>Contact form submission will be sent to these email or leave it empty if you don't want the email to be forwarded.</p>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Business Email</label>
          <input type="text" value={contact?.businessEmail || ''} onChange={e => updateConfig('contact', { ...contact, businessEmail: e.target.value })} placeholder="Input Business Email" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
        </div>
        <LangPillsBar {...langBarProps} />
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Confirmation Message</label>
          <textarea value={contact?.confirmationMessage || ''} onChange={e => updateConfig('contact', { ...contact, confirmationMessage: e.target.value })} placeholder="Input Confirmation Message" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', minHeight: '42px', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
      </div>
    </div>
  </div>
));

export default ContactPanel;
