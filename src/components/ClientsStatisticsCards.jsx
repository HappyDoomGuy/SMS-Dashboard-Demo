import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Avatar, Grid, TextField, InputAdornment, Chip, Pagination } from '@mui/material';
import { 
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  }
  return `${secs}с`;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(p => p);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    '#007AFF', '#34C759', '#FF9500', '#5856D6', '#FF3B30',
    '#00C7BE', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFCC00'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const ClientsStatisticsCards = ({ data, currentContentType }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  // Group data by user
  const userStats = new Map();
  
  data.forEach(item => {
    const phone = item.phone || '';
    if (!phone || !item.userName) return;
    
    if (!userStats.has(phone)) {
      userStats.set(phone, {
        userName: item.userName,
        specialty: item.specialty || 'Не указано',
        workplace: item.workplace || 'Не указано',
        district: item.district || 'Не указан',
        pageViews: 0,
        totalTime: 0
      });
    }
    
    const stats = userStats.get(phone);
    stats.pageViews += 1;
    stats.totalTime += (item.timeSec || 0);
  });

  // Convert to array and sort
  const clients = Array.from(userStats.values())
    .sort((a, b) => b.pageViews - a.pageViews);
  
  // Filter by search
  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.userName.toLowerCase().includes(query) ||
      client.specialty.toLowerCase().includes(query) ||
      client.workplace.toLowerCase().includes(query) ||
      client.district.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleExport = () => {
    try {
      const exportData = clients.map(c => ({
        'ФИО': c.userName,
        'Специальность': c.specialty,
        'Место работы': c.workplace,
        'Район': c.district,
        'Просмотров страниц': c.pageViews,
        'Время просмотров': formatTime(c.totalTime)
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Клиенты');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const filename = `${currentContentType}_статистика_по_клиентам_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);
      enqueueSnackbar('Файл успешно экспортирован', { variant: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar('Ошибка при экспорте файла', { variant: 'error' });
    }
  };

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
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.125rem' }}>
          Статистика по клиентам
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Поиск клиентов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#86868b', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.12)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.24)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007AFF',
                  borderWidth: '1px'
                }
              },
              '& input': {
                color: '#1d1d1f'
              },
              '& input::placeholder': {
                color: '#86868b',
                opacity: 1
              }
            }}
          />
          
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 400,
              color: '#1d1d1f',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Экспорт в Excel
          </Button>
        </Box>
      </Box>

      {/* Cards Grid */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {paginatedClients.map((client, index) => {
            const avatarColor = getAvatarColor(client.userName);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper
                  sx={{
                    p: 2.5,
                    background: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)',
                      borderColor: avatarColor,
                      borderWidth: '2px'
                    }
                  }}
                >
                  {/* Avatar and Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: avatarColor,
                        fontWeight: 600,
                        fontSize: '1.125rem'
                      }}
                    >
                      {getInitials(client.userName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#1d1d1f',
                          fontSize: '0.9375rem',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {client.userName}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#86868b',
                          fontSize: '0.75rem'
                        }}
                      >
                        {client.specialty}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Info Rows */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, flex: 1 }}>
                    {/* Workplace */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 16, color: '#86868b', mt: 0.2 }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#1d1d1f',
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          flex: 1
                        }}
                      >
                        {client.workplace}
                      </Typography>
                    </Box>
                    
                    {/* District */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#86868b' }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#1d1d1f',
                          fontSize: '0.75rem'
                        }}
                      >
                        {client.district}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    pt: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 14, color: '#007AFF' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.25rem' }}>
                          {client.pageViews}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#86868b', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Просмотров
                      </Typography>
                    </Box>
                    
                    <Box sx={{ width: '1px', background: 'rgba(0, 0, 0, 0.1)' }} />
                    
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                        <TimerIcon sx={{ fontSize: 14, color: '#5856D6' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.25rem' }}>
                          {formatTime(client.totalTime)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#86868b', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Время
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        
        {filteredClients.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ color: '#86868b' }}>
              {searchQuery ? 'Клиенты не найдены' : 'Нет данных о клиентах'}
            </Typography>
          </Box>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#1d1d1f',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&.Mui-selected': {
                    background: '#007AFF',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      background: '#0051D5'
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Box>
      
      {/* Footer Stats */}
      {filteredClients.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          background: '#f5f5f7',
          display: 'flex',
          justifyContent: 'center',
          gap: 3
        }}>
          <Typography variant="caption" sx={{ color: '#86868b', fontWeight: 500 }}>
            Показано {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} из {filteredClients.length}
          </Typography>
          <Typography variant="caption" sx={{ color: '#86868b', fontWeight: 500 }}>
            Всего клиентов: {clients.length}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ClientsStatisticsCards;

