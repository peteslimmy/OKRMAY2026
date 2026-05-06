import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = ''
}) => {
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getColorFromName = (name: string): string => {
    const colors = [
      'bg-primary-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-cyan-500',
      'bg-violet-500',
      'bg-rose-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${getColorFromName(name)}
        rounded-full flex items-center justify-center text-white font-semibold
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  );
};

// Avatar Group
interface AvatarGroupProps {
  avatars: { src?: string; name: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md'
}) => {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeClasses[size]}
            bg-slate-200 rounded-full flex items-center justify-center
            text-xs font-semibold text-slate-600 ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};