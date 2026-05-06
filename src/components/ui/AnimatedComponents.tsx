import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'flipIn';
  delay?: number;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 300,
  className,
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onAnimationComplete?.();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [onAnimationComplete]);

  const animationClasses = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    scaleIn: 'animate-scale-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    zoomIn: 'animate-zoom-in',
    flipIn: 'animate-flip-in',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300',
        isVisible ? animationClasses[animation] : 'opacity-0',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

interface StaggeredChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredChildren: React.FC<StaggeredChildrenProps> = ({
  children,
  staggerDelay = 100,
  className,
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <AnimatedWrapper
          key={index}
          animation="slideUp"
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedWrapper>
      ))}
    </div>
  );
};

interface HoverCardProps {
  children: React.ReactNode;
  hoverContent?: React.ReactNode;
  className?: string;
  hoverClassName?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  hoverContent,
  className,
  hoverClassName,
  position = 'top',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {hoverContent && isHovered && (
        <div
          className={cn(
            'absolute z-50 p-3 bg-white rounded-lg shadow-xl border border-slate-200 animate-fade-in',
            positionClasses[position],
            hoverClassName
          )}
        >
          {hoverContent}
        </div>
      )}
    </div>
  );
};

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  rippleColor?: string;
  className?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  className,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <button
      className={cn('relative overflow-hidden', className)}
      onClick={createRipple}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '100px',
            height: '100px',
            marginLeft: '-50px',
            marginTop: '-50px',
            backgroundColor: rippleColor,
          }}
        />
      ))}
    </button>
  );
};

interface MorphingIconProps {
  icon: React.ReactNode;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({
  icon,
  size = 24,
  className,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center transition-all duration-300 cursor-pointer',
        isHovered && 'scale-125 rotate-12',
        className
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon}
    </div>
  );
};

interface PulseDotProps {
  color?: string;
  size?: number;
  className?: string;
}

export const PulseDot: React.FC<PulseDotProps> = ({
  color = '#f97316',
  size = 12,
  className,
}) => {
  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full animate-ping opacity-75"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'default' | 'circle' | 'rect';
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = '100%',
  className,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'rounded-lg',
    circle: 'rounded-full',
    rect: 'rounded-none',
  };

  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className,
  delay = 0,
  duration = 3000,
}) => {
  return (
    <div
      className={cn('animate-float', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

interface BounceElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const BounceElement: React.FC<BounceElementProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <div
      className={cn('animate-bounce', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface RotateOnHoverProps {
  children: React.ReactNode;
  rotation?: number;
  className?: string;
}

export const RotateOnHover: React.FC<RotateOnHoverProps> = ({
  children,
  rotation = 180,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn('transition-transform duration-300', className)}
      style={{
        transform: isHovered ? `rotate(${rotation}deg)` : 'rotate(0deg)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

interface ScaleOnScrollProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

export const ScaleOnScroll: React.FC<ScaleOnScrollProps> = ({
  children,
  minScale = 0.8,
  maxScale = 1,
  className,
}) => {
  const [scale, setScale] = useState(maxScale);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = 1 - rect.top / window.innerHeight;

      const newScale = minScale + (maxScale - minScale) * Math.min(1, Math.max(0, scrollProgress));
      setScale(newScale);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [minScale, maxScale]);

  return (
    <div
      ref={ref}
      className={cn('transition-transform duration-300', className)}
      style={{ transform: `scale(${scale})` }}
    >
      {children}
    </div>
  );
};

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.5,
  className,
}) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
};

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  className,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span className={className}>{displayText}</span>;
};

interface CounterProps {
  end: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const Counter: React.FC<CounterProps> = ({
  end,
  duration = 2000,
  className,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
