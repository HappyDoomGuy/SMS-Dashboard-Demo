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
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { apiService, dataUtils } from './services/api';
import StatisticsCards from './components/StatisticsCards';
import config, { getCoverageColor } from './config';

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

  // Filter data by selected content type and sort by date (newest first)
  const filteredData = React.useMemo(() => {
    return (contentTypes.length > 0 
      ? data.filter(item => item.contentType === contentTypes[selectedTab])
      : data
    ).sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA - dateB; // Changed: A - B for newest first
    });
  }, [data, contentTypes, selectedTab]);

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
              color: isValid ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)'
            }}
          >
            {isValid ? parsed.toLocaleString('ru-RU') : params.value || 'Неверная дата'}
          </Typography>
        );
      }
    },
    {
      field: 'phone',
      headerName: 'Номер телефона',
      width: 150,
      sortable: true
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
            color: params.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
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
            color: params.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.3)',
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
    },
    {
      field: 'distributionType',
      headerName: 'Тип дистрибуции',
      width: 150,
      sortable: true
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
          background: '#16213e',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: '#ffffff'
            }}
          >
            {config.company.displayName}
          </Typography>
          <Button
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
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

        {lastUpdate && (
          <Box 
            sx={{ 
              mb: 3, 
              p: 2.5,
              borderRadius: 3,
              background: '#16213e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              flexWrap: 'wrap'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500
              }}
            >
              Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
            </Typography>
            <Chip 
              label={`Записей: ${data.length}`} 
              size="small" 
              sx={{
                background: '#2d3561',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '& .MuiChip-label': { px: 2 }
              }}
            />
            {data.length > 0 && (() => {
              const stats = dataUtils.getUserDataStats(data);
              const campaignStats = dataUtils.getCampaignDataStats(data);
              return (
                <>
                  <Chip 
                    label={`С данными: ${stats.withUserData}`} 
                    size="small" 
                    sx={{
                      background: '#2d3561',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <Chip 
                    label={`Покрытие: ${stats.coveragePercent}%`} 
                    size="small" 
                    sx={{
                      background: stats.coveragePercent >= 70 
                        ? '#2ecc71'
                        : stats.coveragePercent >= 40
                        ? '#f39c12'
                        : '#e74c3c',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <Chip 
                    label={`Кампаний: ${campaignStats.withCampaignData}`} 
                    size="small" 
                    sx={{
                      background: '#2d3561',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </>
              );
            })()}
          </Box>
        )}

        {/* Global Tabs Navigation */}
        <Paper 
          sx={{ 
            width: '100%', 
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            background: '#0f3460',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
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
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 80,
                transition: 'all 0.3s ease',
                color: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.9)'
                },
                '&.Mui-selected': {
                  color: '#ffffff',
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: '#e84393',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          >
            {contentTypes.map((type, index) => (
              <Tab
                key={type}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {data.filter(item => item.contentType === type).length} записей
                    </Typography>
                  </Box>
                }
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

        {/* Data Table */}
        <Paper 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            background: '#0f3460',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
          }}
        >
          {contentTypes.map((type, index) => (
            <TabPanel key={type} value={selectedTab} index={index}>
              <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  disableSelectionOnClick
                  hideFooterPagination={true}
                  hideFooter={false}
                  footerHeight={40}
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
                  components={{
                    Toolbar: GridToolbar,
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
                        Всего записей: {filteredData.length}
                      </Box>
                    )
                  }}
                  componentsProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
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
                    '& .MuiDataGrid-main': {
                      borderRadius: 2
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.875rem',
                      alignItems: 'flex-start',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.85)'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      background: '#16213e',
                      color: 'rgba(255, 255, 255, 0.9)',
                      borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: 'auto !important',
                      maxHeight: 'none !important',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer'
                      },
                      '&:nth-of-type(even)': {
                        background: 'rgba(0, 0, 0, 0.15)'
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
                      background: '#16213e',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      '& .MuiButton-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.05)'
                        }
                      },
                      '& .MuiInputBase-root': {
                        color: 'rgba(255, 255, 255, 0.85)',
                        '& input': {
                          color: 'rgba(255, 255, 255, 0.85)'
                        }
                      }
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '2px solid rgba(255, 255, 255, 0.08)',
                      background: '#16213e',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                  getRowHeight={() => 'auto'}
                />
              </Box>
            </TabPanel>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
