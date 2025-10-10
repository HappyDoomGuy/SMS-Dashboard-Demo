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
        borderRadius: 3,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(100, 116, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header with Navigation */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(100, 116, 255, 0.1)',
        background: 'linear-gradient(135deg, rgba(100, 116, 255, 0.03) 0%, rgba(139, 149, 255, 0.02) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2332', fontSize: '1.1rem' }}>
          📊 Статистика по кампаниям
        </Typography>
        
        {campaigns.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              {campaigns.length} {campaigns.length === 1 ? 'кампания' : campaigns.length < 5 ? 'кампании' : 'кампаний'}
            </Typography>
            <IconButton
              onClick={scrollToLeft}
              disabled={isAtStart}
              size="small"
              sx={{
                color: !isAtStart ? '#6474ff' : '#d1d5db',
                background: !isAtStart ? 'rgba(100, 116, 255, 0.1)' : 'transparent',
                '&:hover': {
                  background: 'rgba(100, 116, 255, 0.15)'
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
                color: !isAtEnd ? '#6474ff' : '#d1d5db',
                background: !isAtEnd ? 'rgba(100, 116, 255, 0.1)' : 'transparent',
                '&:hover': {
                  background: 'rgba(100, 116, 255, 0.15)'
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
                p: 3,
                minWidth: '360px',
                maxWidth: '360px',
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: `2px solid ${parseFloat(campaign.conversionRate) > 7 ? '#10b981' : parseFloat(campaign.conversionRate) > 5 ? '#f59e0b' : '#ef4444'}40`,
                borderRadius: 2.5,
                position: 'relative',
                overflow: 'hidden',
                animation: `${fadeIn} 0.3s ease-out both`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: `0 16px 48px ${parseFloat(campaign.conversionRate) > 7 ? 'rgba(16, 185, 129, 0.2)' : parseFloat(campaign.conversionRate) > 5 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  borderColor: parseFloat(campaign.conversionRate) > 7 ? '#10b981' : parseFloat(campaign.conversionRate) > 5 ? '#f59e0b' : '#ef4444'
                }
              }}
            >
              {/* Campaign Name & Date */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body1" sx={{ color: '#1a2332', fontWeight: 800, mb: 0.5, fontSize: '1rem', lineHeight: 1.3 }}>
                  {campaign.campaignName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                  <CalendarIcon sx={{ fontSize: 13 }} />
                  {campaign.latestDate ? campaign.latestDate.toLocaleDateString('ru-RU') : 'Нет данных'}
                </Typography>
              </Box>

              {/* Vertical Metrics */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Отправлено СМС */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 217, 255, 0.05))',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(0, 217, 255, 0.08))',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(0, 217, 255, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1.5, 
                      background: 'rgba(0, 217, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <SendIcon sx={{ fontSize: 18, color: '#00d9ff' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 600 }}>
                      Отправлено СМС
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#00d9ff', fontWeight: 800, fontSize: '1.2rem' }}>
                    {campaign.smsSent.toLocaleString('ru-RU')}
                  </Typography>
                </Box>

                {/* Просмотров СМС */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(255, 107, 157, 0.05))',
                    border: '1px solid rgba(255, 107, 157, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(255, 107, 157, 0.08))',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(255, 107, 157, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1.5, 
                      background: 'rgba(255, 107, 157, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MessageIcon sx={{ fontSize: 18, color: '#ff6b9d' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 600 }}>
                      Просмотров СМС
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#ff6b9d', fontWeight: 800, fontSize: '1.2rem' }}>
                    {campaign.smsViewed.toLocaleString('ru-RU')}
                  </Typography>
                </Box>

                {/* Просмотров страниц */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, rgba(100, 116, 255, 0.1), rgba(100, 116, 255, 0.05))',
                    border: '1px solid rgba(100, 116, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(100, 116, 255, 0.15), rgba(100, 116, 255, 0.08))',
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(100, 116, 255, 0.2)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1.5, 
                      background: 'rgba(100, 116, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <VisibilityIcon sx={{ fontSize: 18, color: '#6474ff' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 600 }}>
                      Просмотров страниц
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#6474ff', fontWeight: 800, fontSize: '1.2rem' }}>
                    {campaign.pageViews.toLocaleString('ru-RU')}
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

