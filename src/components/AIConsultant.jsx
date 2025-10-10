import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Fab
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { keyframes } from '@mui/system';

const PROXY_URL = 'https://happydoomguy.pythonanywhere.com/gemini/models/gemini-2.5-flash-lite:generateContent';

// Анимация вращения
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const materialize = keyframes`
  0% {
    opacity: 0;
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
  }
`;

const buttonScale = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -50%) scale(1.08) rotate(0deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(0.98) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(0, 122, 255, 0.3),
      0 0 40px rgba(0, 122, 255, 0.15),
      0 8px 32px rgba(0, 122, 255, 0.2);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(0, 122, 255, 0.5),
      0 0 60px rgba(0, 122, 255, 0.25),
      0 8px 32px rgba(0, 122, 255, 0.3);
  }
`;

const energyWave = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
  15% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.4;
  }
  85% {
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
`;

const hologramShift = keyframes`
  0% {
    transform: translateX(0) translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 0.5;
  }
  30% {
    transform: translateX(0.5px) translateY(-0.5px);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-0.5px) translateY(0.5px);
    opacity: 0.5;
  }
  70% {
    transform: translateX(0.5px) translateY(0.5px);
    opacity: 0.6;
  }
  100% {
    transform: translateX(0) translateY(0);
    opacity: 0.5;
  }
`;

const dialogAppear = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
    filter: blur(8px);
  }
  60% {
    transform: scale(1.02);
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: blur(0px);
  }
`;

const backdropFade = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const iconFloat = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-2px) rotate(2deg);
  }
`;

// Цифровая волна анализа
const digitalWave = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
`;

const dataAnalysis = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  20% {
    opacity: 1;
    transform: translateX(0);
  }
  80% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(50px);
  }
`;

const numberScroll = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
`;

const rippleExpand = keyframes`
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
  }
  100% {
    width: 200%;
    height: 200%;
    opacity: 0;
  }
`;

const progressBar = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    opacity: 0.6;
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
    opacity: 1;
  }
`;

const AIConsultant = ({ data, contentType, campaignsData, clientsData }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const exportToPDF = async () => {
    if (!analysis || !contentRef.current) return;
    
    setExporting(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 277; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Анализ_${contentType}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError(`Ошибка при экспорте в PDF: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const exportToWord = async () => {
    if (!analysis) return;
    
    setExporting(true);
    try {
      // Convert markdown to HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #333; font-size: 24px; margin-top: 20px; }
            h2 { color: #555; font-size: 20px; margin-top: 16px; }
            h3 { color: #666; font-size: 16px; margin-top: 12px; }
            p { margin: 10px 0; }
            ul, ol { margin: 10px 0; padding-left: 30px; }
            li { margin: 5px 0; }
            strong { font-weight: bold; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>Маркетинговый анализ - ${contentType}</h1>
          <p><strong>Дата создания:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          <hr/>
          ${analysis.replace(/\n/g, '<br/>')}
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { 
        type: 'application/msword' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Анализ_${contentType}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting to Word:', err);
      setError(`Ошибка при экспорте в Word: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const prepareDataForAnalysis = () => {
    // Функция для парсинга дат (та же, что в App.jsx)
    const parseDate = (dateString) => {
      if (!dateString) return null;
      
      const cleanDate = String(dateString).trim();
      let date = null;
      let match = null;
      
      // Format 1: DD.MM.YYYY HH:MM:SS (Russian format with time)
      match = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
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
        date = new Date(dateString);
      }
      
      // If still invalid, return null
      return (!date || isNaN(date.getTime())) ? null : date;
    };

    // Общая статистика
    const totalRecords = data.length;
    const totalTime = data.reduce((sum, item) => sum + (item.timeSec || 0), 0);
    const avgTime = totalRecords > 0 ? (totalTime / totalRecords).toFixed(2) : 0;
    
    const viewPercents = data.map(item => item.viewPercent || 0).filter(p => p > 0);
    const avgViewPercent = viewPercents.length > 0 
      ? (viewPercents.reduce((sum, p) => sum + p, 0) / viewPercents.length).toFixed(2) 
      : 0;

    // Статистика по кампаниям
    const campaignsStats = campaignsData.map(c => ({
      name: c.campaignName,
      date: c.latestDate,
      smsSent: c.smsSent,
      smsViewed: c.smsViewed,
      pageViews: c.pageViews,
      conversionRate: ((c.pageViews / c.smsSent) * 100).toFixed(2)
    }));

    // Топ-5 активных клиентов
    const topClients = clientsData
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, 5)
      .map(c => ({
        name: c.userName,
        specialty: c.specialty,
        workplace: c.workplace,
        pageViews: c.pageViews,
        totalTime: c.totalTimeFormatted
      }));

    // Распределение по специальностям
    const specialtyDistribution = {};
    clientsData.forEach(client => {
      const specialty = client.specialty || 'Не указано';
      specialtyDistribution[specialty] = (specialtyDistribution[specialty] || 0) + 1;
    });

    // Динамика просмотров по дням (с валидацией дат)
    const dailyViews = {};
    data.forEach(item => {
      if (!item.date) return;
      
      // Используем нашу функцию парсинга
      const dateObj = parseDate(item.date);
      
      // Проверяем валидность
      if (dateObj) {
        const formattedDate = dateObj.toLocaleDateString('ru-RU');
        dailyViews[formattedDate] = (dailyViews[formattedDate] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(dailyViews).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('.').map(Number);
      const [dayB, monthB, yearB] = b.split('.').map(Number);
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });

    const viewsDynamics = sortedDates.map(date => ({
      date,
      views: dailyViews[date]
    }));
    
    // Добавляем статистику по дням недели
    const dayOfWeekStats = { 'Пн': 0, 'Вт': 0, 'Ср': 0, 'Чт': 0, 'Пт': 0, 'Сб': 0, 'Вс': 0 };
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    data.forEach(item => {
      if (!item.date) return;
      const dateObj = parseDate(item.date);
      if (dateObj) {
        const dayName = dayNames[dateObj.getDay()];
        dayOfWeekStats[dayName] = (dayOfWeekStats[dayName] || 0) + 1;
      }
    });
    
    // Добавляем статистику по часам
    const hourlyStats = {};
    data.forEach(item => {
      if (!item.date) return;
      const dateObj = parseDate(item.date);
      if (dateObj) {
        const hour = dateObj.getHours();
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      }
    });

    return {
      contentType,
      totalRecords,
      totalTime: `${Math.floor(totalTime / 3600)}ч ${Math.floor((totalTime % 3600) / 60)}м`,
      avgTime: `${Math.floor(avgTime / 60)}м ${Math.floor(avgTime % 60)}с`,
      avgViewPercent: `${avgViewPercent}%`,
      campaigns: campaignsStats,
      topClients,
      specialtyDistribution,
      viewsDynamics,
      dayOfWeekStats,
      hourlyStats,
      dateRange: {
        first: sortedDates[0] || 'Нет данных',
        last: sortedDates[sortedDates.length - 1] || 'Нет данных',
        totalDays: sortedDates.length
      },
      // Фильтруем данные за последние 30 дней
      recentRecords: (() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        return data
          .filter(item => {
            if (!item.date) return false;
            const itemDate = new Date(item.date);
            return !isNaN(itemDate.getTime()) && itemDate >= thirtyDaysAgo;
          })
          .map(item => ({
            date: item.date,
            campaignName: item.campaignName,
            userName: item.userName,
            specialty: item.specialty,
            workplace: item.workplace,
            district: item.district,
            timeSec: item.timeSec,
            viewPercent: item.viewPercent,
            videoName: item.videoName
          }));
      })()
    };
  };

  const analyzeData = async () => {
    // Запускаем эффект цифровой пикселизации
    setScanning(true);
    
    // Ждем 3 секунды для эффекта сканирования
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setScanning(false);
    setLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const dataForAnalysis = prepareDataForAnalysis();

      const prompt = `Ты — опытный маркетинговый аналитик фармацевтической индустрии. Проанализируй данные SMS-кампании для препарата "${dataForAnalysis.contentType}" и дай подробные рекомендации.

**ВАЖНО:** 
- НЕ указывай дату анализа от себя, используй ТОЛЬКО даты из предоставленных данных
- НЕ используй таблицы в своем ответе (они плохо отображаются)
- Все данные представляй в виде структурированных списков с маркерами или номерами
- Используй форматирование: жирный текст, заголовки, списки, но БЕЗ таблиц

**ДАННЫЕ ДЛЯ АНАЛИЗА:**

**Общая статистика:**
- Период данных: ${dataForAnalysis.dateRange.first} - ${dataForAnalysis.dateRange.last}
- Всего записей просмотров: ${dataForAnalysis.totalRecords}
- Общее время просмотра: ${dataForAnalysis.totalTime}
- Среднее время просмотра: ${dataForAnalysis.avgTime}
- Средний процент просмотра видео: ${dataForAnalysis.avgViewPercent}

**Статистика по кампаниям:**
${dataForAnalysis.campaigns.map(c => 
  `- ${c.name} (${c.date}): Отправлено ${c.smsSent} SMS, просмотрено ${c.smsViewed} SMS, ${c.pageViews} просмотров страниц, конверсия ${c.conversionRate}%`
).join('\n')}

**Топ-5 активных клиентов:**
${dataForAnalysis.topClients.map((c, i) => 
  `${i + 1}. ${c.name} (${c.specialty}, ${c.workplace}): ${c.pageViews} просмотров, время: ${c.totalTime}`
).join('\n')}

**Распределение по специальностям:**
${Object.entries(dataForAnalysis.specialtyDistribution)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([specialty, count]) => `- ${specialty}: ${count} клиентов`)
  .join('\n')}

**Динамика просмотров по дням (все ${dataForAnalysis.dateRange.totalDays} дней):**
${dataForAnalysis.viewsDynamics.map(d => `- ${d.date}: ${d.views} просмотров`).join('\n')}

**Статистика по дням недели:**
${Object.entries(dataForAnalysis.dayOfWeekStats).map(([day, count]) => `- ${day}: ${count} просмотров`).join('\n')}

**Статистика по часам (топ-10 активных часов):**
${Object.entries(dataForAnalysis.hourlyStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([hour, count]) => `- ${hour}:00 - ${count} просмотров`)
  .join('\n')}

**ПОЛНЫЙ НАБОР ДАННЫХ (все ${dataForAnalysis.totalRecords} записей в формате JSON):**

\`\`\`json
${JSON.stringify(dataForAnalysis.allRecords, null, 2)}
\`\`\`

Анализируй ВСЕ эти записи для получения полной картины.

**ЗАДАНИЕ:**
Проанализируй эти данные и предоставь:

1. **Общий анализ эффективности кампании** (2-3 абзаца):
   - Оценка общей эффективности SMS-кампаний
   - Ключевые показатели (конверсия, вовлеченность, время просмотра)
   - Тренды и паттерны в данных

2. **Анализ по кампаниям** (в виде списка):
   - Для каждой кампании предоставь структурированную информацию в формате:
     * **Название кампании** (дата)
     * Отправлено: [число] SMS
     * Просмотрено: [число] SMS
     * Просмотров страниц: [число]
     * Конверсия: [%]
   - Какие кампании показали лучшие результаты и почему
   - Какие кампании требуют оптимизации
   - Сравнение эффективности разных волн рассылок

3. **Анализ аудитории**:
   - Какие специальности наиболее активны
   - Характеристики наиболее вовлеченных клиентов
   - Потенциальные сегменты для таргетинга

4. **Временной анализ** (используй ВСЕ предоставленные данные):
   - Динамика вовлеченности по дням (анализируй все ${dataForAnalysis.dateRange.totalDays} дней)
   - Анализ по дням недели (какие дни наиболее активны)
   - Анализ по часам (оптимальное время для рассылок)
   - Тренды роста/снижения активности
   - Выявление пиковых периодов активности

5. **Конкретные маркетинговые рекомендации** (минимум 5):
   - Как улучшить конверсию
   - Какие сегменты аудитории развивать
   - Оптимизация контента и таймингов
   - Персонализация подхода
   - Метрики для отслеживания

6. **План действий на следующий месяц**:
   - Приоритетные задачи
   - Ожидаемые результаты

Ответ должен быть структурированным, использовать маркдаун, содержать конкретные цифры из данных и быть практически применимым.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      };

      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const analysisText = result.candidates[0].content.parts[0].text;
        setAnalysis(analysisText);
      } else {
        throw new Error('Неверный формат ответа от API');
      }
    } catch (err) {
      console.error('Error analyzing data:', err);
      setError(`Ошибка при анализе данных: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Digital Wave Analysis - Behind Modal */}
      {scanning && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 122, 255, 0.02) 50%, rgba(0, 0, 0, 0) 100%)'
          }}
        >
          {/* Main Digital Wave */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '300px',
              background: `linear-gradient(180deg,
                transparent 0%,
                rgba(0, 255, 255, 0.05) 20%,
                rgba(0, 255, 255, 0.15) 40%,
                rgba(0, 255, 255, 0.2) 50%,
                rgba(0, 255, 255, 0.15) 60%,
                rgba(0, 255, 255, 0.05) 80%,
                transparent 100%
              )`,
              animation: `${digitalWave} 3s cubic-bezier(0.4, 0, 0.2, 1)`,
              boxShadow: 'inset 0 0 100px rgba(0, 255, 255, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00FFFF 50%, transparent)',
                boxShadow: '0 0 30px rgba(0, 255, 255, 1)',
                transform: 'translateY(-50%)'
              }
            }}
          />
          
          {/* Data Analysis Indicators - Left Side */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={`left-data-${i}`}
              sx={{
                position: 'absolute',
                left: '5%',
                top: `${15 + i * 10}%`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                animation: `${dataAnalysis} ${2 + i * 0.2}s ease-out`,
                animationDelay: `${i * 0.3}s`
              }}
            >
              <Box
                sx={{
                  width: `${80 + Math.random() * 120}px`,
                  height: '2px',
                  background: 'linear-gradient(90deg, #00FFFF, transparent)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                }}
              />
              <Box
                sx={{
                  width: '8px',
                  height: '8px',
                  background: '#00FFFF',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 1)',
                  animation: `${pulseGlow} 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            </Box>
          ))}
          
          {/* Data Analysis Indicators - Right Side */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={`right-data-${i}`}
              sx={{
                position: 'absolute',
                right: '5%',
                top: `${20 + i * 10}%`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexDirection: 'row-reverse',
                animation: `${dataAnalysis} ${2.2 + i * 0.2}s ease-out`,
                animationDelay: `${i * 0.3 + 0.2}s`
              }}
            >
              <Box
                sx={{
                  width: `${80 + Math.random() * 120}px`,
                  height: '2px',
                  background: 'linear-gradient(270deg, #00FFFF, transparent)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
                }}
              />
              <Box
                sx={{
                  width: '8px',
                  height: '8px',
                  background: '#00FFFF',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 1)',
                  animation: `${pulseGlow} 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1 + 0.2}s`
                }}
              />
            </Box>
          ))}
          
          {/* Scrolling Numbers/Data */}
          {[...Array(40)].map((_, i) => {
            const numbers = ['01', '10', '11', '00', 'FF', 'A3', 'B7', 'C4', '3D', '9E'];
            const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
            const leftPos = Math.random() * 100;
            const delay = Math.random() * 2;
            
            return (
              <Box
                key={`number-${i}`}
                sx={{
                  position: 'absolute',
                  left: `${leftPos}%`,
                  top: '50%',
                  color: 'rgba(0, 255, 255, 0.8)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  animation: `${numberScroll} ${1.5 + Math.random()}s ease-in-out`,
                  animationDelay: `${delay}s`,
                  textShadow: '0 0 10px rgba(0, 255, 255, 1)',
                  userSelect: 'none'
                }}
              >
                {randomNum}
              </Box>
            );
          })}
          
          {/* Progress Bar - Bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '3px',
              background: 'rgba(0, 122, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                background: 'linear-gradient(90deg, #007AFF, #00FFFF)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                animation: `${progressBar} 3s cubic-bezier(0.4, 0, 0.2, 1)`
              }
            }}
          />
          
          {/* Ripple Effect from Center */}
          {[0, 1, 2].map((i) => (
            <Box
              key={`ripple-${i}`}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid rgba(0, 255, 255, 0.4)',
                borderRadius: '50%',
                animation: `${rippleExpand} ${2.5 + i * 0.5}s ease-out`,
                animationDelay: `${i * 0.8}s`,
                pointerEvents: 'none'
              }}
            />
          ))}
        </Box>
      )}

      {/* Floating Action Button with Energy Field */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 140,
          height: 140,
          zIndex: 1000,
          pointerEvents: 'none',
          animation: `${materialize} 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards`
        }}
      >
        {/* Energy waves */}
        {[0, 1, 2].map((i) => (
          <Box
            key={`wave-${i}`}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              border: '1.5px solid rgba(0, 122, 255, 0.4)',
              borderRadius: '50%',
              animation: `${energyWave} ${3.5 + i * 0.5}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 1.2 + 0.8}s`,
              pointerEvents: 'none'
            }}
          />
        ))}
        
        {/* Hologram scan lines */}
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={`scan-${i}`}
            sx={{
              position: 'absolute',
              top: `${35 + i * 15}%`,
              left: '15%',
              width: '70%',
              height: '0.5px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.4), transparent)',
              animation: `${hologramShift} ${2.5 + i * 0.3}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 0.2 + 0.8}s`,
              pointerEvents: 'none'
            }}
          />
        ))}
        

        <Fab
          color="primary"
          aria-label="AI консультант"
          onClick={handleOpen}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            pointerEvents: 'auto',
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            border: '3px solid rgba(255, 255, 255, 0.95)',
            animation: `${buttonScale} 1.6s cubic-bezier(0.34, 1.2, 0.64, 1) 0.6s backwards, ${glowPulse} 4s cubic-bezier(0.4, 0, 0.6, 1) 2s infinite`,
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              transition: 'left 0.6s ease',
              zIndex: 2
            },
            '&:hover': {
              background: 'linear-gradient(135deg, #0051D5 0%, #003DA5 100%)',
              transform: 'translate(-50%, -50%) scale(1.1)',
              '&::before': {
                left: '100%'
              }
            },
            '&:active': {
              transform: 'translate(-50%, -50%) scale(1.05)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <PsychologyIcon 
            sx={{ 
              fontSize: 56, 
              color: '#ffffff',
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
              animation: `${iconFloat} 3s cubic-bezier(0.4, 0, 0.6, 1) 2s infinite`,
              position: 'relative',
              zIndex: 3
            }} 
          />
        </Fab>
      </Box>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          timeout: 500
        }}
        sx={{
          '& .MuiBackdrop-root': {
            animation: open ? `${backdropFade} 0.6s ease-out` : 'none',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(6px)'
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '70vh',
            maxHeight: '90vh',
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            animation: open ? `${dialogAppear} 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)` : 'none',
            transformOrigin: 'bottom right'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: '#ffffff',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            color: '#1d1d1f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2.5,
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#007AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AutoAwesomeIcon sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: -0.3 }}>
              ИИ Консультант
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: '#86868b',
              '&:hover': {
                background: 'rgba(0, 122, 255, 0.08)',
                color: '#1d1d1f'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, background: '#f5f5f7' }}>
          {!analysis && !loading && !error && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center'
              }}
            >
              <PsychologyIcon sx={{ fontSize: 80, color: '#6474ff', mb: 3, filter: 'drop-shadow(0 4px 20px rgba(100, 116, 255, 0.3))' }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 800, color: '#1a2332' }}>
                Готов проанализировать данные кампании "{contentType}"
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: '#6b7280', maxWidth: '400px', lineHeight: 1.6 }}>
                Нажмите кнопку ниже, чтобы получить подробный анализ и рекомендации от ИИ
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={analyzeData}
                sx={{
                  background: 'linear-gradient(135deg, #6474ff 0%, #8b95ff 100%)',
                  px: 5,
                  py: 1.8,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 32px rgba(100, 116, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5060e0 0%, #7a84ff 100%)',
                    boxShadow: '0 12px 48px rgba(100, 116, 255, 0.4)',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Начать анализ
              </Button>
            </Box>
          )}

          {loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
              }}
            >
              <CircularProgress 
                size={60} 
                sx={{ 
                  mb: 3,
                  color: '#6474ff'
                }} 
              />
              <Typography variant="h6" sx={{ mb: 1, color: '#1a2332', fontWeight: 700 }}>
                Анализирую данные...
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                ИИ консультант обрабатывает информацию о кампании
              </Typography>
            </Box>
          )}

          {error && (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: '#ef4444', fontWeight: 600 }}>
                Ошибка
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{error}</Typography>
              <Button
                variant="outlined"
                onClick={analyzeData}
                sx={{ 
                  mt: 2,
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#dc2626',
                    background: 'rgba(239, 68, 68, 0.1)'
                  }
                }}
              >
                Попробовать снова
              </Button>
            </Paper>
          )}

          {analysis && (
            <Paper
              ref={contentRef}
              sx={{
                p: 4,
                background: '#ffffff',
                border: '0.5px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                '& h1': { 
                  fontSize: '1.75rem', 
                  fontWeight: 700, 
                  mt: 3, 
                  mb: 2,
                  color: '#1d1d1f',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  paddingBottom: '12px'
                },
                '& h2': { 
                  fontSize: '1.375rem', 
                  fontWeight: 600, 
                  mt: 3, 
                  mb: 1.5,
                  color: '#1d1d1f'
                },
                '& h3': { 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  mt: 2, 
                  mb: 1,
                  color: '#1d1d1f'
                },
                '& p': { 
                  mb: 1.5, 
                  lineHeight: 1.7,
                  color: '#1d1d1f',
                  fontSize: '0.9375rem'
                },
                '& ul, & ol': { 
                  pl: 3, 
                  mb: 2,
                  color: '#1d1d1f'
                },
                '& li': { 
                  mb: 0.8,
                  color: '#1d1d1f'
                },
                '& strong': { 
                  fontWeight: 600,
                  color: '#007AFF'
                },
                '& code': {
                  background: '#f5f5f7',
                  color: '#1d1d1f',
                  padding: '3px 8px',
                  borderRadius: 1,
                  fontSize: '0.9em',
                  border: '0.5px solid rgba(0, 0, 0, 0.1)',
                  fontFamily: 'SF Mono, Monaco, monospace',
                  fontWeight: 500
                }
              }}
            >
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          background: '#ffffff',
          gap: 1.5
        }}>
          {analysis && (
            <>
              <Button
                startIcon={<DescriptionIcon />}
                onClick={exportToWord}
                disabled={exporting}
                sx={{ 
                  textTransform: 'none',
                  color: '#007AFF',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 0.08)'
                  }
                }}
              >
                Сохранить как Word
              </Button>
              <Button
                startIcon={<PictureAsPdfIcon />}
                onClick={exportToPDF}
                disabled={exporting}
                sx={{ 
                  textTransform: 'none',
                  color: '#007AFF',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 0.08)'
                  }
                }}
              >
                Сохранить как PDF
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                startIcon={<AutoAwesomeIcon />}
                onClick={analyzeData}
                disabled={loading || exporting}
                sx={{ 
                  textTransform: 'none',
                  color: '#007AFF',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 0.08)'
                  }
                }}
              >
                Повторить анализ
              </Button>
            </>
          )}
          <Button 
            onClick={handleClose} 
            sx={{ 
              textTransform: 'none',
              color: '#86868b',
              fontWeight: 500,
              '&:hover': {
                background: 'rgba(0, 122, 255, 0.08)',
                color: '#1d1d1f'
              }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIConsultant;

