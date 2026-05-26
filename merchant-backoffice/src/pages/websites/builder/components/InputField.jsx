import React from 'react';

const InputField = React.memo(({ label, value, onChange, placeholder, isTextarea }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>{label}</label>
    {isTextarea ? (
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", minHeight: '44px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
    ) : (
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none' }}
      />
    )}
  </div>
));

export default InputField;
