import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

// Плавное вращение вокруг оси
const smoothRotate = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
  }
  25% {
    transform: perspective(1000px) rotateY(90deg) rotateX(5deg);
  }
  50% {
    transform: perspective(1000px) rotateY(180deg) rotateX(0deg);
  }
  75% {
    transform: perspective(1000px) rotateY(270deg) rotateX(-5deg);
  }
  100% {
    transform: perspective(1000px) rotateY(360deg) rotateX(0deg);
  }
`;

// Плавное появление
const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const AnimatedLogo = ({ size = 120 }) => {
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
      {/* Логотип */}
      <Box
        component="img"
        src="/logo.png"
        alt="Logo"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          animation: `${fadeIn} 0.5s ease-out, ${smoothRotate} 3s ease-in-out infinite`,
          animationDelay: '0s, 0.5s',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      />
    </Box>
  );
};

export default AnimatedLogo;
