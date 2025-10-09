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
import AIBrainIcon from './AIBrainIcon';

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

const AIConsultant = ({ data, contentType, campaignsData, clientsData }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="AI консультант"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 80,
          height: 80,
          background: '#6474ff',
          border: '2px solid rgba(100, 116, 255, 0.3)',
          animation: `${pulse} 3s ease-in-out infinite`,
          '&:hover': {
            background: '#7d8aff',
            transform: 'scale(1.1)',
            boxShadow: '0 0 50px rgba(100, 116, 255, 0.8), 0 8px 40px rgba(0, 0, 0, 0.5)',
            animation: 'none'
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 0 35px rgba(100, 116, 255, 0.5), 0 8px 30px rgba(0, 0, 0, 0.4)',
          zIndex: 1000
        }}
      >
        <AIBrainIcon size={64} />
      </Fab>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '70vh',
            maxHeight: '90vh',
            background: '#151933',
            border: '1px solid rgba(100, 116, 255, 0.2)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: '#1a1f3a',
            borderBottom: '1px solid rgba(100, 116, 255, 0.2)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2.5,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: '#6474ff',
              boxShadow: '0 0 12px rgba(100, 116, 255, 0.6)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon sx={{ color: '#6474ff', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              ИИ Консультант - Маркетинговый анализ
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                background: 'rgba(100, 116, 255, 0.15)',
                color: '#ffffff'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, background: '#0f1429' }}>
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
              <PsychologyIcon sx={{ fontSize: 80, color: '#6474ff', mb: 3, filter: 'drop-shadow(0 0 20px rgba(100, 116, 255, 0.5))' }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#ffffff' }}>
                Готов проанализировать данные кампании "{contentType}"
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.6)', maxWidth: '400px' }}>
                Нажмите кнопку ниже, чтобы получить подробный анализ и рекомендации от ИИ
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={analyzeData}
                sx={{
                  background: '#6474ff',
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  border: '1px solid rgba(100, 116, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(100, 116, 255, 0.4)',
                  '&:hover': {
                    background: '#7d8aff',
                    boxShadow: '0 0 30px rgba(100, 116, 255, 0.6), 0 4px 20px rgba(0, 0, 0, 0.3)',
                    transform: 'translateY(-2px)'
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
                  color: '#6474ff',
                  filter: 'drop-shadow(0 0 10px rgba(100, 116, 255, 0.5))'
                }} 
              />
              <Typography variant="h6" sx={{ mb: 1, color: '#ffffff', fontWeight: 600 }}>
                Анализирую данные...
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
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
                background: '#1a1f3a',
                border: '1px solid rgba(100, 116, 255, 0.15)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                '& h1': { 
                  fontSize: '1.75rem', 
                  fontWeight: 700, 
                  mt: 3, 
                  mb: 2,
                  color: '#ffffff',
                  borderBottom: '2px solid rgba(100, 116, 255, 0.3)',
                  paddingBottom: '8px'
                },
                '& h2': { 
                  fontSize: '1.4rem', 
                  fontWeight: 600, 
                  mt: 3, 
                  mb: 1.5,
                  color: '#ffffff'
                },
                '& h3': { 
                  fontSize: '1.15rem', 
                  fontWeight: 600, 
                  mt: 2, 
                  mb: 1,
                  color: 'rgba(255, 255, 255, 0.95)'
                },
                '& p': { 
                  mb: 1.5, 
                  lineHeight: 1.8,
                  color: 'rgba(255, 255, 255, 0.85)'
                },
                '& ul, & ol': { 
                  pl: 3, 
                  mb: 2,
                  color: 'rgba(255, 255, 255, 0.85)'
                },
                '& li': { 
                  mb: 0.8,
                  color: 'rgba(255, 255, 255, 0.85)'
                },
                '& strong': { 
                  fontWeight: 700,
                  color: '#6474ff'
                },
                '& code': {
                  background: 'rgba(100, 116, 255, 0.15)',
                  color: '#00d9ff',
                  padding: '3px 8px',
                  borderRadius: 1,
                  fontSize: '0.9em',
                  border: '1px solid rgba(100, 116, 255, 0.2)'
                }
              }}
            >
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 2.5, 
          borderTop: '1px solid rgba(100, 116, 255, 0.2)',
          background: '#151933',
          gap: 1.5
        }}>
          {analysis && (
            <>
              <Button
                startIcon={<DescriptionIcon />}
                onClick={exportToWord}
                disabled={exporting}
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'rgba(0, 217, 255, 0.4)',
                  color: '#00d9ff',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#00d9ff',
                    background: 'rgba(0, 217, 255, 0.1)',
                    boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)'
                  }
                }}
              >
                Сохранить как Word
              </Button>
              <Button
                startIcon={<PictureAsPdfIcon />}
                onClick={exportToPDF}
                disabled={exporting}
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'rgba(255, 107, 157, 0.4)',
                  color: '#ff6b9d',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ff6b9d',
                    background: 'rgba(255, 107, 157, 0.1)',
                    boxShadow: '0 0 15px rgba(255, 107, 157, 0.3)'
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
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(100, 116, 255, 0.1)'
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
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(100, 116, 255, 0.1)',
                color: '#ffffff'
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

