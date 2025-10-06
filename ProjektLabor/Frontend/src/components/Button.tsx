import React from 'react';
import clsx from 'clsx';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors';
  const variants: Record<string, string> = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary:
      'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 focus:ring-blue-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    link:
      'bg-transparent text-blue-600 hover:underline focus:ring-blue-300 px-0 py-0 shadow-none',
  };
  return (
    <button
      className={clsx(base, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    />
  );
};

export type AppLinkProps = React.ComponentProps<'a'> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  fullWidth?: boolean;
};

export const AppLink: React.FC<AppLinkProps> = ({
  variant = 'link',
  fullWidth = false,
  className,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 transition-colors';
  const variants: Record<string, string> = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary:
      'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 focus:ring-blue-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    link:
      'bg-transparent text-blue-600 hover:underline focus:ring-blue-300 px-0 py-0',
  };
  return (
    <a
      className={clsx(base, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    />
  );
};
