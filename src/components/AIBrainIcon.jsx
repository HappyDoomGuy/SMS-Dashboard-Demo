import React from 'react';
import { Box } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { keyframes } from '@mui/system';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const AIBrainIcon = ({ size = 56 }) => {
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
      {/* Голова (статичная) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
        }}
      >
        {/* Контур головы */}
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 14.5 3 16.75 4.65 18.35L5.35 19.05C5.75 19.45 6.35 19.45 6.75 19.05C7.15 18.65 7.15 18.05 6.75 17.65L6.05 16.95C4.75 15.65 4 13.9 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 13.9 19.25 15.65 17.95 16.95L17.25 17.65C16.85 18.05 16.85 18.65 17.25 19.05C17.65 19.45 18.25 19.45 18.65 19.05L19.35 18.35C21 16.75 22 14.5 22 12C22 6.48 17.52 2 12 2Z"
          fill="currentColor"
          opacity="0.9"
        />
        {/* Дополнительные детали головы */}
        <path
          d="M9 11C9 11.55 8.55 12 8 12C7.45 12 7 11.55 7 11C7 10.45 7.45 10 8 10C8.55 10 9 10.45 9 11Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M17 11C17 11.55 16.55 12 16 12C15.45 12 15 11.55 15 11C15 10.45 15.45 10 16 10C16.55 10 17 10.45 17 11Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>

      {/* Вращающаяся шестеренка в центре */}
      <SettingsIcon
        sx={{
          fontSize: size * 0.5,
          color: '#ffffff',
          animation: `${rotate} 4s linear infinite`,
          position: 'absolute',
          zIndex: 1,
          filter: 'drop-shadow(0 0 6px rgba(100, 116, 255, 0.8))'
        }}
      />
    </Box>
  );
};

export default AIBrainIcon;

