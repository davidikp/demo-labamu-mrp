import React, { useState, useEffect, useRef } from 'react';

/**
 * @component Input
 * @description Standard Labamu-styled text input component.
 * 
 * @param {Object} props
 * @param {string} props.label - Optional label displayed above the input
 * @param {string} props.error - Optional error message displayed below the input
 * @param {boolean} props.required - If true, adds a red asterisk next to the label
 * @param {number} props.maxLength - Optional max character limit
 */
const ERROR_RED = '#D0021B';

function formatNpwp(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').substring(0, 15);
  let res = '';
  if (digits.length > 0) res += digits.substring(0, 2);
  if (digits.length > 2) res += '.' + digits.substring(2, 5);
  if (digits.length > 5) res += '.' + digits.substring(5, 8);
  if (digits.length > 8) res += '.' + digits.substring(8, 9);
  if (digits.length > 9) res += '-' + digits.substring(9, 12);
  if (digits.length > 12) res += '.' + digits.substring(12, 15);
  return res;
}

const Input = ({ label, error, required, style, maxLength, value, onChange, onBlur, format, ...props }) => {
  // Apply initial format if needed
  const initVal = (value !== undefined && value !== null) ? (format === 'npwp' ? formatNpwp(value) : value) : '';
  
  // Use local state buffer to prevent cursor jumping and per-keystroke validation
  const [localValue, setLocalValue] = useState(() => initVal);
  const [isFocused, setIsFocused] = useState(false);
  const prevValueRef = useRef(value);

  // Sync external value changes (like form resets or initial loads from API)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      const nextVal = (value !== undefined && value !== null) ? (format === 'npwp' ? formatNpwp(value) : value) : '';
      setLocalValue(nextVal);
      prevValueRef.current = value;
    }
  }, [value]);

  const handleInput = (e) => {
    let nextVal = e.target.value;
    if (format === 'npwp') {
      nextVal = formatNpwp(nextVal);
    }
    setLocalValue(nextVal);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    let finalVal = localValue;
    if (format === 'pad3' && finalVal) {
      finalVal = finalVal.replace(/\D/g, '').slice(0, 3).padStart(3, '0');
      setLocalValue(finalVal);
    }
    
    if (onChange) {
      // Pass a mocked event to maintain compatibility with existing handlers designed for input onChange
      onChange({ target: { value: finalVal } });
    }
    if (onBlur) {
      onBlur(e);
    }
    if (!error) {
      e.target.style.borderColor = '#E5E7EB';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          color: '#6B7280', 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          {required && <span style={{ color: ERROR_RED, marginRight: '4px' }}>*</span>}
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          height: '40px',
          padding: '0 14px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#1B1B1B',
          borderRadius: '8px',
          border: error ? `1px solid ${ERROR_RED}` : '1px solid #E5E7EB',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'Lato', sans-serif",
          transition: 'all 0.2s',
          background: '#FFFFFF',
          caretColor: 'var(--focus-color, #006BFF)',
          lineHeight: '22px',
          ...style
        }}
        maxLength={maxLength}
        value={localValue}
        onChange={handleInput}
        onFocus={(e) => {
          setIsFocused(true);
          if (!error) {
            e.target.style.borderColor = 'var(--focus-color, #006BFF)';
          }
        }}
        onBlur={handleBlur}
        autoComplete="off"
        {...props}
      />
      {error && !isFocused && (
        <span style={{ fontSize: '13px', color: ERROR_RED, marginTop: '6px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
