# 🔑 Получение Google Sheets API ключа

## Быстрый способ (5 минут):

### 1. Перейдите в Google Cloud Console
Откройте: https://console.cloud.google.com/

### 2. Создайте проект
- Нажмите "Select a project" → "New Project"
- Назовите проект: "SMS Dashboard"
- Нажмите "Create"

### 3. Включите Google Sheets API
- В меню выберите "APIs & Services" → "Library"
- Найдите "Google Sheets API"
- Нажмите "Enable"

### 4. Создайте API ключ
- Перейдите "APIs & Services" → "Credentials"
- Нажмите "Create Credentials" → "API Key"
- Скопируйте созданный ключ

### 5. Обновите код
Откройте файл `src/services/api.js` и замените:
```javascript
const API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```
на ваш реальный ключ.

## Альтернативный способ (без API ключа):

Если таблица полностью публичная, можно попробовать прямой доступ через CSV:
https://docs.google.com/spreadsheets/d/1iIm0hx5bDEqvd3kpJBBbv_FgdpI6qxM-0pDGvl6bWJY/export?format=csv&gid=0
