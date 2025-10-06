import React from 'react';
import clsx from 'clsx';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, ...props }, ref) => (
    <label className="block space-y-1">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300',
          error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
);
TextInput.displayName = 'TextInput';
