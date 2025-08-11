import React from 'react';

interface ProfileFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'radio';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  rows?: number;
  options?: { value: string; label: string }[];
  isDisabled?: boolean;
  helperText?: string;
  showCheckmark?: boolean;
}

export const ProfileFormField: React.FC<ProfileFormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  rows = 4,
  options = [],
  isDisabled = false,
  helperText,
  showCheckmark = false
}) => {
  const renderField = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          id={name}
          rows={rows}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder={placeholder}
        />
      );
    }

    if (type === 'radio' && options.length > 0) {
      return (
        <div className={`flex space-x-6 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {options.map((option) => (
            <label key={option.value} className={`flex items-center ${isDisabled ? 'cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' :
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        }`}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {showCheckmark && <span className="text-green-600">✓</span>}
      </label>
      {renderField()}
      {maxLength && type !== 'radio' && (
        <div className="text-right text-xs text-gray-400 mt-1">
          {value.length}/{maxLength}
        </div>
      )}
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};
