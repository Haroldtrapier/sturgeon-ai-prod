import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export default function TextArea({ label, ...props }: TextAreaProps) {
  return (
    <div style={{ marginBottom: '15px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '5px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {label}
        </label>
      )}
      <textarea
        style={{ 
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '14px',
          minHeight: '100px',
          resize: 'vertical'
        }}
        {...props}
      />
    </div>
  );
}
