import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({ label, error, style, id, ...props }: TextAreaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '4px',
            color: '#374151',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '1rem',
          border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
          borderRadius: '6px',
          outline: 'none',
          resize: 'vertical',
          minHeight: '80px',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
