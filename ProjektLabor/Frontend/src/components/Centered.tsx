import React from 'react';
import clsx from 'clsx';

export interface CenteredProps {
  children: React.ReactNode;
  className?: string;
}

export const Centered: React.FC<CenteredProps> = ({ children, className }) => (
  <div className={clsx('flex items-center justify-center min-h-[120px] p-6', className)}>
    {children}
  </div>
);

export const Loading: React.FC<{ className?: string }> = ({ className }) => (
  <Centered className={className}>
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Loading" />
  </Centered>
);
