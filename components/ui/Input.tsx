import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, ...props }: InputProps) {
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
      <input
        style={{ 
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '14px'
        }}
        {...props}
      />
    </div>
  );
}
