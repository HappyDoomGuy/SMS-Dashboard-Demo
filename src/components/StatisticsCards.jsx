import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Message as MessageIcon,
  BarChart as BarChartIcon,
  Send as SendIcon
} from '@mui/icons-material';
import config, { getSmsMultiplier, getViewPercentColor } from '../config';

const StatisticCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 16px ${color}20`
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ fontSize: 40, color: color, mr: 2, opacity: 0.8 }} />
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: color,
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
        </Box>
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

const StatisticsCards = ({ data }) => {
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
  
  // SMS sent count from campaign data (only for Донормил and Пимафуцин)
  // We need to get unique distribution IDs first, then sum their contact counts
  const uniqueDistributions = new Map();
  
  data.forEach(item => {
    // Only count for Донормил and Пимафуцин content types
    if (item.contentType === 'Донормил' || item.contentType === 'Пимафуцин') {
      const distId = item.distributionType;
      if (distId && !uniqueDistributions.has(distId)) {
        // Store the contact count for this distribution ID (only once)
        uniqueDistributions.set(distId, item.contactCount || 0);
      }
    }
  });
  
  // Sum all unique contact counts
  const smsSent = Array.from(uniqueDistributions.values()).reduce((sum, count) => sum + count, 0);
  
  // Average view percentage (excluding 0%)
  const nonZeroViews = data.filter(item => (item.viewPercent || 0) > 0);
  const avgViewPercent = nonZeroViews.length > 0
    ? Math.round(nonZeroViews.reduce((sum, item) => sum + (item.viewPercent || 0), 0) / nonZeroViews.length)
    : 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
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
        
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={2.4}
        >
          <StatisticCard
            title="Общее время просмотров"
            value={totalTimeFormatted}
            icon={TimerIcon}
            color={config.colors.statistics.totalTime}
          />
        </Grid>
        
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
