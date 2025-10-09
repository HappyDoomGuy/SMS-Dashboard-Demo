import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { exportDataGridToExcel } from '../utils/exportToExcel';
import { premiumTableStyles } from '../styles/premiumTableStyles';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function ClientsToolbar({ rows, columns, contentType }) {
  const handleExport = () => {
    const filename = `${contentType}_статистика_по_клиентам_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;
    exportDataGridToExcel(rows, columns, filename);
  };

  return (
    <GridToolbarContainer sx={{ p: 2, gap: 1 }}>
      <GridToolbarColumnsButton sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />
      <GridToolbarFilterButton sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />
      <GridToolbarDensitySelector sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />
      <Button
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        size="small"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            background: 'rgba(100, 116, 255, 0.1)'
          }
        }}
      >
        Экспорт в Excel
      </Button>
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter 
        debounceMs={500}
        sx={{ 
          minWidth: 200,
          '& .MuiInputBase-root': {
            color: 'rgba(255, 255, 255, 0.9)',
            '& input': {
              color: 'rgba(255, 255, 255, 0.9)'
            }
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 1
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(100, 116, 255, 0.3)'
          },
          '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(100, 116, 255, 0.5)'
          },
          '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6474ff'
          },
          '& .MuiSvgIcon-root': {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }}
      />
    </GridToolbarContainer>
  );
}

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
            color: params.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
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
    <Paper sx={premiumTableStyles.paper}>
      <Box sx={premiumTableStyles.header}>
        <Typography variant="h6" sx={premiumTableStyles.headerText}>
          Статистика по клиентам
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
          sx={premiumTableStyles.dataGrid}
        />
      </Box>
    </Paper>
  );
};

export default ClientsStatisticsTable;
