// Komponen field form dengan label dan validation
import React from 'react';
import { FormLabel } from '../../atoms/FormLabel/FormLabel';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  error,
  className = ""
}) => {
  return (
    <div className={className}>
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>
      <div className="mt-1">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`
            block w-full appearance-none rounded-lg border px-3 py-2 
            placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
            sm:text-sm transition-colors
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-500'
            }
          `}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
