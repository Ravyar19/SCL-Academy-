import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverEffect = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel 
        rounded-2xl 
        p-6 
        ${hoverEffect ? 'glass-card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};