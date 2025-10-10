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
        background: '#ffffff',
        border: '0.5px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        {/* Title */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#86868b',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.75rem',
            display: 'block',
            mb: 1.5
          }}
        >
          {title}
        </Typography>
        
        {/* Value and Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 600,
              color: '#1d1d1f',
              lineHeight: 1,
              fontSize: '2.5rem',
              letterSpacing: -1
            }}
          >
            {displayValue}
          </Typography>
          
          <Box 
            sx={{ 
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon sx={{ fontSize: 24, color: color }} />
          </Box>
        </Box>
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
