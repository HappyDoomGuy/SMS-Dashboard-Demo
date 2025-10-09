import React, { useState } from 'react';
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
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

const PROXY_URL = 'https://happydoomguy.pythonanywhere.com/gemini/models/gemini-2.5-flash-lite:generateContent';

const AIConsultant = ({ data, contentType, campaignsData, clientsData }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
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
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          zIndex: 1000
        }}
      >
        <PsychologyIcon sx={{ fontSize: 32 }} />
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
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ИИ Консультант - Маркетинговый анализ
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
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
              <PsychologyIcon sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Готов проанализировать данные кампании "{contentType}"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Нажмите кнопку ниже, чтобы получить подробный анализ и рекомендации
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={analyzeData}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  }
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
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Анализирую данные...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ИИ консультант обрабатывает информацию о кампании
              </Typography>
            </Box>
          )}

          {error && (
            <Paper
              sx={{
                p: 3,
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                Ошибка
              </Typography>
              <Typography variant="body2">{error}</Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={analyzeData}
                sx={{ mt: 2 }}
              >
                Попробовать снова
              </Button>
            </Paper>
          )}

          {analysis && (
            <Paper
              sx={{
                p: 3,
                background: '#f8f9fa',
                borderRadius: 2,
                '& h1': { fontSize: '1.5rem', fontWeight: 700, mt: 2, mb: 1 },
                '& h2': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 1.5, mb: 0.5 },
                '& p': { mb: 1.5, lineHeight: 1.7 },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { mb: 0.5 },
                '& strong': { fontWeight: 700 },
                '& code': {
                  background: '#e9ecef',
                  padding: '2px 6px',
                  borderRadius: 1,
                  fontSize: '0.9em'
                }
              }}
            >
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #e9ecef' }}>
          {analysis && (
            <Button
              startIcon={<AutoAwesomeIcon />}
              onClick={analyzeData}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Повторить анализ
            </Button>
          )}
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIConsultant;

