// Утилиты для работы с localStorage

const STORAGE_KEYS = {
  SELECTED_TAB: 'sms_dashboard_selected_tab',
  SORT_MODEL: 'sms_dashboard_sort_model',
  FILTER_MODEL: 'sms_dashboard_filter_model',
  DENSITY: 'sms_dashboard_density',
  COLUMN_VISIBILITY: 'sms_dashboard_column_visibility',
  PAGE_SIZE: 'sms_dashboard_page_size'
};

// Безопасное сохранение в localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Безопасное чтение из localStorage
const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Удаление из localStorage
const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

// Очистка всех настроек дашборда
const clearAllSettings = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Специфичные функции для дашборда
export const dashboardStorage = {
  // Выбранная вкладка
  getSelectedTab: () => loadFromStorage(STORAGE_KEYS.SELECTED_TAB, 0),
  setSelectedTab: (tabIndex) => saveToStorage(STORAGE_KEYS.SELECTED_TAB, tabIndex),

  // Модель сортировки
  getSortModel: (contentType) => loadFromStorage(`${STORAGE_KEYS.SORT_MODEL}_${contentType}`, [{ field: 'date', sort: 'desc' }]),
  setSortModel: (contentType, sortModel) => saveToStorage(`${STORAGE_KEYS.SORT_MODEL}_${contentType}`, sortModel),

  // Модель фильтрации
  getFilterModel: (contentType) => loadFromStorage(`${STORAGE_KEYS.FILTER_MODEL}_${contentType}`, { items: [] }),
  setFilterModel: (contentType, filterModel) => saveToStorage(`${STORAGE_KEYS.FILTER_MODEL}_${contentType}`, filterModel),

  // Плотность таблицы
  getDensity: () => loadFromStorage(STORAGE_KEYS.DENSITY, 'standard'),
  setDensity: (density) => saveToStorage(STORAGE_KEYS.DENSITY, density),

  // Видимость колонок
  getColumnVisibility: (contentType) => loadFromStorage(`${STORAGE_KEYS.COLUMN_VISIBILITY}_${contentType}`, {}),
  setColumnVisibility: (contentType, columnVisibility) => saveToStorage(`${STORAGE_KEYS.COLUMN_VISIBILITY}_${contentType}`, columnVisibility),

  // Размер страницы
  getPageSize: () => loadFromStorage(STORAGE_KEYS.PAGE_SIZE, 25),
  setPageSize: (pageSize) => saveToStorage(STORAGE_KEYS.PAGE_SIZE, pageSize),

  // Очистка всех настроек
  clearAll: clearAllSettings
};

export default dashboardStorage;

