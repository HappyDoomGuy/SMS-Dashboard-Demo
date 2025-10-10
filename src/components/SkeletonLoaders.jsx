import React from 'react';
import { Box, Paper, Skeleton, Grid } from '@mui/material';

// Skeleton для карточек статистики
export const StatisticsCardsSkeleton = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2.5}>
        {[...Array(5)].map((_, index) => (
          <Grid item xs={12} md={index < 3 ? 4 : 6} key={index}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Skeleton variant="text" width="40%" height={50} />
                <Skeleton variant="circular" width={48} height={48} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Skeleton для таблицы
export const TableSkeleton = () => {
  return (
    <Paper
      sx={{
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Skeleton variant="text" width="30%" height={28} />
      </Box>

      {/* Toolbar */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', gap: 2 }}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="rectangular" width={200} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Table Content */}
      <Box sx={{ p: 2 }}>
        {/* Column Headers */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, px: 1 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="text" width={`${10 + i * 5}%`} height={20} />
          ))}
        </Box>

        {/* Rows */}
        {[...Array(8)].map((_, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'flex',
              gap: 2,
              mb: 1.5,
              p: 1,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            {[...Array(6)].map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width={`${10 + colIndex * 5}%`} height={16} />
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// Skeleton для карточек клиентов
export const ClientCardsSkeleton = () => {
  return (
    <Paper
      sx={{
        width: '100%',
        mt: 3,
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Skeleton variant="text" width="40%" height={28} />
      </Box>

      {/* Cards Grid */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
              >
                {/* Avatar and Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>

                {/* Details */}
                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="text" width="100%" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={16} />
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="60%" height={14} sx={{ mx: 'auto' }} />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="60%" height={14} sx={{ mx: 'auto' }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

// Skeleton для графика
export const ChartSkeleton = () => {
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
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Skeleton variant="text" width="40%" height={28} />
      </Box>

      <Box sx={{ p: 3, height: 400 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </Paper>
  );
};

// Skeleton для таймлайна кампаний
export const CampaignsTimelineSkeleton = () => {
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
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Skeleton variant="text" width="40%" height={28} />
      </Box>

      <Box sx={{ p: 3, display: 'flex', gap: 2, overflowX: 'hidden' }}>
        {[...Array(4)].map((_, index) => (
          <Box
            key={index}
            sx={{
              minWidth: '280px',
              p: 0,
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            {/* Header */}
            <Box sx={{ p: 2, background: '#f5f5f7', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>

            {/* Metrics */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    background: '#f5f5f7',
                    borderRadius: 1.5
                  }}
                >
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

