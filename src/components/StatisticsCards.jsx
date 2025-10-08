import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Message as MessageIcon,
  BarChart as BarChartIcon,
  Send as SendIcon
} from '@mui/icons-material';

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
  
  // Calculate SMS views based on content type
  const pimaCount = data.filter(item => item.contentType === 'Пимафуцин').length;
  const donormilCount = data.filter(item => item.contentType === 'Донормил').length;
  const otherCount = pageViews - pimaCount - donormilCount;
  
  const smsViewed = Math.round(
    pimaCount * 1.44 + 
    donormilCount * 4.6 + 
    otherCount * 1 // default multiplier for other types
  );
  
  // SMS sent count from campaign data
  // Filter by campaign name containing content type name (Донормил or Пимафуцин)
  // Group by unique distribution IDs to avoid duplicates
  const uniqueDistributions = new Map();
  
  data.forEach(item => {
    const campaignName = (item.campaignName || '').toLowerCase();
    const contentType = (item.contentType || '').toLowerCase();
    
    // Check if campaign name contains the content type name
    // This allows automatic inclusion of new products
    if (campaignName.includes(contentType) && item.distributionType) {
      const distId = item.distributionType;
      if (!uniqueDistributions.has(distId)) {
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
            color="#1976d2"
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
            color="#00897b"
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
            color="#9c27b0"
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
            color="#f57c00"
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
            color={avgViewPercent >= 70 ? '#2e7d32' : avgViewPercent >= 50 ? '#ed6c02' : '#d32f2f'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsCards;
