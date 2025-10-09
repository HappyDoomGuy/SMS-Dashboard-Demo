import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const blink = keyframes`
  0%, 48%, 50%, 52%, 100% { opacity: 1; }
  49%, 51% { opacity: 0.2; }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 5px rgba(100, 116, 255, 0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(100, 116, 255, 0.9)); }
`;

const AIBrainIcon = ({ size = 64 }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Современный робот SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))'
        }}
      >
        {/* Антенна */}
        <circle cx="100" cy="15" r="6" fill="#ffffff" opacity="0.9"/>
        <rect x="97" y="21" width="6" height="20" rx="3" fill="#ffffff" opacity="0.9"/>
        
        {/* Голова робота */}
        <rect x="60" y="45" width="80" height="70" rx="12" fill="#ffffff" opacity="0.95"/>
        
        {/* Глаза (мигают) */}
        <g style={{ animation: `${blink} 5s ease-in-out infinite` }}>
          <rect x="72" y="65" width="18" height="18" rx="3" fill="#6474ff"/>
          <rect x="110" y="65" width="18" height="18" rx="3" fill="#6474ff"/>
          {/* Блики в глазах */}
          <circle cx="76" cy="69" r="3" fill="#ffffff" opacity="0.8"/>
          <circle cx="114" cy="69" r="3" fill="#ffffff" opacity="0.8"/>
        </g>
        
        {/* Рот/дисплей */}
        <rect x="75" y="95" width="50" height="12" rx="6" fill="#6474ff" opacity="0.5"/>
        
        {/* Детали на голове */}
        <circle cx="65" cy="52" r="3" fill="#6474ff" opacity="0.6"/>
        <circle cx="135" cy="52" r="3" fill="#6474ff" opacity="0.6"/>
        
        {/* Шея */}
        <rect x="90" y="115" width="20" height="10" rx="3" fill="#ffffff" opacity="0.85"/>
        
        {/* Тело */}
        <rect x="65" y="125" width="70" height="60" rx="10" fill="#ffffff" opacity="0.9"/>
        
        {/* Панель с индикаторами */}
        <rect x="78" y="140" width="44" height="35" rx="5" fill="#6474ff" opacity="0.2"/>
        <rect x="83" y="145" width="10" height="6" rx="2" fill="#00d9ff" style={{ animation: `${glow} 2s ease-in-out infinite` }}/>
        <rect x="96" y="145" width="10" height="6" rx="2" fill="#ff6b9d" style={{ animation: `${glow} 2.5s ease-in-out infinite` }}/>
        <rect x="109" y="145" width="10" height="6" rx="2" fill="#10b981" style={{ animation: `${glow} 3s ease-in-out infinite` }}/>
        
        {/* Руки */}
        <rect x="35" y="130" width="22" height="45" rx="8" fill="#ffffff" opacity="0.85"/>
        <rect x="143" y="130" width="22" height="45" rx="8" fill="#ffffff" opacity="0.85"/>
        <circle cx="46" cy="177" r="8" fill="#ffffff" opacity="0.8"/>
        <circle cx="154" cy="177" r="8" fill="#ffffff" opacity="0.8"/>
      </svg>

      {/* Вращающаяся шестеренка в центре тела */}
      <svg
        width={size * 0.22}
        height={size * 0.22}
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          marginLeft: `-${size * 0.11}px`,
          marginTop: `-${size * 0.11}px`,
          animation: `${rotate} 3s linear infinite`
        }}
      >
        {/* Шестеренка */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="#6474ff" strokeWidth="3" opacity="0.8"/>
        {/* Зубцы шестеренки */}
        <circle cx="50" cy="10" r="6" fill="#6474ff"/>
        <circle cx="85.4" cy="25" r="6" fill="#6474ff"/>
        <circle cx="90" cy="50" r="6" fill="#6474ff"/>
        <circle cx="85.4" cy="75" r="6" fill="#6474ff"/>
        <circle cx="50" cy="90" r="6" fill="#6474ff"/>
        <circle cx="14.6" cy="75" r="6" fill="#6474ff"/>
        <circle cx="10" cy="50" r="6" fill="#6474ff"/>
        <circle cx="14.6" cy="25" r="6" fill="#6474ff"/>
        {/* Центр */}
        <circle cx="50" cy="50" r="15" fill="#ffffff" opacity="0.9"/>
        <circle cx="50" cy="50" r="8" fill="#6474ff"/>
      </svg>
    </Box>
  );
};

export default AIBrainIcon;

