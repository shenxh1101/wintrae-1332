import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'reward' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-display font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 select-none';
  
  const variants = {
    primary: 'bg-gradient-to-b from-primary-400 to-primary-600 text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none',
    secondary: 'bg-gradient-to-b from-accent-400 to-accent-600 text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none',
    success: 'bg-gradient-to-b from-success-400 to-success-600 text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none',
    error: 'bg-gradient-to-b from-error-400 to-error-600 text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none',
    warning: 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none',
    reward: 'bg-gradient-to-b from-reward-400 to-reward-600 text-white shadow-cartoon hover:shadow-cartoon-hover hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none',
    ghost: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
    xl: 'px-10 py-5 text-xl min-h-[64px]'
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-cartoon';

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && disabledStyles,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {!loading && icon}
      {children}
    </motion.button>
  );
};

export default Button;
