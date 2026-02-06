import React from 'react';

interface ButterflyClipProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
}

export default function ButterflyClip({
  children,
  width = 400,
  height = 400,
  className = '',
}: ButterflyClipProps) {
  const clipPathId = `butterfly-clip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={clipPathId} className='border-black'>
            {/* Left wings */}
            <ellipse cx={width * 0.25} cy={height * 0.25} rx={width * 0.22} ry={height * 0.28} />
            <ellipse cx={width * 0.25} cy={height * 0.75} rx={width * 0.22} ry={height * 0.28} />

            {/* Right wings */}
            <ellipse cx={width * 0.75} cy={height * 0.25} rx={width * 0.22} ry={height * 0.28} />
            <ellipse cx={width * 0.75} cy={height * 0.75} rx={width * 0.22} ry={height * 0.28} />

            {/* Center body */}
            <ellipse cx={width * 0.5} cy={height * 0.5} rx={width * 0.25} ry={height * 0.35} />
          </clipPath>
        </defs>
      </svg>

      <div
        className="w-full h-full"
        style={{
          clipPath: `url(#${clipPathId})`,
          borderRight: '6px solid black',
          borderBottom: '6px solid black',
        }}
      >
        {children}
      </div>
    </div>
  );
}
