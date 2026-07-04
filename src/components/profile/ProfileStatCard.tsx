import React, { type CSSProperties, type ReactNode } from 'react';

interface ProfileStatCardProps {
  children: ReactNode;
  className?: string;
  textStyle?: CSSProperties;
}

const ProfileStatCard: React.FC<ProfileStatCardProps> = ({ children, className = '', textStyle }) => (
  <div className="premium-surface rounded-2xl p-4 text-center">
    <p className={`font-numeric font-bold text-lg ${className}`} style={textStyle}>{children}</p>
  </div>
);

export default ProfileStatCard;
