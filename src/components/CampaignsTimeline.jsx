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

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {campaigns.map((campaign, index) => (
            <Paper
              key={index}
              sx={{
                p: 2.5,
                background: 'linear-gradient(135deg, #1a1f3a 0%, #151933 100%)',
                border: '1px solid rgba(100, 116, 255, 0.2)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                animation: `${slideIn} 0.4s ease-out ${index * 0.08}s both`,
                transition: 'all 0.3s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: parseFloat(campaign.conversionRate) > 7
                    ? '#10b981'
                    : parseFloat(campaign.conversionRate) > 5
                      ? '#f59e0b'
                      : '#ef4444',
                  boxShadow: parseFloat(campaign.conversionRate) > 7
                    ? '0 0 10px #10b981'
                    : parseFloat(campaign.conversionRate) > 5
                      ? '0 0 10px #f59e0b'
                      : '0 0 10px #ef4444'
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(100, 116, 255, 0.4)',
                  borderColor: '#6474ff'
                }
              }}
            >
              {/* Campaign Name & Date */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5, fontSize: '1.05rem' }}>
                  {campaign.campaignName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 14 }} />
                  {campaign.latestDate ? campaign.latestDate.toLocaleDateString('ru-RU') : 'Нет данных'}
                </Typography>
              </Box>

              {/* Compact Metrics */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 1, background: 'rgba(0, 217, 255, 0.1)' }}>
                  <SendIcon sx={{ fontSize: 16, color: '#00d9ff', mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#00d9ff', fontWeight: 700, fontSize: '1.1rem' }}>
                    {campaign.smsSent > 999 ? `${(campaign.smsSent / 1000).toFixed(1)}k` : campaign.smsSent}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Отправ.
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 1, background: 'rgba(255, 107, 157, 0.1)' }}>
                  <MessageIcon sx={{ fontSize: 16, color: '#ff6b9d', mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#ff6b9d', fontWeight: 700, fontSize: '1.1rem' }}>
                    {campaign.smsViewed > 999 ? `${(campaign.smsViewed / 1000).toFixed(1)}k` : campaign.smsViewed}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Просм.
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 1, background: 'rgba(100, 116, 255, 0.1)' }}>
                  <VisibilityIcon sx={{ fontSize: 16, color: '#6474ff', mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#6474ff', fontWeight: 700, fontSize: '1.1rem' }}>
                    {campaign.pageViews}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Визиты
                  </Typography>
                </Box>
              </Box>

              {/* Conversion Bar */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Конверсия
                  </Typography>
                  <Chip
                    label={`${campaign.conversionRate}%`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: parseFloat(campaign.conversionRate) > 7
                        ? '#10b981'
                        : parseFloat(campaign.conversionRate) > 5
                          ? '#f59e0b'
                          : '#ef4444',
                      color: '#ffffff',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(parseFloat(campaign.conversionRate) * 10, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(100, 116, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: parseFloat(campaign.conversionRate) > 7
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : parseFloat(campaign.conversionRate) > 5
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                          : 'linear-gradient(90deg, #ef4444, #dc2626)',
                      borderRadius: 3,
                      boxShadow: parseFloat(campaign.conversionRate) > 7
                        ? '0 0 8px rgba(16, 185, 129, 0.5)'
                        : parseFloat(campaign.conversionRate) > 5
                          ? '0 0 8px rgba(245, 158, 11, 0.5)'
                          : '0 0 8px rgba(239, 68, 68, 0.5)'
                    }
                  }}
                />
              </Box>
            </Paper>
          ))}
        </Box>

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

