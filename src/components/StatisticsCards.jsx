import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Message as MessageIcon,
  BarChart as BarChartIcon
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
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              {subtitle}
            </Typography>
          )}
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
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10); // Reduced delay for faster response
    return () => clearTimeout(timer);
  }, [data.length]); // Re-trigger animation when data changes

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
  
  // Average view percentage (excluding 0%)
  const nonZeroViews = data.filter(item => (item.viewPercent || 0) > 0);
  const avgViewPercent = nonZeroViews.length > 0
    ? Math.round(nonZeroViews.reduce((sum, item) => sum + (item.viewPercent || 0), 0) / nonZeroViews.length)
    : 0;

  return (
    <Box 
      sx={{ 
        mb: 3,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease'
      }}
    >
      <Grid container spacing={2}>
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={3}
          sx={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            transitionDelay: '0.05s'
          }}
        >
          <StatisticCard
            title="Просмотров страниц"
            value={pageViews.toLocaleString('ru-RU')}
            subtitle="Всего записей"
            icon={VisibilityIcon}
            color="#1976d2"
          />
        </Grid>
        
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={3}
          sx={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            transitionDelay: '0.1s'
          }}
        >
          <StatisticCard
            title="Общее время"
            value={totalTimeFormatted}
            subtitle={`${totalSeconds.toLocaleString('ru-RU')} секунд`}
            icon={TimerIcon}
            color="#9c27b0"
          />
        </Grid>
        
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={3}
          sx={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            transitionDelay: '0.15s'
          }}
        >
          <StatisticCard
            title="Просмотрено СМС"
            value={smsViewed.toLocaleString('ru-RU')}
            subtitle={`Пимафуцин ×1.44, Донормил ×4.6`}
            icon={MessageIcon}
            color="#f57c00"
          />
        </Grid>
        
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={3}
          sx={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            transitionDelay: '0.2s'
          }}
        >
          <StatisticCard
            title="Средний % просмотра"
            value={`${avgViewPercent}%`}
            subtitle={`Из ${nonZeroViews.length} активных просмотров`}
            icon={BarChartIcon}
            color={avgViewPercent >= 70 ? '#2e7d32' : avgViewPercent >= 50 ? '#ed6c02' : '#d32f2f'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatisticsCards;
