import React from 'react';

/**
 * @component Button
 * @description High-fidelity Labamu-styled button following official Desktop specifications.
 * No drop shadows. Consistent hover micro-behavior across all variants.
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'tertiary' | 'danger'} props.variant - Visual style
 * @param {'main' | 'medium' | 'small'} props.size - Dimension tier
 * @param {React.ReactNode} props.leftIcon - Optional icon element (e.g. from Lucide)
 * @param {React.ReactNode} props.rightIcon - Optional icon element
 */
export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  leftIcon,
  rightIcon,
  width = 'auto',
  disabled = false,
  style = {} 
}) {
  const labamuBlue = '#006BFF';
  const labamuBlueHover = '#0055D4';
  const grayLight = '#F3F4F6';
  const grayDark = '#4B5563';

  // Size Mapping (Desktop Specifications)
  const sizeConfigs = {
    main: {
      height: '51px',
      padding: '0 32px',
      fontSize: '16px',
      borderRadius: '12px'
    },
    medium: {
      height: '40px',
      padding: '0 24px',
      fontSize: '15px',
      borderRadius: '12px'
    },
    small: {
      height: '32px',
      padding: '0 16px',
      fontSize: '13px',
      borderRadius: '8px'
    }
  };

  const config = sizeConfigs[size] || sizeConfigs.medium;

  // Variant Mapping — no drop shadows per Labamu spec
  const variantConfigs = {
    primary: {
      background: labamuBlue,
      color: '#FFFFFF',
      border: '1px solid transparent'
    },
    secondary: {
      background: '#FFFFFF',
      color: labamuBlue,
      border: `1px solid ${labamuBlue}`
    },
    tertiary: {
      background: grayLight,
      color: grayDark,
      border: '1px solid transparent'
    },
    danger: {
      background: '#EF4444',
      color: '#FFFFFF',
      border: '1px solid transparent'
    },
    'danger-outline': {
      background: '#FFFFFF',
      color: '#EF4444',
      border: '1px solid #EF4444'
    }
  };

  // Hover states — consistent micro-behavior for all variants
  const hoverConfigs = {
    primary: {
      background: labamuBlueHover
    },
    secondary: {
      background: '#F0F6FF',
      borderColor: labamuBlueHover
    },
    tertiary: {
      background: '#E5E7EB'
    },
    danger: {
      background: '#DC2626'
    },
    'danger-outline': {
      background: '#FEF2F2',
      borderColor: '#DC2626'
    }
  };

  const vConfig = variantConfigs[variant] || variantConfigs.primary;
  const hConfig = hoverConfigs[variant] || hoverConfigs.primary;

  const baseButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 400,
    transition: 'all 0.15s ease',
    width: width,
    outline: 'none',
    fontFamily: "'Lato', sans-serif",
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box',
    boxShadow: 'none',
    ...config,
    ...vConfig,
    ...style
  };

  return (
    <button 
      onClick={!disabled ? onClick : undefined}
      style={baseButtonStyle}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget;
        if (hConfig.background) el.style.background = hConfig.background;
        if (hConfig.borderColor) el.style.borderColor = hConfig.borderColor;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.background = vConfig.background;
        el.style.borderColor = vConfig.border?.includes('#') 
          ? vConfig.border.split(' ').pop() 
          : 'transparent';
      }}
    >
      {leftIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}
    </button>
  );
}
