import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getSmsMultiplier, isAllowedCampaignSource } from '../config';
import { apiService } from '../services/api';

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
  
  relevantCampaigns.forEach(campaign => {
    const campaignName = campaign['Название кампании'] || '';
    const distId = campaign['ID дистрибуции'] || '';
    const contactCount = parseInt(campaign['Кол-во обычных контактов']) || 0;
    
    if (!campaignStats.has(campaignName)) {
      // Get all views for this distribution ID
      const campaignViews = data.filter(item => item.distributionType === distId);
      
      // Get latest date for this campaign
      const dates = campaignViews.map(item => new Date(item.date)).filter(d => !isNaN(d.getTime()));
      const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
      
      // Calculate SMS viewed (with multiplier)
      const multiplier = getSmsMultiplier(currentContentType);
      const smsViewed = Math.round(campaignViews.length * multiplier);
      
      campaignStats.set(campaignName, {
        campaignName,
        latestDate: latestDate ? latestDate.toLocaleString('ru-RU') : '',
        smsSent: contactCount,
        smsViewed: smsViewed,
        pageViews: campaignViews.length
      });
    }
  });
  
  // Convert to array for DataGrid
  const rows = Array.from(campaignStats.values()).map((item, index) => ({
    id: index + 1,
    ...item
  }));
  
  // Define columns
  const columns = [
    {
      field: 'campaignName',
      headerName: 'Название кампании',
      flex: 1,
      minWidth: 300,
      sortable: true
    },
    {
      field: 'latestDate',
      headerName: 'Дата и время',
      width: 180,
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
      
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          hideFooterPagination={true}
          hideFooter={false}
          sortingMode="client"
          initialState={{
            sorting: {
              sortModel: [{ field: 'latestDate', sort: 'desc' }]
            }
          }}
          localeText={{
            noRowsLabel: 'Нет кампаний',
            noResultsOverlayLabel: 'Кампании не найдены.',
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
          slots={{
            footer: () => (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '40px',
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}>
                Всего кампаний: {rows.length}
              </Box>
            )
          }}
        />
      </Box>
    </Paper>
  );
};

export default CampaignsTable;
