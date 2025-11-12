import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={clsx('rounded-lg border border-gray-200 bg-white shadow-sm', className)} {...props}>
    {children}
  </div>
);

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => (
  <div className={clsx('border-b border-gray-200 p-4', className)} {...props}>
    {children}
  </div>
);
