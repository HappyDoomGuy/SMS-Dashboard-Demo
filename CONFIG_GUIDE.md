# 📋 Руководство по конфигурации дашборда

## 🎯 Назначение

Файл `src/config.js` содержит все настройки дашборда для легкого тиражирования под разные компании.

## 🔧 Основные настройки

### 1. Настройки компании

```javascript
company: {
  name: 'Delta Medical',
  displayName: 'SMS Dashboard - Delta Medical',
}
```

**Как изменить для другой компании:**
```javascript
company: {
  name: 'Bionorica',
  displayName: 'SMS Dashboard - Bionorica',
}
```

---

### 2. Источники данных (Google Sheets)

```javascript
dataSources: {
  smsData: {
    spreadsheetId: 'ваш-id-таблицы',
    sheetId: 0,
    description: 'Данные просмотров SMS рассылок'
  },
  // ...
}
```

**Как получить ID таблицы:**
```
URL: https://docs.google.com/spreadsheets/d/1iIm0hx5b.../edit?gid=0#gid=0
                                                    ↑           ↑
                                            spreadsheetId    sheetId
```

---

### 3. Фильтры данных

#### Уровень 1: Фильтр по источнику кампаний

```javascript
campaignSource: {
  enabled: true,
  fieldName: 'Название таблицы (Источник)',
  allowedValues: ['Delta Medical'],
  description: 'Показывать только кампании от указанных источников'
}
```

**Для добавления нескольких компаний:**
```javascript
allowedValues: ['Delta Medical', 'Bionorica', 'Bayer']
```

**Для отключения фильтра:**
```javascript
enabled: false
```

#### Уровень 2: Исключение пользователей

```javascript
excludeUsers: {
  enabled: true,
  fieldName: 'Специальность',
  excludeKeywords: ['не врач', 'неврач', 'не врач.', 'не врач!'],
  description: 'Исключить пользователей с определенными специальностями'
}
```

**Для добавления других исключений:**
```javascript
excludeKeywords: ['не врач', 'студент', 'администратор']
```

---

### 4. Коэффициенты для расчета просмотренных SMS

```javascript
smsMultipliers: {
  'Пимафуцин': 1.44,
  'Донормил': 4.6,
  'default': 1
}
```

**Для добавления нового препарата:**
```javascript
smsMultipliers: {
  'Пимафуцин': 1.44,
  'Донормил': 4.6,
  'Канефрон': 2.5,  // Новый препарат
  'default': 1
}
```

---

### 5. Цветовая схема

```javascript
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
}
```

**Для изменения цветов:**
- Используйте HEX коды цветов
- Можно использовать [Material-UI цвета](https://mui.com/material-ui/customization/color/)

---

### 6. Пороговые значения

```javascript
thresholds: {
  viewPercent: {
    high: 70,    // % для зеленого цвета
    medium: 50,  // % для оранжевого цвета
  },
  coverage: {
    high: 70,    // Покрытие для зеленого
    medium: 40,  // Покрытие для оранжевого
  }
}
```

---

## 🚀 Быстрое тиражирование для новой компании

### Шаг 1: Клонировать проект
```bash
git clone https://github.com/HappyDoomGuy/SMS-Dashboard-Demo.git
cd SMS-Dashboard-Demo
```

### Шаг 2: Отредактировать `src/config.js`

1. **Изменить название компании:**
```javascript
company: {
  name: 'Ваша Компания',
  displayName: 'SMS Dashboard - Ваша Компания',
}
```

2. **Указать ID ваших таблиц:**
```javascript
dataSources: {
  smsData: {
    spreadsheetId: 'ваш-id-таблицы-sms',
    // ...
  },
  // ...
}
```

3. **Настроить фильтры:**
```javascript
campaignSource: {
  allowedValues: ['Ваша Компания']
}
```

### Шаг 3: Запустить дашборд
```bash
npm install
npm run dev
```

---

## 📊 Примеры настройки для разных компаний

### Bionorica
```javascript
company: {
  name: 'Bionorica',
  displayName: 'SMS Dashboard - Bionorica'
},
filters: {
  campaignSource: {
    allowedValues: ['Bionorica 2CLM']
  }
}
```

### Bayer
```javascript
company: {
  name: 'Bayer',
  displayName: 'SMS Dashboard - Bayer'
},
filters: {
  campaignSource: {
    allowedValues: ['Bayer']
  }
}
```

### Мультикомпания (несколько источников)
```javascript
company: {
  name: 'Multi-Company',
  displayName: 'SMS Dashboard - Все компании'
},
filters: {
  campaignSource: {
    allowedValues: ['Delta Medical', 'Bionorica', 'Bayer']
  }
}
```

---

## ⚙️ Дополнительные возможности

### Отключение фильтров

Для показа всех данных без фильтрации:

```javascript
filters: {
  campaignSource: {
    enabled: false,  // Показать все источники
  },
  excludeUsers: {
    enabled: false,  // Показать всех пользователей
  },
  requireCampaignData: {
    enabled: false,  // Показать даже без данных кампаний
  }
}
```

### Кастомные коэффициенты

Для разных подходов к расчету:

```javascript
smsMultipliers: {
  'Препарат A': 1.5,
  'Препарат B': 3.0,
  'Препарат C': 2.2,
  'default': 1
}
```

---

## 🎨 Брендинг

Все цвета, названия и настройки в одном файле позволяют:
- Легко адаптировать дашборд под корпоративные цвета
- Быстро создать версии для разных брендов
- Поддерживать несколько инстансов параллельно

---

## 📝 Checklist для нового развертывания

- [ ] Обновить `company.name` и `company.displayName`
- [ ] Указать ID всех трех Google таблиц
- [ ] Настроить `allowedValues` в фильтре источников
- [ ] Проверить коэффициенты SMS
- [ ] (Опционально) Изменить цветовую схему
- [ ] (Опционально) Настроить пороговые значения
- [ ] Запустить и протестировать

---

**Время развертывания для новой компании: ~5 минут** ⚡
