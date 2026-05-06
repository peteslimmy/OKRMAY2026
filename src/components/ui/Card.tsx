import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'threeD' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  clickable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
  clickable = false,
}) => {
  const paddingClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const variantClass = {
    default: 'card',
    hover: 'card card-hover',
    threeD: 'card card-3d',
    elevated: 'card card-elevated',
  }[variant];

  const motionProps = clickable || onClick ? {
    whileHover: { 
      y: variant === 'threeD' ? -6 : -4, 
      transition: { duration: 0.2, ease: "easeOut" } 
    },
    whileTap: { 
      scale: 0.98, 
      y: variant === 'threeD' ? -2 : -2, 
      transition: { duration: 0.1 } 
    },
    onClick: onClick,
    cursor: 'pointer',
  } : {};

  return (
    <motion.div
      {...motionProps}
      className={cn(
        paddingClass,
        variantClass,
        clickable && 'card-clickable',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
