import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Message as MessageIcon,
  BarChart as BarChartIcon,
  Send as SendIcon
} from '@mui/icons-material';
import config, { getSmsMultiplier, getViewPercentColor, isAllowedCampaignSource } from '../config';
import { apiService } from '../services/api';

const StatisticCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: '#0f3460',
      border: `1px solid rgba(255, 255, 255, 0.08)`,
      borderRadius: 3,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: color
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5)`,
        borderColor: `rgba(255, 255, 255, 0.12)`,
        background: '#16213e'
      }
    }}
  >
    <CardContent>
      {/* Title at the top */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: '0.7rem',
          display: 'block',
          mb: 2
        }}
      >
        {title}
      </Typography>
      
      {/* Icon and Value */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            width: 56,
            height: 56,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon sx={{ fontSize: 32, color: color }} />
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            fontSize: '2rem'
          }}
        >
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

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
  const smsViewed = Math.round(
    data.reduce((sum, item) => {
      const multiplier = getSmsMultiplier(item.contentType);
      return sum + multiplier;
    }, 0)
  );
  
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
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {/* 1. Отправлено СМС */}
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={2.4}
        >
          <StatisticCard
            title="Отправлено СМС"
            value={smsSent.toLocaleString('ru-RU')}
            icon={SendIcon}
            color={config.colors.statistics.smsSent}
          />
        </Grid>
        
        {/* 2. Просмотрено СМС */}
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={2.4}
        >
          <StatisticCard
            title="Просмотрено СМС"
            value={smsViewed.toLocaleString('ru-RU')}
            icon={MessageIcon}
            color={config.colors.statistics.smsViewed}
          />
        </Grid>
        
        {/* 3. Просмотров страниц */}
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={2.4}
        >
          <StatisticCard
            title="Просмотров страниц"
            value={pageViews.toLocaleString('ru-RU')}
            icon={VisibilityIcon}
            color={config.colors.statistics.pageViews}
          />
        </Grid>
        
        {/* 4. Время просмотров */}
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={2.4}
        >
          <StatisticCard
            title="Время просмотров"
            value={totalTimeFormatted}
            icon={TimerIcon}
            color={config.colors.statistics.totalTime}
          />
        </Grid>
        
        {/* 5. Средний % просмотра */}
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={2.4}
        >
          <StatisticCard
            title="Средний % просмотра"
            value={`${avgViewPercent}%`}
            icon={BarChartIcon}
            color={getViewPercentColor(avgViewPercent)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsCards;
