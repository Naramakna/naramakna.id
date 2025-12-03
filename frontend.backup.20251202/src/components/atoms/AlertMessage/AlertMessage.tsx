import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  className = ""
}) => {
  const alertStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      text: 'text-red-800',
      iconComponent: AlertCircle
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      text: 'text-green-800',
      iconComponent: CheckCircle
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      text: 'text-blue-800',
      iconComponent: Info
    }
  };

  const style = alertStyles[type];
  const IconComponent = style.iconComponent;

  return (
    <div className={`rounded-md border p-4 ${style.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${style.text}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
