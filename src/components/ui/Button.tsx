import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils'; // Assuming a cn utility exists for tailwind merging

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  glow?: boolean;
  shimmer?: boolean;
  threeD?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  glow,
  shimmer,
  threeD,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    icon: 'btn-icon',
  };

  const extraClasses = [
    glow && 'btn-glow',
    shimmer && 'btn-shimmer',
    threeD && 'btn-3d',
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      whileHover={threeD ? { perspective: 500, rotateX: 5, y: -2 } : { y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'btn',
        variants[variant],
        sizes[size],
        extraClasses,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};
