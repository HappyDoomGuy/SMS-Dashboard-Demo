import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Toolbar,
  Button,
  Chip,
  Grid
} from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Refresh as RefreshIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { apiService, dataUtils } from './services/api';
import StatisticsCards from './components/StatisticsCards';
import CampaignsTable from './components/CampaignsTable';
import CampaignsTimeline from './components/CampaignsTimeline';
import ViewsDynamicsChart from './components/ViewsDynamicsChart';
import ClientsStatisticsTable from './components/ClientsStatisticsTable';
import AIConsultant from './components/AIConsultant';
import config, { getCoverageColor } from './config';
import { exportDataGridToExcel } from './utils/exportToExcel';

function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{
        opacity: value === index ? 1 : 0,
        transition: 'opacity 0.15s ease-in-out',
        display: value === index ? 'block' : 'none'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function CustomToolbar({ rows, columns, contentType }) {
  const handleExport = () => {
    const filename = `${contentType}_лог_просмотров_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;
    exportDataGridToExcel(rows, columns, filename);
  };

  return (
    <GridToolbarContainer sx={{ p: 2, gap: 1 }}>
      <GridToolbarColumnsButton sx={{ color: '#374151', fontWeight: 600 }} />
      <GridToolbarFilterButton sx={{ color: '#374151', fontWeight: 600 }} />
      <GridToolbarDensitySelector sx={{ color: '#374151', fontWeight: 600 }} />
      <Button
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        size="small"
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          color: '#6474ff',
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
            color: '#1a2332',
            '& input': {
              color: '#1a2332'
            }
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#9ca3af',
            opacity: 1
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(100, 116, 255, 0.2)'
          },
          '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(100, 116, 255, 0.4)'
          },
          '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6474ff',
            boxShadow: '0 0 0 3px rgba(100, 116, 255, 0.1)'
          },
          '& .MuiSvgIcon-root': {
            color: '#6b7280'
          }
        }}
      />
    </GridToolbarContainer>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'date', sort: 'desc' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch combined data with user information
      const combinedData = await apiService.getCombinedData();
      const types = dataUtils.getContentTypes(combinedData);
      
      setData(combinedData);
      setContentTypes(types);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    // Use startTransition for non-blocking UI update
    React.startTransition(() => {
      setSelectedTab(newValue);
      // Reset sorting to default (newest first) when changing tabs
      setSortModel([{ field: 'date', sort: 'desc' }]);
    });
  };

  // Helper function to parse date string
  const parseDate = (dateString) => {
    if (!dateString || dateString.trim() === '') return new Date(0);
    
    // Clean the string
    const cleanDate = dateString.trim();
    
    // Try different date formats
    let date = null;
    
    // Format 1: DD.MM.YYYY HH:MM:SS (Russian format)
    let match = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
    }
    
    // Format 2: DD.MM.YYYY (date only)
    if (!date || isNaN(date.getTime())) {
      match = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    // Format 3: YYYY-MM-DD HH:MM:SS (ISO format)
    if (!date || isNaN(date.getTime())) {
      match = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
      if (match) {
        const [, year, month, day, hour, minute, second] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
      }
    }
    
    // Format 4: YYYY-MM-DD (ISO date only)
    if (!date || isNaN(date.getTime())) {
      match = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    // Fallback: try native Date parsing
    if (!date || isNaN(date.getTime())) {
      date = new Date(cleanDate);
    }
    
    // If still invalid, return epoch
    return isNaN(date.getTime()) ? new Date(0) : date;
  };

  // Filter data by selected content type (sorting handled by DataGrid)
  const filteredData = React.useMemo(() => {
    return contentTypes.length > 0 
      ? data.filter(item => item.contentType === contentTypes[selectedTab])
      : data;
  }, [data, contentTypes, selectedTab]);

  // Prepare campaigns data for AI (always computed, but only used when needed)
  const aiCampaignsData = React.useMemo(() => {
    if (!filteredData.length) return [];
    
    const allCampaigns = apiService.getFilteredCampaigns();
    const currentDistributionIds = new Set(
      filteredData.map(item => item.distributionType).filter(id => id)
    );
    
    const campaignStats = new Map();
    allCampaigns
      .filter(c => currentDistributionIds.has(c['ID дистрибуции']))
      .forEach(campaign => {
        const campaignName = campaign['Название кампании'] || '';
        if (!campaignStats.has(campaignName)) {
          campaignStats.set(campaignName, {
            campaignName,
            latestDate: campaign['Дата и время'] || '',
            smsSent: 0,
            smsViewed: 0,
            pageViews: 0
          });
        }
        const stats = campaignStats.get(campaignName);
        stats.smsSent += parseInt(campaign['Кол-во обычных контактов']) || 0;
      });

    // Calculate views for each campaign
    const currentContentType = contentTypes[selectedTab];
    campaignStats.forEach(stats => {
      const campaignViews = filteredData.filter(
        item => item.campaignName === stats.campaignName
      );
      stats.pageViews = campaignViews.length;
      stats.smsViewed = Math.round(campaignViews.length * 
        (currentContentType === 'Донормил' ? 4.6 : 1.44));
    });

    return Array.from(campaignStats.values());
  }, [filteredData, contentTypes, selectedTab]);

  // Prepare clients data for AI (always computed, but only used when needed)
  const aiClientsData = React.useMemo(() => {
    if (!filteredData.length) return [];
    
    const userStats = new Map();
    filteredData.forEach(item => {
      const phone = item.phone || '';
      if (!phone || !item.userName) return;
      
      if (!userStats.has(phone)) {
        userStats.set(phone, {
          userName: item.userName,
          specialty: item.specialty || '',
          workplace: item.workplace || '',
          district: item.district || '',
          pageViews: 0,
          totalTime: 0,
          totalTimeFormatted: ''
        });
      }
      
      const stats = userStats.get(phone);
      stats.pageViews += 1;
      stats.totalTime += (item.timeSec || 0);
    });

    // Format time for each client
    userStats.forEach(stats => {
      const hours = Math.floor(stats.totalTime / 3600);
      const minutes = Math.floor((stats.totalTime % 3600) / 60);
      const seconds = stats.totalTime % 60;
      stats.totalTimeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    return Array.from(userStats.values());
  }, [filteredData]);

  // Debug: Log sorting info (disabled for performance)
  // React.useEffect(() => {
  //   if (filteredData.length > 0) {
  //     console.log(`Total filtered records: ${filteredData.length}`);
  //   }
  // }, [filteredData]);

  // DataGrid columns configuration (memoized for performance)
  const columns = React.useMemo(() => [
    {
      field: 'date',
      headerName: 'Дата и время',
      width: 180,
      sortable: true,
      sort: 'desc',
      sortComparator: (v1, v2) => {
        const date1 = parseDate(v1);
        const date2 = parseDate(v2);
        return date1.getTime() - date2.getTime(); // Changed: newest first
      },
      renderCell: (params) => {
        const parsed = parseDate(params.value);
        const isValid = parsed.getTime() > 0;
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              color: isValid ? '#374151' : '#9ca3af'
            }}
          >
            {isValid ? parsed.toLocaleString('ru-RU') : params.value || 'Неверная дата'}
          </Typography>
        );
      }
    },
    {
      field: 'userName',
      headerName: 'ФИО',
      width: 200,
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
      minWidth: 200,
      maxWidth: 350,
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
      field: 'campaignName',
      headerName: 'Название кампании',
      width: 250,
      minWidth: 200,
      maxWidth: 350,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#374151' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic',
            fontWeight: params.value ? 'bold' : 'normal'
          }}
        >
          {params.value || 'Не найдено'}
        </Typography>
      )
    },
    {
      field: 'videoName',
      headerName: 'Название видео',
      width: 300,
      sortable: true
    },
    {
      field: 'smsText',
      headerName: 'Текст SMS',
      width: 400,
      minWidth: 300,
      maxWidth: 500,
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#374151' : '#9ca3af',
            fontStyle: params.value ? 'normal' : 'italic',
            fontSize: '0.875rem',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          {params.value || 'Не найден'}
        </Typography>
      )
    },
    {
      field: 'timeSec',
      headerName: 'Время',
      width: 140,
      sortable: true,
      renderCell: (params) => {
        const totalSeconds = params.value || 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        return (
          <Typography variant="body2">
            {timeString}
          </Typography>
        );
      }
    },
    {
      field: 'viewPercent',
      headerName: '% просмотра',
      width: 130,
      sortable: true,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: 8,
              backgroundColor: '#e0e0e0',
              borderRadius: 4,
              overflow: 'hidden',
              mr: 1
            }}
          >
            <Box
              sx={{
                width: `${params.value}%`,
                height: '100%',
                backgroundColor: params.value >= 80 ? '#4caf50' : 
                                params.value >= 50 ? '#ff9800' : '#f44336',
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {params.value}%
          </Typography>
        </Box>
      )
    }
  ], []); // Empty deps - columns don't change

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', pb: 4 }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(100, 116, 255, 0.15)',
          boxShadow: '0 4px 30px rgba(100, 116, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ py: 2.5 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 800,
              letterSpacing: -0.5,
              background: 'linear-gradient(135deg, #1a2332 0%, #6474ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.75rem'
            }}
          >
            {config.company.displayName}
          </Typography>
          {lastUpdate && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280',
                mr: 3,
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Обновлено: {lastUpdate.toLocaleString('ru-RU')}
            </Typography>
          )}
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6474ff 0%, #8b95ff 100%)',
              boxShadow: '0 4px 14px rgba(100, 116, 255, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5060e0 0%, #7a84ff 100%)',
                boxShadow: '0 6px 20px rgba(100, 116, 255, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Обновить
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}


        {/* Global Tabs Navigation */}
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
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="content type tabs"
            variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: 70,
                        py: 2.5,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: '#9ca3af',
                        position: 'relative',
                        '&:hover': {
                          color: '#6474ff',
                          background: 'rgba(100, 116, 255, 0.04)'
                        },
                        '&.Mui-selected': {
                          color: '#1a2332',
                          fontWeight: 800,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #6474ff, #8b95ff)',
                            boxShadow: '0 -2px 10px rgba(100, 116, 255, 0.4)',
                            borderRadius: '4px 4px 0 0'
                          }
                        }
                      },
              '& .MuiTabs-indicator': {
                height: 0
              }
            }}
          >
                    {contentTypes.map((type, index) => (
                      <Tab
                        key={type}
                        label={type}
                        id={`tab-${index}`}
                        aria-controls={`tabpanel-${index}`}
                      />
                    ))}
          </Tabs>
        </Paper>

        {/* Statistics Cards */}
        {filteredData.length > 0 && (
          <StatisticsCards 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        )}

        {/* Campaigns Timeline */}
        {filteredData.length > 0 && (
          <CampaignsTimeline 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        )}

        {/* Views Dynamics Chart */}
        {filteredData.length > 0 && (
          <ViewsDynamicsChart 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        )}

        {/* Data Table */}
        <Paper 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(100, 116, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(100, 116, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ 
            p: 2.5, 
            borderBottom: '1px solid rgba(100, 116, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(100, 116, 255, 0.03) 0%, rgba(139, 149, 255, 0.02) 100%)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2332', fontSize: '1.1rem' }}>
              📋 Лог просмотров
            </Typography>
          </Box>
          
          {contentTypes.map((type, index) => (
            <TabPanel key={type} value={selectedTab} index={index}>
              <Box sx={{ height: '65vh', width: '100%' }}>
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  disableSelectionOnClick
                  hideFooter={true}
                  sortingMode="client"
                  filterMode="client"
                  disableVirtualization={false}
                  initialState={{
                    sorting: {
                      sortModel: [{ field: 'date', sort: 'desc' }]
                    }
                  }}
                  sortModel={sortModel}
                  onSortModelChange={(model) => {
                    // Always ensure date column is sorted desc by default
                    if (model.length === 0) {
                      setSortModel([{ field: 'date', sort: 'desc' }]);
                    } else {
                      setSortModel(model);
                    }
                  }}
                  disableMultipleColumnsSorting={false}
                  slots={{
                    toolbar: () => (
                      <CustomToolbar 
                        rows={filteredData} 
                        columns={columns} 
                        contentType={contentTypes[selectedTab]}
                      />
                    ),
                  }}
                  localeText={{
                    // Toolbar
                    toolbarDensity: 'Плотность',
                    toolbarDensityLabel: 'Плотность',
                    toolbarDensityCompact: 'Компактная',
                    toolbarDensityStandard: 'Стандартная',
                    toolbarDensityComfortable: 'Комфортная',
                    toolbarColumns: 'Колонки',
                    toolbarFilters: 'Фильтры',
                    toolbarQuickFilterPlaceholder: 'Поиск...',
                    toolbarExport: 'Экспорт',
                    toolbarExportPrint: 'Печать',
                    toolbarExportCSV: 'Скачать как CSV',
                    
                    // Pagination
                    footerRowSelected: (count) =>
                      count !== 1
                        ? `${count.toLocaleString()} строк выбрано`
                        : `${count.toLocaleString()} строка выбрана`,
                    footerTotalRows: 'Всего строк:',
                    footerTotalVisibleRows: (visibleCount, totalCount) =>
                      `${visibleCount.toLocaleString()} из ${totalCount.toLocaleString()}`,
                    footerPaginationRowsPerPage: 'Строк на странице:',
                    
                    // Filter panel
                    filterPanelAddFilter: 'Добавить фильтр',
                    filterPanelDeleteIconLabel: 'Удалить',
                    filterPanelOperators: 'Операторы',
                    filterPanelOperatorAnd: 'И',
                    filterPanelOperatorOr: 'ИЛИ',
                    filterPanelColumns: 'Колонки',
                    filterPanelInputLabel: 'Значение',
                    filterPanelInputPlaceholder: 'Значение фильтра',
                    
                    // Filter operators
                    filterOperatorContains: 'содержит',
                    filterOperatorEquals: 'равно',
                    filterOperatorStartsWith: 'начинается с',
                    filterOperatorEndsWith: 'заканчивается на',
                    filterOperatorIs: 'равно',
                    filterOperatorNot: 'не равно',
                    filterOperatorAfter: 'после',
                    filterOperatorOnOrAfter: 'в или после',
                    filterOperatorBefore: 'до',
                    filterOperatorOnOrBefore: 'в или до',
                    filterOperatorIsEmpty: 'пустое',
                    filterOperatorIsNotEmpty: 'не пустое',
                    filterOperatorIsAnyOf: 'любое из',
                    
                    // Column menu
                    columnMenuLabel: 'Меню',
                    columnMenuShowColumns: 'Показать колонки',
                    columnMenuFilter: 'Фильтр',
                    columnMenuHideColumn: 'Скрыть',
                    columnMenuUnsort: 'Отменить сортировку',
                    columnMenuSortAsc: 'Сортировать по возрастанию',
                    columnMenuSortDesc: 'Сортировать по убыванию',
                    columnMenuGroup: 'Группировать',
                    columnMenuUngroup: 'Разгруппировать',
                    columnMenuPinLeft: 'Закрепить слева',
                    columnMenuPinRight: 'Закрепить справа',
                    columnMenuUnpin: 'Открепить',
                    
                    // Column headers
                    columnsPanelTextFieldLabel: 'Найти колонку',
                    columnsPanelTextFieldPlaceholder: 'Заголовок колонки',
                    columnsPanelDragIconLabel: 'Перетащить колонку',
                    columnsPanelShowAllButton: 'Показать все',
                    columnsPanelHideAllButton: 'Скрыть все',
                    
                    // No rows overlay
                    noRowsLabel: 'Нет данных',
                    noResultsOverlayLabel: 'Результаты не найдены.',
                    errorOverlayDefaultLabel: 'Произошла ошибка.',
                  }}
                  sx={{
                    border: 'none',
                    background: 'transparent',
                    '& .MuiDataGrid-main': {
                      borderRadius: 2
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.875rem',
                      alignItems: 'flex-start',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(100, 116, 255, 0.08)',
                      color: '#374151'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      background: 'rgba(100, 116, 255, 0.05)',
                      color: '#1a2332',
                      borderBottom: '2px solid rgba(100, 116, 255, 0.15)'
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: 'auto !important',
                      maxHeight: 'none !important',
                      '&:hover': {
                        background: 'rgba(100, 116, 255, 0.06)',
                        cursor: 'pointer'
                      },
                      '&:nth-of-type(even)': {
                        background: 'rgba(100, 116, 255, 0.02)'
                      }
                    },
                    '& .MuiDataGrid-cell--textLeft': {
                      alignItems: 'flex-start'
                    },
                    '& .MuiDataGrid-cell--textRight': {
                      alignItems: 'flex-start'
                    },
                    '& .MuiDataGrid-cell--textCenter': {
                      alignItems: 'flex-start'
                    },
                    '& .MuiDataGrid-toolbarContainer': {
                      padding: '16px',
                      background: 'rgba(100, 116, 255, 0.03)',
                      borderBottom: '1px solid rgba(100, 116, 255, 0.1)'
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid rgba(100, 116, 255, 0.1)',
                      background: 'rgba(100, 116, 255, 0.03)'
                    }
                  }}
                  getRowHeight={() => 'auto'}
                />
              </Box>
            </TabPanel>
          ))}
        </Paper>

        {/* Clients Statistics Table */}
        {filteredData.length > 0 && (
          <ClientsStatisticsTable 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        )}

        {/* AI Consultant - Floating Button */}
        {filteredData.length > 0 && contentTypes[selectedTab] && (
          <AIConsultant 
            data={filteredData}
            contentType={contentTypes[selectedTab]}
            campaignsData={aiCampaignsData}
            clientsData={aiClientsData}
          />
        )}
      </Container>
    </Box>
  );
}

export default App;
