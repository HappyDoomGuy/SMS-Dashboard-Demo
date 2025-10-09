import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import {
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Message as MessageIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { getSmsMultiplier, isAllowedCampaignSource } from '../config';
import { apiService } from '../services/api';
import { keyframes } from '@mui/system';

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateX(-30px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const CampaignsTimeline = ({ data, currentContentType }) => {
  const allCampaigns = apiService.getFilteredCampaigns();

  const currentDistributionIds = new Set(
    data
      .filter(item => item.contentType === currentContentType)
      .map(item => item.distributionType)
      .filter(id => id)
  );

  const relevantCampaigns = allCampaigns.filter(campaign => {
    const source = campaign['Название таблицы (Источник)'] || '';
    const distId = campaign['ID дистрибуции'] || '';
    if (!isAllowedCampaignSource(source)) {
      return false;
    }
    return currentDistributionIds.has(distId);
  });

  // Parse dates
  const parseDate = (dateString) => {
    if (!dateString || dateString === 'Нет данных') return null;
    const match = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4}),?\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/);
    if (match) {
      const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                     parseInt(hours), parseInt(minutes), parseInt(seconds));
    }
    return new Date(dateString);
  };

  const campaignStats = new Map();

  relevantCampaigns.forEach(campaign => {
    const campaignName = campaign['Название кампании'] || '';
    const distId = campaign['ID дистрибуции'] || '';
    const contactCount = parseInt(campaign['Кол-во обычных контактов']) || 0;
    const campaignDate = campaign['Дата и время'] || '';

    if (!campaignStats.has(campaignName)) {
      campaignStats.set(campaignName, {
        campaignName,
        latestDate: null,
        smsSent: 0,
        smsViewed: 0,
        pageViews: 0,
        processedDistIds: new Set()
      });
    }

    const stats = campaignStats.get(campaignName);
    stats.smsSent += contactCount;

    if (campaignDate) {
      const date = parseDate(campaignDate);
      if (date && !isNaN(date.getTime())) {
        if (!stats.latestDate || date > stats.latestDate) {
          stats.latestDate = date;
        }
      }
    }

    if (!stats.processedDistIds.has(distId)) {
      stats.processedDistIds.add(distId);
      const campaignViews = data.filter(item => item.distributionType === distId);
      stats.pageViews += campaignViews.length;
      const multiplier = getSmsMultiplier(currentContentType);
      stats.smsViewed += (campaignViews.length * multiplier);
    }
  });

  const campaigns = Array.from(campaignStats.values())
    .map(item => ({
      ...item,
      smsViewed: Math.round(item.smsViewed),
      conversionRate: ((item.pageViews / item.smsSent) * 100).toFixed(1)
    }))
    .sort((a, b) => {
      if (!a.latestDate) return 1;
      if (!b.latestDate) return -1;
      return b.latestDate - a.latestDate;
    });

  return (
    <Paper
      sx={{
        width: '100%',
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#151933',
        border: '1px solid rgba(100, 116, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(100, 116, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
          📊 Статистика по кампаниям
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {campaigns.map((campaign, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              mb: 3,
              animation: `${slideIn} 0.5s ease-out ${index * 0.1}s both`,
              '&:last-child': { mb: 0 }
            }}
          >
            {/* Timeline connector */}
            {index < campaigns.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 20,
                  top: 100,
                  width: 2,
                  height: 'calc(100% + 24px)',
                  background: 'linear-gradient(180deg, rgba(100, 116, 255, 0.5), rgba(100, 116, 255, 0.1))',
                  zIndex: 0
                }}
              />
            )}

            {/* Campaign Card */}
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #1a1f3a 0%, #151933 100%)',
                border: '1px solid rgba(100, 116, 255, 0.2)',
                borderRadius: 2,
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateX(8px)',
                  boxShadow: '0 8px 32px rgba(100, 116, 255, 0.3)',
                  borderColor: '#6474ff'
                }
              }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -32,
                  top: 24,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#6474ff',
                  border: '4px solid #151933',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(100, 116, 255, 0.6)',
                  animation: `${pulse} 2s ease-in-out infinite`,
                  zIndex: 2
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                  {index + 1}
                </Typography>
              </Box>

              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
                    {campaign.campaignName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {campaign.latestDate ? campaign.latestDate.toLocaleString('ru-RU') : 'Нет данных'}
                    </Typography>
                  </Box>
                </Box>

                {/* Conversion Badge */}
                <Chip
                  label={`${campaign.conversionRate}%`}
                  icon={<TrendingUpIcon />}
                  sx={{
                    background: parseFloat(campaign.conversionRate) > 7 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : parseFloat(campaign.conversionRate) > 5 
                        ? 'rgba(245, 158, 11, 0.2)' 
                        : 'rgba(239, 68, 68, 0.2)',
                    color: parseFloat(campaign.conversionRate) > 7 
                      ? '#10b981' 
                      : parseFloat(campaign.conversionRate) > 5 
                        ? '#f59e0b' 
                        : '#ef4444',
                    border: `1px solid ${parseFloat(campaign.conversionRate) > 7 
                      ? '#10b981' 
                      : parseFloat(campaign.conversionRate) > 5 
                        ? '#f59e0b' 
                        : '#ef4444'}40`,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    '& .MuiChip-icon': {
                      color: 'inherit'
                    }
                  }}
                />
              </Box>

              {/* Metrics Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                {/* Отправлено SMS */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(0, 217, 255, 0.08)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(0, 217, 255, 0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SendIcon sx={{ fontSize: 18, color: '#00d9ff' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Отправлено
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ color: '#00d9ff', fontWeight: 700 }}>
                    {campaign.smsSent.toLocaleString('ru-RU')}
                  </Typography>
                </Box>

                {/* Просмотрено SMS */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255, 107, 157, 0.08)',
                    border: '1px solid rgba(255, 107, 157, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 107, 157, 0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MessageIcon sx={{ fontSize: 18, color: '#ff6b9d' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Просмотрено
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ color: '#ff6b9d', fontWeight: 700 }}>
                    {campaign.smsViewed.toLocaleString('ru-RU')}
                  </Typography>
                </Box>

                {/* Просмотров страниц */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(100, 116, 255, 0.08)',
                    border: '1px solid rgba(100, 116, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(100, 116, 255, 0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VisibilityIcon sx={{ fontSize: 18, color: '#6474ff' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Просмотров
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ color: '#6474ff', fontWeight: 700 }}>
                    {campaign.pageViews.toLocaleString('ru-RU')}
                  </Typography>
                </Box>
              </Box>

              {/* Conversion Progress Bar */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>
                    Конверсия
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700 }}>
                    {campaign.conversionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(parseFloat(campaign.conversionRate) * 10, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(100, 116, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: parseFloat(campaign.conversionRate) > 7
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : parseFloat(campaign.conversionRate) > 5
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)',
                      borderRadius: 4,
                      boxShadow: parseFloat(campaign.conversionRate) > 7
                        ? '0 0 10px rgba(16, 185, 129, 0.5)'
                        : parseFloat(campaign.conversionRate) > 5
                          ? '0 0 10px rgba(245, 158, 11, 0.5)'
                          : '0 0 10px rgba(239, 68, 68, 0.5)'
                    }
                  }}
                />
              </Box>
            </Paper>
          </Box>
        ))}

        {campaigns.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Нет данных о кампаниях
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CampaignsTimeline;

