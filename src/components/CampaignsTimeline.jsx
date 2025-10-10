import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import {
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Message as MessageIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { getSmsMultiplier, isAllowedCampaignSource } from '../config';
import { apiService } from '../services/api';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
`;

const CampaignsTimeline = ({ data, currentContentType }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

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

  // Scroll to newest (first) campaign on mount or content type change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [currentContentType, campaigns.length]);

  // Mouse/touch drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scrollToLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollToRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  const isAtStart = scrollPosition <= 10;
  const isAtEnd = scrollContainerRef.current 
    ? scrollPosition >= scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10
    : false;

  return (
    <Paper
      sx={{
        width: '100%',
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Header with Navigation */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.125rem' }}>
          Статистика по кампаниям
        </Typography>
        
        {campaigns.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#86868b', fontWeight: 500 }}>
              {campaigns.length} {campaigns.length === 1 ? 'кампания' : campaigns.length < 5 ? 'кампании' : 'кампаний'}
            </Typography>
            <IconButton
              onClick={scrollToLeft}
              disabled={isAtStart}
              size="small"
              sx={{
                color: !isAtStart ? '#007AFF' : '#d1d5db',
                '&:hover': {
                  background: 'rgba(0, 122, 255, 0.08)'
                },
                '&:disabled': {
                  color: '#d1d5db'
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={scrollToRight}
              disabled={isAtEnd}
              size="small"
              sx={{
                color: !isAtEnd ? '#007AFF' : '#d1d5db',
                '&:hover': {
                  background: 'rgba(0, 122, 255, 0.08)'
                },
                '&:disabled': {
                  color: '#d1d5db'
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{ 
          p: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          '&::-webkit-scrollbar': {
            height: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(100, 116, 255, 0.05)',
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(100, 116, 255, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(100, 116, 255, 0.5)'
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, minWidth: 'min-content' }}>
          {campaigns.map((campaign, index) => (
            <Paper
              key={index}
              sx={{
                p: 0,
                minWidth: '280px',
                maxWidth: '280px',
                flexShrink: 0,
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                animation: `${fadeIn} 0.3s ease-out both`,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  borderColor: '#007AFF'
                }
              }}
            >
              {/* Header */}
              <Box sx={{ 
                p: 2, 
                background: '#f5f5f7',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}>
                <Typography variant="body1" sx={{ color: '#1d1d1f', fontWeight: 600, mb: 0.5, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                  {campaign.campaignName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#86868b', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 400, fontSize: '0.75rem' }}>
                  <CalendarIcon sx={{ fontSize: 11 }} />
                  {campaign.latestDate ? campaign.latestDate.toLocaleDateString('ru-RU') : 'Нет данных'}
                </Typography>
              </Box>

              {/* Metrics Grid */}
              <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                {/* Отправлено */}
                <Box sx={{ 
                  p: 1.5, 
                  background: '#f5f5f7',
                  borderRadius: 1.5,
                  textAlign: 'center'
                }}>
                  <SendIcon sx={{ fontSize: 20, color: '#34C759', mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#1d1d1f', fontWeight: 600, fontSize: '1.125rem', mb: 0.25 }}>
                    {campaign.smsSent.toLocaleString('ru-RU')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#86868b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Отправлено
                  </Typography>
                </Box>

                {/* Просмотров СМС */}
                <Box sx={{ 
                  p: 1.5, 
                  background: '#f5f5f7',
                  borderRadius: 1.5,
                  textAlign: 'center'
                }}>
                  <MessageIcon sx={{ fontSize: 20, color: '#FF9500', mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#1d1d1f', fontWeight: 600, fontSize: '1.125rem', mb: 0.25 }}>
                    {campaign.smsViewed.toLocaleString('ru-RU')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#86868b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Просм. СМС
                  </Typography>
                </Box>

                {/* Просмотров страниц */}
                <Box sx={{ 
                  p: 1.5, 
                  background: '#f5f5f7',
                  borderRadius: 1.5,
                  textAlign: 'center'
                }}>
                  <VisibilityIcon sx={{ fontSize: 20, color: '#007AFF', mb: 0.5 }} />
                  <Typography variant="h6" sx={{ color: '#1d1d1f', fontWeight: 600, fontSize: '1.125rem', mb: 0.25 }}>
                    {campaign.pageViews.toLocaleString('ru-RU')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#86868b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Страниц
                  </Typography>
                </Box>

                {/* Конверсия */}
                <Box sx={{ 
                  p: 1.5, 
                  background: '#f5f5f7',
                  borderRadius: 1.5,
                  textAlign: 'center'
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: parseFloat(campaign.conversionRate) > 7 
                        ? '#34C759' 
                        : parseFloat(campaign.conversionRate) > 5 
                          ? '#FF9500' 
                          : '#FF3B30',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      mb: 0.25
                    }}
                  >
                    {campaign.conversionRate}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#86868b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Конверсия
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {campaigns.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#9ca3af', fontWeight: 500 }}>
              Нет данных о кампаниях
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CampaignsTimeline;

