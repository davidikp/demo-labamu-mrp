import React from 'react';
import LangPillsBar from '../components/LangPillsBar';
import DeleteIconButton from '../components/DeleteIconButton';

const QuotePanel = React.memo(({ rfq, langBarProps, updateConfig, quoteBgInputRef, handleQuoteBgUpload, handleQuoteBgFileSelect }) => (
  <div style={{ padding: '32px 48px', width: '100%', boxSizing: 'border-box' }}>
    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '0px' }}>

      {/* ── General Section ── */}
      <div style={{ marginBottom: '0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Quote Request Section</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>Configure how user see this section.</p>
        <LangPillsBar {...langBarProps} />
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span> Section Title
            </label>
            <input type="text" value={rfq?.title || ''} onChange={e => updateConfig('rfq', { ...rfq, title: e.target.value })} placeholder="Request a Quote" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span> Section Description
            </label>
            <input type="text" value={rfq?.subtitle || ''} onChange={e => updateConfig('rfq', { ...rfq, subtitle: e.target.value })} placeholder="Fill out the form below to get a customized quote for your project" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif", outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F4F6', margin: '28px 0' }} />

      {/* ── Background Image ── */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Background Image</h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 16px 0' }}>Upload a background image for the quote section. If none is set, the default template image will be used.</p>
        <input ref={quoteBgInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleQuoteBgFileSelect} />
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {rfq?.bgImage && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '160px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                <img src={rfq.bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <DeleteIconButton onClick={() => updateConfig('rfq', { ...rfq, bgImage: '' })} style={{ position: 'absolute', top: '-8px', right: '-8px' }} />
            </div>
          )}
          {!rfq?.bgImage && (
            <div onClick={handleQuoteBgUpload} style={{ width: '160px', height: '60px', borderRadius: '8px', border: '1.5px dashed #D1D5DB', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#9CA3AF'} onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
          )}
        </div>
      </div>

    </div>
  </div>
));

export default QuotePanel;
