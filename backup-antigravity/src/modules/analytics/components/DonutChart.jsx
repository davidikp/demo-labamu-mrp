
import React from 'react';

const DonutChart = ({ data, total, centerLabel, centerValue, size = 200, thickness = 24 }) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Pre-calculate offsets for all segments in original order
  let currentAccumulatedValue = 0;
  const segmentsWithOffsets = data.map((segment) => {
    const offsetValue = currentAccumulatedValue;
    currentAccumulatedValue += segment.value;
    return { ...segment, offsetValue };
  });

  // Reverse the rendering order so the first item in the data array (e.g., "Not Due" Blue) 
  // is rendered last in the SVG DOM, ensuring it sits on top of other segments.
  const renderingOrder = [...segmentsWithOffsets].reverse();

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--neutral-surface-grey-lighter)"
          strokeWidth={thickness}
        />
        {/* Segments rendered in reverse z-index order */}
        {renderingOrder.map((segment, index) => {
          const segmentCircumference = (segment.value / total) * circumference;
          const dashOffset = (segment.offsetValue / total) * circumference;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, segmentCircumference - 0.5)} ${circumference}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          );
        })}
      </svg>
      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--neutral-on-surface-secondary)', marginBottom: '4px' }}>
          {centerLabel}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-on-surface-primary)', lineHeight: '1.2' }}>
          {centerValue}
        </div>
      </div>
    </div>
  );
};

export { DonutChart };
