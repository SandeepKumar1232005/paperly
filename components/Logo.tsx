
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 512 512" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document Base */}
      <path 
        d="M128 64C128 46.3269 142.327 32 160 32H352C369.673 32 384 46.3269 384 64V448C384 465.673 369.673 480 352 480H160C142.327 480 128 465.673 128 448V64Z" 
        fill="#F8FAFC" 
        stroke="#CBD5E1" 
        strokeWidth="12"
      />
      {/* Lines */}
      <path d="M176 128H336" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round"/>
      <path d="M176 192H336" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round"/>
      <path d="M176 256H256" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round"/>
      
      {/* Gradient Pencil */}
      <defs>
        <linearGradient id="pencilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect 
        x="300" y="150" width="40" height="280" 
        rx="20" transform="rotate(-30 300 150)" 
        fill="url(#pencilGradient)" 
        stroke="white" 
        strokeWidth="8"
      />
      
      {/* Checkmark Circle */}
      <circle cx="200" cy="380" r="60" fill="#10B981" />
      <path 
        d="M170 380L190 400L230 360" 
        stroke="white" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;
