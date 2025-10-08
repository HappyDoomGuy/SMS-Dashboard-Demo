// ====================================
// КОНФИГУРАЦИЯ ДАШБОРДА
// ====================================
// Этот файл содержит все настройки для тиражирования дашборда

export const config = {
  // ===== НАСТРОЙКИ КОМПАНИИ =====
  company: {
    name: 'Delta Medical',
    displayName: 'SMS Dashboard - Delta Medical',
  },

  // ===== GOOGLE SHEETS ИСТОЧНИКИ ДАННЫХ =====
  dataSources: {
    // Таблица с данными просмотров SMS
    smsData: {
      spreadsheetId: '1iIm0hx5bDEqvd3kpJBBbv_FgdpI6qxM-0pDGvl6bWJY',
      sheetId: 0, // gid параметр
      description: 'Данные просмотров SMS рассылок'
    },
    
    // База пользователей
    usersDatabase: {
      spreadsheetId: '13hEDBGU-nzz0ak8D_JNBzGeOy5lgSRy__kpJTXbk9ZA',
      sheetId: 0, // gid параметр
      description: 'База пользователей PhC 2025'
    },
    
    // Лог рассылок (кампании)
    campaignsLog: {
      spreadsheetId: '1wtiGT4vn5o4icOKnON8a-Orwhz87nGV1qA2Xu6lpuss',
      sheetId: 754461975, // gid параметр
      description: 'Лог рассылок 2CLM Lite'
    }
  },

  // ===== ФИЛЬТРЫ ДАННЫХ =====
  filters: {
    // Уровень 1: Фильтр по источнику кампаний
    campaignSource: {
      enabled: true,
      fieldName: 'Название таблицы (Источник)',
      allowedValues: ['Delta Medical'], // Можно добавить другие компании
      description: 'Показывать только кампании от указанных источников'
    },
    
    // Уровень 2: Исключение пользователей
    excludeUsers: {
      enabled: true,
      fieldName: 'Специальность',
      excludeKeywords: ['не врач', 'неврач', 'не врач.', 'не врач!'],
      description: 'Исключить пользователей с определенными специальностями'
    },
    
    // Фильтр записей без данных кампаний
    requireCampaignData: {
      enabled: true,
      description: 'Показывать только записи с данными кампаний'
    }
  },

  // ===== КОЭФФИЦИЕНТЫ ДЛЯ РАСЧЕТА ПРОСМОТРЕННЫХ SMS =====
  smsMultipliers: {
    'Пимафуцин': 1.44,
    'Донормил': 4.6,
    'default': 1 // Для остальных типов контента
  },

  // ===== НАСТРОЙКИ ЦВЕТОВОЙ СХЕМЫ =====
  colors: {
    statistics: {
      pageViews: '#1976d2',      // Синий
      smsSent: '#00897b',        // Бирюзовый
      totalTime: '#9c27b0',      // Фиолетовый
      smsViewed: '#f57c00',      // Оранжевый
      avgViewPercent: {
        high: '#2e7d32',         // Зеленый (≥70%)
        medium: '#ed6c02',       // Оранжевый (≥50%)
        low: '#d32f2f'           // Красный (<50%)
      }
    }
  },

  // ===== ПОРОГИ ДЛЯ ЦВЕТОВЫХ ИНДИКАТОРОВ =====
  thresholds: {
    viewPercent: {
      high: 70,    // % просмотра для зеленого цвета
      medium: 50,  // % просмотра для оранжевого цвета
      // Ниже medium будет красный
    },
    coverage: {
      high: 70,    // Покрытие данных для зеленого
      medium: 40,  // Покрытие данных для оранжевого
    }
  }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Проверка, разрешен ли источник кампании
export const isAllowedCampaignSource = (source) => {
  if (!config.filters.campaignSource.enabled) return true;
  const trimmedSource = (source || '').trim();
  return config.filters.campaignSource.allowedValues.includes(trimmedSource);
};

// Проверка, должен ли пользователь быть исключен
export const shouldExcludeUser = (specialty) => {
  if (!config.filters.excludeUsers.enabled) return false;
  const lowerSpecialty = (specialty || '').toLowerCase().trim();
  return config.filters.excludeUsers.excludeKeywords.some(keyword => 
    lowerSpecialty.includes(keyword)
  );
};

// Получение коэффициента для типа контента
export const getSmsMultiplier = (contentType) => {
  return config.smsMultipliers[contentType] || config.smsMultipliers.default;
};

// Получение цвета для процента просмотра
export const getViewPercentColor = (percent) => {
  if (percent >= config.thresholds.viewPercent.high) {
    return config.colors.statistics.avgViewPercent.high;
  } else if (percent >= config.thresholds.viewPercent.medium) {
    return config.colors.statistics.avgViewPercent.medium;
  } else {
    return config.colors.statistics.avgViewPercent.low;
  }
};

// Получение цвета для покрытия данных
export const getCoverageColor = (percent) => {
  if (percent >= config.thresholds.coverage.high) return 'success';
  if (percent >= config.thresholds.coverage.medium) return 'warning';
  return 'error';
};

export default config;
