import React, { useState } from 'react';
import { Paper, Typography, Box, Button, Avatar, Chip, Grid, TextField, InputAdornment } from '@mui/material';
import { 
  FileDownload as FileDownloadIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  LocalHospital as LocalHospitalIcon
} from '@mui/icons-material';
import { exportDataGridToExcel } from '../utils/exportToExcel';

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

// Функция для генерации инициалов
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(p => p);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

// Функция для генерации цвета аватара
const getAvatarColor = (name) => {
  const colors = [
    '#007AFF', '#34C759', '#FF9500', '#5856D6', '#FF3B30',
    '#00C7BE', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFCC00'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const ClientsStatisticsTable = ({ data, currentContentType }) => {
  // Group data by user (phone number)
  const userStats = new Map();
  
  data.forEach(item => {
    const phone = item.phone || '';
    
    if (!phone) return;
    
    if (!userStats.has(phone)) {
      userStats.set(phone, {
        phone,
        userName: item.userName || '',
        specialty: item.specialty || '',
        workplace: item.workplace || '',
        district: item.district || '',
        pageViews: 0,
        totalTime: 0
      });
    }
    
    const stats = userStats.get(phone);
    stats.pageViews += 1;
    stats.totalTime += (item.timeSec || 0);
  });
  
  // Convert to array for DataGrid
  const rows = Array.from(userStats.values())
    .filter(user => user.userName) // Only show users with data
    .map((user, index) => ({
      id: index + 1,
      userName: user.userName,
      specialty: user.specialty,
      workplace: user.workplace,
      district: user.district,
      pageViews: user.pageViews,
      totalTime: user.totalTime,
      totalTimeFormatted: formatTime(user.totalTime)
    }))
    .sort((a, b) => b.pageViews - a.pageViews); // Sort by page views descending
  
  // Define columns
  const columns = [
    {
      field: 'userName',
      headerName: 'ФИО',
      flex: 1,
      minWidth: 200,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#374151' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic'
          }}
        >
          {params.value || 'Не найдено'}
        </Typography>
      )
    },
    {
      field: 'specialty',
      headerName: 'Специальность',
      width: 180,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#374151' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic'
          }}
        >
          {params.value || 'Не указано'}
        </Typography>
      )
    },
    {
      field: 'workplace',
      headerName: 'Место работы',
      width: 250,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#374151' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic',
            fontSize: '0.875rem'
          }}
        >
          {params.value || 'Не указано'}
        </Typography>
      )
    },
    {
      field: 'district',
      headerName: 'Район',
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#374151' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic'
          }}
        >
          {params.value || 'Не указан'}
        </Typography>
      )
    },
    {
      field: 'pageViews',
      headerName: 'Просмотров страниц',
      width: 170,
      sortable: true,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'totalTimeFormatted',
      headerName: 'Время просмотров',
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    }
  ];

  return (
    <Paper sx={premiumLightTableStyles.paper}>
      <Box sx={premiumLightTableStyles.header}>
        <Typography variant="h6" sx={premiumLightTableStyles.headerText}>
          👥 Статистика по клиентам
        </Typography>
      </Box>
      
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          hideFooter={true}
          sortingMode="client"
          initialState={{
            sorting: {
              sortModel: [{ field: 'pageViews', sort: 'desc' }]
            }
          }}
          slots={{
            toolbar: () => (
              <ClientsToolbar 
                rows={rows} 
                columns={columns} 
                contentType={currentContentType}
              />
            ),
          }}
          localeText={{
            noRowsLabel: 'Нет данных о клиентах',
            noResultsOverlayLabel: 'Клиенты не найдены.',
            toolbarQuickFilterPlaceholder: 'Поиск...',
            toolbarDensity: 'Плотность',
            toolbarDensityLabel: 'Плотность',
            toolbarDensityCompact: 'Компактная',
            toolbarDensityStandard: 'Стандартная',
            toolbarDensityComfortable: 'Комфортная',
            toolbarColumns: 'Колонки',
            toolbarFilters: 'Фильтры',
          }}
          sx={premiumLightTableStyles.dataGrid}
        />
      </Box>
    </Paper>
  );
};

export default ClientsStatisticsTable;
