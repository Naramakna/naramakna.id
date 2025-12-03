import React from 'react';

interface CheckboxFieldProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  className = ""
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  );
}; 