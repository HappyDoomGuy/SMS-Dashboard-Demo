import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            color: params.value ? 'text.primary' : 'text.disabled',
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
            color: params.value ? 'text.primary' : 'text.disabled',
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
            color: params.value ? 'text.primary' : 'text.disabled',
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
            color: params.value ? 'text.primary' : 'text.disabled',
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
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    }
  ];

  return (
    <Paper 
      sx={{ 
        width: '100%',
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid #e9ecef',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e9ecef' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
          Статистика по клиентам
        </Typography>
      </Box>
      
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          hideFooterPagination={true}
          hideFooter={false}
          sortingMode="client"
          initialState={{
            sorting: {
              sortModel: [{ field: 'pageViews', sort: 'desc' }]
            }
          }}
          localeText={{
            noRowsLabel: 'Нет данных о клиентах',
            noResultsOverlayLabel: 'Клиенты не найдены.',
            toolbarQuickFilterPlaceholder: 'Поиск...',
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              borderBottom: '1px solid rgba(224, 224, 224, 0.4)'
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: '0.875rem',
              fontWeight: 700,
              background: '#f8f9fa',
              color: '#495057',
              borderBottom: '2px solid #dee2e6'
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                background: '#f8f9fa',
                cursor: 'pointer'
              },
              '&:nth-of-type(even)': {
                background: 'rgba(0, 0, 0, 0.01)'
              }
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '2px solid #e9ecef',
              background: '#f8f9fa',
              justifyContent: 'center'
            }
          }}
          hideFooter={true}
        />
      </Box>
    </Paper>
  );
};

export default ClientsStatisticsTable;
