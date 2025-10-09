import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Message as MessageIcon,
  BarChart as BarChartIcon,
  Send as SendIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import config, { getSmsMultiplier, getViewPercentColor, isAllowedCampaignSource } from '../config';
import { apiService } from '../services/api';
import { keyframes } from '@mui/system';

// Анимации
const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(100, 116, 255, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(100, 116, 255, 0.6);
  }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const StatisticCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Анимация счетчика для чисел
  useEffect(() => {
    if (!isVisible) return;
    
    const numValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
    if (isNaN(numValue)) return;

    const duration = 1500;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCounter(numValue);
        clearInterval(timer);
      } else {
        setCounter(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const displayValue = typeof value === 'string' && value.includes('%') 
    ? value 
    : (typeof value === 'string' && (value.includes('ч') || value.includes('м'))) 
      ? value 
      : counter.toLocaleString('ru-RU');

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${color}30`,
        borderRadius: 3,
        boxShadow: `0 8px 32px ${color}15, 0 1px 3px rgba(0, 0, 0, 0.05)`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${color}10, transparent)`,
          animation: `${shimmer} 4s ease-in-out infinite`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}AA, ${color})`,
          boxShadow: `0 0 20px ${color}80`,
        },
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          boxShadow: `0 20px 60px ${color}30, 0 0 40px ${color}20`,
          borderColor: color,
          '& .icon-box': {
            animation: `${floatAnimation} 1.5s ease-in-out infinite`,
            transform: 'rotate(5deg)',
            boxShadow: `0 8px 40px ${color}60`
          }
        }
      }}
    >
      <CardContent sx={{ p: 3.5, position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6b7280',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            fontSize: '0.65rem',
            display: 'block',
            mb: 3
          }}
        >
          {title}
        </Typography>
        
        {/* Icon and Value */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900,
              background: `linear-gradient(135deg, #1a2332, ${color})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
              fontSize: '2.75rem',
              letterSpacing: -1
            }}
          >
            {displayValue}
          </Typography>
          
          <Box 
            className="icon-box"
            sx={{ 
              width: 75,
              height: 75,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${color}15, ${color}05)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `2px solid ${color}30`,
              boxShadow: `0 4px 20px ${color}20`,
              transition: 'all 0.4s ease',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                borderRadius: 3,
                padding: '2px',
                background: `linear-gradient(135deg, ${color}, transparent)`,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                opacity: 0.5
              }
            }}
          >
            <Icon sx={{ fontSize: 42, color: color, filter: `drop-shadow(0 2px 8px ${color}50)` }} />
          </Box>
        </Box>

        {/* Minimal progress line */}
        <Box
          sx={{
            height: 3,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color}, ${color}AA, ${color})`,
            boxShadow: `0 0 12px ${color}60, 0 2px 8px ${color}30`,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: -2,
              width: 8,
              height: 7,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 12px ${color}`
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  } else {
    return `${secs}с`;
  }
};

const StatisticsCards = ({ data, currentContentType }) => {
  // Calculate statistics
  const pageViews = data.length;
  
  // Total viewing time
  const totalSeconds = data.reduce((sum, item) => sum + (item.timeSec || 0), 0);
  const totalTimeFormatted = formatTime(totalSeconds);
  
  // Calculate SMS views based on content type using config multipliers
  // Sum first (keep as float), then round at the end
  const smsViewedFloat = data.reduce((sum, item) => {
    const multiplier = getSmsMultiplier(item.contentType);
    return sum + multiplier;
  }, 0);
  const smsViewed = Math.round(smsViewedFloat);
  
  // Debug
  console.log(`=== GLOBAL SMS VIEWED (${currentContentType}) ===`);
  console.log(`Total page views: ${pageViews}`);
  console.log(`Multiplier for ${currentContentType}: ${getSmsMultiplier(currentContentType)}`);
  console.log(`Total SMS viewed: ${smsViewed}`);
  console.log('========================================');
  
  // SMS sent count - calculate directly from campaigns table for current content type
  // Get all campaigns from the original campaigns data
  const allCampaigns = apiService.getFilteredCampaigns();
  
  // Get unique distribution IDs for current content type from data
  const currentDistributionIds = new Set(
    data
      .filter(item => item.contentType === currentContentType)
      .map(item => item.distributionType)
      .filter(id => id)
  );
  
  // Filter campaigns by:
  // 1. Allowed source (Delta Medical)
  // 2. Distribution ID matches current content type
  const relevantCampaigns = allCampaigns.filter(campaign => {
    const source = campaign['Название таблицы (Источник)'] || '';
    const distId = campaign['ID дистрибуции'] || '';
    
    // Check if campaign is from allowed source
    if (!isAllowedCampaignSource(source)) {
      return false;
    }
    
    // Check if this distribution ID is used by current content type
    return currentDistributionIds.has(distId);
  });
  
  // Sum contact counts from relevant campaigns (unique campaigns only)
  const smsSent = relevantCampaigns.reduce((sum, campaign) => {
    const count = parseInt(campaign['Кол-во обычных контактов']) || 0;
    return sum + count;
  }, 0);
  
  // Debug: Log details
  console.log(`=== SMS SENT DEBUG (${currentContentType}) ===`);
  console.log('Distribution IDs for current type:', Array.from(currentDistributionIds));
  console.log('Relevant campaigns:', relevantCampaigns.map(c => ({
    name: c['Название кампании'],
    distributionId: c['ID дистрибуции'],
    count: parseInt(c['Кол-во обычных контактов']) || 0
  })));
  console.log(`Total SMS sent for ${currentContentType}: ${smsSent}`);
  console.log('===================');
  
  // Average view percentage (excluding 0%)
  const nonZeroViews = data.filter(item => (item.viewPercent || 0) > 0);
  const avgViewPercent = nonZeroViews.length > 0
    ? Math.round(nonZeroViews.reduce((sum, item) => sum + (item.viewPercent || 0), 0) / nonZeroViews.length)
    : 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2.5}>
        {/* Главная большая карточка - Просмотров страниц */}
        <Grid item xs={12} md={6} lg={4}>
          <StatisticCard
            title="Просмотров страниц"
            value={pageViews.toLocaleString('ru-RU')}
            icon={VisibilityIcon}
            color={config.colors.statistics.pageViews}
            delay={0}
          />
        </Grid>

        {/* Вторая большая карточка - Просмотрено СМС */}
        <Grid item xs={12} md={6} lg={4}>
          <StatisticCard
            title="Просмотрено СМС"
            value={smsViewed.toLocaleString('ru-RU')}
            icon={MessageIcon}
            color={config.colors.statistics.smsViewed}
            delay={100}
          />
        </Grid>

        {/* Третья большая карточка - Отправлено СМС */}
        <Grid item xs={12} md={6} lg={4}>
          <StatisticCard
            title="Отправлено СМС"
            value={smsSent.toLocaleString('ru-RU')}
            icon={SendIcon}
            color={config.colors.statistics.smsSent}
            delay={200}
          />
        </Grid>
        
        {/* Нижний ряд - 2 карточки */}
        <Grid item xs={12} md={6}>
          <StatisticCard
            title="Общее время просмотров"
            value={totalTimeFormatted}
            icon={TimerIcon}
            color={config.colors.statistics.totalTime}
            delay={300}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StatisticCard
            title="Средний процент просмотра"
            value={`${avgViewPercent}%`}
            icon={BarChartIcon}
            color={getViewPercentColor(avgViewPercent)}
            delay={400}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsCards;
