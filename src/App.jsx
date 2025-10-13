import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper,
  Alert,
  Toolbar,
  Button,
  Chip,
  Grid
} from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Refresh as RefreshIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, dataUtils } from './services/api';
import StatisticsCards from './components/StatisticsCards';
import CampaignsTable from './components/CampaignsTable';
import CampaignsTimeline from './components/CampaignsTimeline';
import ViewsDynamicsChart from './components/ViewsDynamicsChart';
import ClientsStatisticsCards from './components/ClientsStatisticsCards';
import AIConsultant from './components/AIConsultant';
import AIConsultantOptimistic from './components/AIConsultantOptimistic';
import AnimatedLogo from './components/AnimatedLogo';
import config, { getCoverageColor } from './config';
import { exportDataGridToExcel } from './utils/exportToExcel';
import dashboardStorage from './utils/localStorage';
import {
  StatisticsCardsSkeleton,
  TableSkeleton,
  ClientCardsSkeleton,
  ChartSkeleton,
  CampaignsTimelineSkeleton
} from './components/SkeletonLoaders';

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

function CustomToolbar({ rows, columns, contentType, enqueueSnackbar }) {
  const handleExport = () => {
    try {
      const filename = `${contentType}_лог_просмотров_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;
      exportDataGridToExcel(rows, columns, filename);
      enqueueSnackbar('Файл успешно экспортирован', { variant: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar('Ошибка при экспорте файла', { variant: 'error' });
    }
  };

  return (
    <GridToolbarContainer sx={{ p: 2, gap: 1 }}>
      <GridToolbarColumnsButton sx={{ color: '#1d1d1f', fontWeight: 400, textTransform: 'none' }} />
      <GridToolbarFilterButton sx={{ color: '#1d1d1f', fontWeight: 400, textTransform: 'none' }} />
      <GridToolbarDensitySelector sx={{ color: '#1d1d1f', fontWeight: 400, textTransform: 'none' }} />
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
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter 
        debounceMs={500}
        sx={{ 
          minWidth: 200,
          '& .MuiInputBase-root': {
            color: '#1d1d1f',
            fontSize: '0.875rem',
            '& input': {
              color: '#1d1d1f'
            }
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#86868b',
            opacity: 1
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
            borderRadius: '8px'
          },
          '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.24)'
          },
          '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#007AFF',
            borderWidth: '1px'
          },
          '& .MuiSvgIcon-root': {
            color: '#86868b'
          }
        }}
      />
    </GridToolbarContainer>
  );
}

function App() {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedTab, setSelectedTab] = useState(() => dashboardStorage.getSelectedTab());
  const [sortModel, setSortModel] = useState([{ field: 'date', sort: 'desc' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Save selected tab to localStorage
  useEffect(() => {
    dashboardStorage.setSelectedTab(selectedTab);
  }, [selectedTab]);

  const loadData = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch combined data with user information
      const combinedData = await apiService.getCombinedData();
      const types = dataUtils.getContentTypes(combinedData);
      
      setData(combinedData);
      setContentTypes(types);
      setLastUpdate(new Date());

      // Show success notification (only on manual refresh)
      if (e) {
        enqueueSnackbar('Данные успешно обновлены', { variant: 'success' });
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading data:', err);
      enqueueSnackbar('Ошибка загрузки данных. Попробуйте еще раз.', { variant: 'error' });
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
              color: isValid ? '#1d1d1f' : '#86868b'
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
            color: params.value ? '#1d1d1f' : '#86868b',
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
            color: params.value ? '#1d1d1f' : '#86868b',
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
            color: params.value ? '#1d1d1f' : '#86868b',
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
            color: params.value ? '#1d1d1f' : '#86868b',
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
            color: params.value ? '#1d1d1f' : '#86868b',
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
      field: 'abGroup',
      headerName: 'Группа A/B',
      width: 100,
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? '#1d1d1f' : '#86868b',
            fontStyle: params.value ? 'normal' : 'italic',
            fontWeight: params.value ? 600 : 'normal'
          }}
        >
          {params.value || '—'}
        </Typography>
      )
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
            color: params.value ? '#1d1d1f' : '#86868b',
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
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <AnimatedLogo size={150} showParticles={true} />
        <Typography 
          variant="h5" 
          sx={{ 
            mt: 4, 
            color: '#1a2332', 
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          Загрузка данных...
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 1, 
            color: '#6b7280',
            textAlign: 'center'
          }}
        >
          Пожалуйста, подождите
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', pb: 4 }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Toolbar sx={{ py: 2.5 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: -0.5,
              color: '#1d1d1f',
              fontSize: '1.5rem'
            }}
          >
            {config.company.displayName}
          </Typography>
          {lastUpdate && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#86868b',
                mr: 3,
                fontWeight: 400,
                fontSize: '0.875rem'
              }}
            >
              Обновлено: {lastUpdate.toLocaleString('ru-RU')}
            </Typography>
          )}
          <Button
            type="button"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            variant="contained"
            sx={{
              borderRadius: '980px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                transition: 'left 0.5s ease'
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #0051D5 0%, #003DA5 100%)',
                boxShadow: '0 6px 20px rgba(0, 122, 255, 0.4)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: '100%'
                }
              },
              '&:active': {
                transform: 'scale(0.98) translateY(-2px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
            borderRadius: 2,
            overflow: 'hidden',
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="content type tabs"
            variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        minHeight: 56,
                        py: 2,
                        transition: 'all 0.2s ease',
                        color: '#86868b',
                        position: 'relative',
                        '&:hover': {
                          color: '#1d1d1f'
                        },
                        '&.Mui-selected': {
                          color: '#1d1d1f',
                          fontWeight: 600
                        }
                      },
              '& .MuiTabs-indicator': {
                height: 2,
                background: '#007AFF',
                borderRadius: '2px 2px 0 0'
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
        {loading ? (
          <StatisticsCardsSkeleton />
        ) : filteredData.length > 0 ? (
          <StatisticsCards 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        ) : null}

        {/* Campaigns Timeline */}
        {loading ? (
          <CampaignsTimelineSkeleton />
        ) : filteredData.length > 0 ? (
          <CampaignsTimeline 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        ) : null}

        {/* Views Dynamics Chart */}
        {loading ? (
          <ChartSkeleton />
        ) : filteredData.length > 0 ? (
          <ViewsDynamicsChart 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        ) : null}

        {/* Data Table */}
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
          <Box sx={{ 
            p: 2.5, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.125rem' }}>
              Лог просмотров
            </Typography>
          </Box>
          
          {contentTypes.map((type, index) => (
            <TabPanel key={type} value={selectedTab} index={index}>
              <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  disableSelectionOnClick
                  pagination
                  pageSizeOptions={[25, 50, 100, 200]}
                  sortingMode="client"
                  filterMode="client"
                  disableVirtualization={false}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 100, page: 0 }
                    },
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
                        enqueueSnackbar={enqueueSnackbar}
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
                    MuiTablePagination: {
                      labelRowsPerPage: 'Строк на странице:',
                      labelDisplayedRows: ({ from, to, count }) =>
                        `${from}–${to} из ${count !== -1 ? count : `больше чем ${to}`}`,
                    },
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
                    background: '#ffffff',
                    '& .MuiDataGrid-main': {
                      borderRadius: 0
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.875rem',
                      alignItems: 'flex-start',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      color: '#1d1d1f'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#f5f5f7',
                      color: '#86868b',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: 'auto !important',
                      maxHeight: 'none !important',
                      '&:hover': {
                        background: '#f5f5f7'
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
                      background: '#ffffff',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                      background: '#ffffff'
                    }
                  }}
                  getRowHeight={() => 'auto'}
                />
              </Box>
            </TabPanel>
          ))}
        </Paper>

        {/* Clients Statistics Cards */}
        {loading ? (
          <ClientCardsSkeleton />
        ) : filteredData.length > 0 ? (
          <ClientsStatisticsCards 
            data={filteredData} 
            currentContentType={contentTypes[selectedTab]} 
          />
        ) : null}

        {/* AI Consultant - Floating Button */}
        {filteredData.length > 0 && contentTypes[selectedTab] && (
          <AIConsultant 
            key={selectedTab} // Сбрасывает состояние при смене вкладки
            data={filteredData}
            contentType={contentTypes[selectedTab]}
            campaignsData={aiCampaignsData}
            clientsData={aiClientsData}
          />
        )}

        {/* AI Consultant Optimistic - Floating Button */}
        {filteredData.length > 0 && contentTypes[selectedTab] && (
          <AIConsultantOptimistic
            key={`optimistic-${selectedTab}`} // Сбрасывает состояние при смене вкладки
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
