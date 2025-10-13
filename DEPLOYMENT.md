# 🚀 Руководство по развертыванию SMS Dashboard

## 📦 Подготовка к деплою

### 1. Build проекта
```bash
npm run build
```

Создается папка `dist/` с готовыми файлами:
- `index.html` - главная страница
- `assets/` - CSS, JS, изображения
- Оптимизированный и минифицированный код

---

## 🌐 Варианты хостинга

### Вариант 1: Vercel (Рекомендуется) ⚡

**Преимущества:**
- ✅ Бесплатный план
- ✅ Автоматический деплой из GitHub
- ✅ SSL сертификат
- ✅ CDN по всему миру
- ✅ Мгновенный деплой

**Инструкция:**
1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Выберите проект: `SMS-Dashboard-Demo`
4. Настройки:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Нажмите "Deploy"

**Готово!** Vercel автоматически деплоит при каждом push в main.

---

### Вариант 2: Netlify 🎯

**Преимущества:**
- ✅ Бесплатный план
- ✅ Автоматический деплой
- ✅ SSL сертификат
- ✅ Drag & drop деплой

**Инструкция:**
1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. New site from Git → GitHub
3. Выберите репозиторий
4. Настройки:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy site

**Или Drag & Drop:**
1. Перетащите папку `dist/` на netlify.com
2. Готово!

---

### Вариант 3: GitHub Pages 📄

**Преимущества:**
- ✅ Бесплатный
- ✅ Интеграция с GitHub
- ✅ Простой деплой

**Инструкция:**

1. Установите gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Добавьте в `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/SMS-Dashboard-Demo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Деплой:
```bash
npm run deploy
```

4. Включите GitHub Pages в настройках репозитория:
   - Settings → Pages → Source: gh-pages branch

---

### Вариант 4: Обычный хостинг (cPanel, Apache, Nginx) 🖥️

**Инструкция:**

1. **Build проекта:**
```bash
npm run build
```

2. **Загрузите содержимое папки `dist/`** на хостинг:
   - Через FTP/SFTP
   - Через панель управления хостингом
   - Через SSH

3. **Структура на сервере:**
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [другие файлы]
├── logo.png
└── .htaccess (для Apache)
```

4. **Настройка .htaccess** (для Apache):
   - Файл `.htaccess` уже создан в корне проекта
   - Скопируйте его в папку `dist/` перед загрузкой
   - Или используйте команду ниже

**Копирование .htaccess в dist:**
```bash
cp .htaccess dist/.htaccess
```

---

### Вариант 5: VPS/VDS (Ubuntu, Nginx) 🐧

**Инструкция:**

1. **Подключитесь к серверу:**
```bash
ssh user@your-server.com
```

2. **Установите Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

3. **Загрузите файлы:**
```bash
# Локально
scp -r dist/* user@your-server.com:/var/www/sms-dashboard/
```

4. **Настройте Nginx:**
```bash
sudo nano /etc/nginx/sites-available/sms-dashboard
```

Содержимое:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/sms-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Сжатие
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 6;
}
```

5. **Активируйте конфиг:**
```bash
sudo ln -s /etc/nginx/sites-available/sms-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **SSL (опционально):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Настройка перед деплоем

### Проверьте настройки в `src/config.js`:

```javascript
export const config = {
  company: {
    name: 'Delta Medical',
    displayName: 'SMS Dashboard - Delta Medical',
  },
  
  dataSources: {
    smsData: {
      spreadsheetId: 'YOUR_SPREADSHEET_ID',
      // ...
    }
  }
}
```

### Убедитесь что Google Sheets публичны:
1. Откройте таблицу
2. Настройки доступа → "Доступ по ссылке"
3. "Читатель" для всех

---

## 📋 Чек-лист перед деплоем

- [ ] `npm run build` выполнен успешно
- [ ] Google Sheets ID настроены в `config.js`
- [ ] Таблицы имеют публичный доступ
- [ ] `.htaccess` скопирован в `dist/` (для Apache)
- [ ] `logo.png` находится в `public/`
- [ ] Проверена работа локально (`npm run dev`)

---

## 🎯 Быстрый деплой (Vercel - рекомендуется)

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Деплой
vercel

# 3. Production деплой
vercel --prod
```

---

## 📊 Размер build

```
dist/index.html                   0.71 kB
dist/assets/index-[hash].css      2.38 kB
dist/assets/index-[hash].js       2.39 MB (681 kB gzip)
```

**Общий размер:** ~2.4 MB (несжатый), ~690 kB (gzip)

---

## 🔍 Проверка после деплоя

1. **Откройте сайт** в браузере
2. **Проверьте загрузку данных** (должны подгружаться из Google Sheets)
3. **Протестируйте вкладки** (переключение между препаратами)
4. **Проверьте ИИ консультантов** (обе кнопки)
5. **Экспорт в Excel** (должен работать)
6. **Анимированный логотип** (при загрузке)

---

## 🛠️ Troubleshooting

### Проблема: "Не загружаются данные"
**Решение:** Проверьте публичный доступ к Google Sheets

### Проблема: "404 при обновлении страницы"
**Решение:** Настройте rewrite правила (.htaccess для Apache)

### Проблема: "Большой размер bundle"
**Решение:** Используйте code splitting (будущее улучшение)

### Проблема: "ИИ консультант не работает"
**Решение:** Проверьте доступ к API proxy на pythonanywhere.com

---

## 📞 Поддержка

- **GitHub:** https://github.com/HappyDoomGuy/SMS-Dashboard-Demo
- **Issues:** https://github.com/HappyDoomGuy/SMS-Dashboard-Demo/issues

---

**Дата обновления:** Октябрь 2024
**Версия:** 2.0

