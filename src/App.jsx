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
  Chip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { apiService, dataUtils } from './services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
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
    setSelectedTab(newValue);
  };

  // Filter data by selected content type
  const filteredData = contentTypes.length > 0 
    ? data.filter(item => item.contentType === contentTypes[selectedTab])
    : data;

  // DataGrid columns configuration
  const columns = [
    {
      field: 'date',
      headerName: 'Дата и время',
      width: 180,
      sortable: true
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
      minWidth: 200,
      maxWidth: 350,
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
            color: params.value ? 'text.primary' : 'text.disabled',
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
            color: params.value ? 'text.primary' : 'text.disabled',
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
  ];

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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SMS Dashboard - Аналитика рассылок с данными кампаний
          </Typography>
          <Button
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
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
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
            </Typography>
            <Chip 
              label={`Записей (без "Не врач"): ${data.length}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            {data.length > 0 && (() => {
              const stats = dataUtils.getUserDataStats(data);
              const campaignStats = dataUtils.getCampaignDataStats(data);
              return (
                <>
                  <Chip 
                    label={`С данными пользователей: ${stats.withUserData}`} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Покрытие: ${stats.coveragePercent}%`} 
                    size="small" 
                    color={stats.coveragePercent >= 70 ? "success" : stats.coveragePercent >= 40 ? "warning" : "error"}
                    variant="outlined"
                  />
                  <Chip 
                    label={`С данными кампаний: ${campaignStats.withCampaignData}`} 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                </>
              );
            })()}
          </Box>
        )}

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              aria-label="content type tabs"
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
          </Box>

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
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.875rem',
                      alignItems: 'flex-start',
                      paddingTop: '8px',
                      paddingBottom: '8px'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '0.875rem',
                      fontWeight: 600
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: 'auto !important',
                      maxHeight: 'none !important'
                    },
                    '& .MuiDataGrid-cell--textLeft': {
                      alignItems: 'flex-start'
                    },
                    '& .MuiDataGrid-cell--textRight': {
                      alignItems: 'flex-start'
                    },
                    '& .MuiDataGrid-cell--textCenter': {
                      alignItems: 'flex-start'
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
