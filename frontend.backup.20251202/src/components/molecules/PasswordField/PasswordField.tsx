import React from 'react';
import { FormLabel } from '../../atoms/FormLabel/FormLabel';
import { PasswordInput } from '../../atoms/PasswordInput/PasswordInput';

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  className?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  name,
  label,
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
        <PasswordInput
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          error={!!error}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 