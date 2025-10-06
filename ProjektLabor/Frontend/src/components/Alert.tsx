import React from 'react';
import clsx from 'clsx';

export interface AlertProps {
  children: React.ReactNode;
  type?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}

const typeStyles = {
  error: 'bg-red-50 border border-red-200 text-red-700',
  success: 'bg-green-50 border border-green-200 text-green-700',
  warning: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border border-blue-200 text-blue-700',
};

export const Alert: React.FC<AlertProps> = ({ children, type = 'info', className }) => (
  <div className={clsx('rounded px-3 py-2 text-sm', typeStyles[type], className)}>
    {children}
  </div>
);
