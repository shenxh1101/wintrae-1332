import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverable = false,
  onClick
}) => {
  const variants = {
    default: 'bg-white border-4 border-primary-200 rounded-3xl',
    elevated: 'bg-white border-4 border-primary-200 rounded-3xl shadow-card-hover',
    outlined: 'bg-transparent border-4 border-dashed border-primary-300 rounded-3xl',
    glass: 'bg-white/80 backdrop-blur-md border-4 border-white/50 rounded-3xl'
  };

  const hoverStyles = hoverable
    ? 'cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1'
    : '';

  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02 } : {}}
      whileTap={hoverable && onClick ? { scale: 0.98 } : {}}
      className={cn(variants[variant], hoverStyles, className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b-4 border-primary-100', className)}>
    {children}
  </div>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t-4 border-primary-100', className)}>
    {children}
  </div>
);

export default Card;
