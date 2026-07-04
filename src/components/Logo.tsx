import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  size?: number;
  watermark?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  width,
  height,
  className = '',
  size = 36,
  watermark = false,
}) => {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;

  return (
    <img
      src="/logo.png"
      alt="Nexora"
      width={resolvedWidth}
      height={resolvedHeight}
      className={className}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        objectFit: 'contain',
        opacity: watermark ? 0.15 : undefined,
      }}
    />
  );
};

export default Logo;
