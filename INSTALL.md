# Инструкция по установке и запуску SMS Dashboard

## Быстрый старт

### 1. Установка зависимостей

```bash
cd "/Users/Arasaka/SMS Dashboard"
npm install
```

### 2. Настройка Google Sheets API (опционально)

Для работы с реальными данными из Google Sheets:

1. Создайте файл `.env`:
```bash
cp env.example .env
```

2. Получите API ключ Google Sheets:
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте новый проект или выберите существующий
   - Включите Google Sheets API
   - Создайте API ключ
   - Скопируйте ключ в файл `.env`

3. Отредактируйте `.env`:
```
GOOGLE_SHEETS_API_KEY=ваш_api_ключ_здесь
GOOGLE_SHEETS_SPREADSHEET_ID=1iIm0hx5bDEqvd3kpJBBbv_FgdpI6qxM-0pDGvl6bWJY
```

### 3. Запуск приложения

#### Вариант 1: Запуск с реальными данными (если настроен API)
```bash
# Терминал 1 - Backend сервер
npm start

# Терминал 2 - Frontend приложение
npm run dev
```

#### Вариант 2: Запуск только Frontend (с демо данными)
```bash
npm run dev
```

### 4. Открытие в браузере

Откройте [http://localhost:3000](http://localhost:3000) в браузере

## Структура проекта

```
SMS Dashboard/
├── src/
│   ├── App.jsx              # Основной компонент
│   ├── main.jsx             # Точка входа
│   ├── index.css            # Стили
│   └── services/
│       └── api.js           # API сервисы
├── server.js                # Backend сервер
├── package.json             # Зависимости
├── vite.config.js           # Конфигурация Vite
└── README.md               # Документация
```

## Функциональность

- ✅ Отображение данных по типам контента (Пимафуцин, Донормил)
- ✅ Полный лог просмотров в табличном виде
- ✅ Визуализация процента просмотра
- ✅ Фильтрация по типам контента
- ✅ Сортировка и пагинация
- ✅ Обновление данных в реальном времени
- ✅ Адаптивный дизайн

## Устранение неполадок

### Ошибка "Failed to fetch data"
- Проверьте, что Google Sheets API включен
- Убедитесь, что API ключ корректный
- Проверьте, что таблица доступна публично или настроены права доступа

### Порт занят
```bash
# Измените порт в package.json или .env
PORT=3002 npm start
```

### Проблемы с зависимостями
```bash
rm -rf node_modules package-lock.json
npm install
```
