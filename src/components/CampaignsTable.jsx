import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { getSmsMultiplier, isAllowedCampaignSource } from '../config';
import { apiService } from '../services/api';
import { exportDataGridToExcel } from '../utils/exportToExcel';

function CampaignsToolbar({ rows, columns, contentType }) {
  const handleExport = () => {
    const filename = `${contentType}_статистика_по_кампаниям_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;
    exportDataGridToExcel(rows, columns, filename);
  };

  return (
    <GridToolbarContainer sx={{ p: 2, gap: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Button
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        size="small"
        sx={{
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Экспорт в Excel
      </Button>
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter 
        debounceMs={500}
        sx={{ minWidth: 200 }}
      />
    </GridToolbarContainer>
  );
}

const CampaignsTable = ({ data, currentContentType }) => {
  // Get all campaigns from the original campaigns data
  const allCampaigns = apiService.getFilteredCampaigns();
  
  // Get unique distribution IDs for current content type
  const currentDistributionIds = new Set(
    data
      .filter(item => item.contentType === currentContentType)
      .map(item => item.distributionType)
      .filter(id => id)
  );
  
  // Filter campaigns by current content type
  const relevantCampaigns = allCampaigns.filter(campaign => {
    const source = campaign['Название таблицы (Источник)'] || '';
    const distId = campaign['ID дистрибуции'] || '';
    
    if (!isAllowedCampaignSource(source)) {
      return false;
    }
    
    return currentDistributionIds.has(distId);
  });
  
  // Group data by campaign name
  const campaignStats = new Map();
  
  // Helper function to parse dates in multiple formats
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Try standard Date constructor first
    let date = new Date(dateString);
    if (!isNaN(date.getTime()) && date.getFullYear() > 2000) {
      return date;
    }
    
    // Try Russian format: DD.MM.YYYY HH:MM:SS or DD.MM.YYYY HH:MM
    const ruFormatMatch = dateString.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/);
    if (ruFormatMatch) {
      const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = ruFormatMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                     parseInt(hours), parseInt(minutes), parseInt(seconds));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  };

  // Process each row from campaigns table
  relevantCampaigns.forEach(campaign => {
    const campaignName = campaign['Название кампании'] || '';
    const distId = campaign['ID дистрибуции'] || '';
    const contactCount = parseInt(campaign['Кол-во обычных контактов']) || 0;
    const campaignDate = campaign['Дата и время'] || '';
    
    if (!campaignStats.has(campaignName)) {
      // Initialize stats for this campaign name
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
    
    // Sum SMS sent from ALL rows with this campaign name
    stats.smsSent += contactCount;
    
    // Update latest date from campaigns table
    if (campaignDate) {
      const date = parseDate(campaignDate);
      if (date && !isNaN(date.getTime())) {
        if (!stats.latestDate || date > stats.latestDate) {
          stats.latestDate = date;
        }
      }
    }
    
    // Process each distribution ID only once for views counting
    if (!stats.processedDistIds.has(distId)) {
      stats.processedDistIds.add(distId);
      
      // Get all views for this distribution ID
      const campaignViews = data.filter(item => item.distributionType === distId);
      
      // Add page views
      stats.pageViews += campaignViews.length;
      
      // Calculate SMS viewed (with multiplier, keep as float for now)
      const multiplier = getSmsMultiplier(currentContentType);
      stats.smsViewed += (campaignViews.length * multiplier); // Don't round yet
    }
  });
  
  // Convert to array for DataGrid
  const rowsBeforeRounding = Array.from(campaignStats.values()).map((item, index) => ({
    id: index + 1,
    campaignName: item.campaignName,
    latestDate: item.latestDate ? item.latestDate.toLocaleString('ru-RU') : 'Нет данных',
    smsSent: item.smsSent,
    smsViewedFloat: item.smsViewed, // Keep float value
    smsViewed: 0, // Will be calculated
    pageViews: item.pageViews
  }));
  
  // Calculate total SMS viewed (sum of floats, then round)
  const totalSmsViewedFloat = rowsBeforeRounding.reduce((sum, row) => sum + row.smsViewedFloat, 0);
  const totalSmsViewedRounded = Math.round(totalSmsViewedFloat);
  
  // Distribute the rounded total proportionally
  let remaining = totalSmsViewedRounded;
  const rows = rowsBeforeRounding.map((row, index) => {
    if (index === rowsBeforeRounding.length - 1) {
      // Last row gets the remainder
      row.smsViewed = remaining;
    } else {
      // Proportional rounding
      row.smsViewed = Math.round(row.smsViewedFloat);
      remaining -= row.smsViewed;
    }
    delete row.smsViewedFloat;
    return row;
  });
  
  
  // Define columns
  const columns = [
    {
      field: 'latestDate',
      headerName: 'Дата и время',
      width: 180,
      sortable: true
    },
    {
      field: 'campaignName',
      headerName: 'Название кампании',
      flex: 1,
      minWidth: 300,
      sortable: true
    },
    {
      field: 'smsSent',
      headerName: 'Отправлено СМС',
      width: 150,
      sortable: true,
      type: 'number',
      valueFormatter: (params) => params.value.toLocaleString('ru-RU')
    },
    {
      field: 'smsViewed',
      headerName: 'Просмотров СМС',
      width: 150,
      sortable: true,
      type: 'number',
      valueFormatter: (params) => params.value.toLocaleString('ru-RU')
    },
    {
      field: 'pageViews',
      headerName: 'Просмотров страниц',
      width: 170,
      sortable: true,
      type: 'number',
      valueFormatter: (params) => params.value.toLocaleString('ru-RU')
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
          Статистика по кампаниям
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
              sortModel: [{ field: 'latestDate', sort: 'desc' }]
            }
          }}
          slots={{
            toolbar: () => (
              <CampaignsToolbar 
                rows={rows} 
                columns={columns} 
                contentType={currentContentType}
              />
            ),
          }}
          localeText={{
            noRowsLabel: 'Нет кампаний',
            noResultsOverlayLabel: 'Кампании не найдены.',
            toolbarQuickFilterPlaceholder: 'Поиск...',
            toolbarDensity: 'Плотность',
            toolbarDensityLabel: 'Плотность',
            toolbarDensityCompact: 'Компактная',
            toolbarDensityStandard: 'Стандартная',
            toolbarDensityComfortable: 'Комфортная',
            toolbarColumns: 'Колонки',
            toolbarFilters: 'Фильтры',
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
        />
      </Box>
    </Paper>
  );
};

export default CampaignsTable;
