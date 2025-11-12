import React from 'react';
import clsx from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <label className="block space-y-1">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <textarea
        ref={ref}
        className={clsx(
          'w-full rounded-md border px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-300',
          error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
);
Textarea.displayName = 'Textarea';
