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

    // Динамика просмотров по дням
    const dailyViews = {};
    data.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('ru-RU');
      dailyViews[date] = (dailyViews[date] || 0) + 1;
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
      dateRange: {
        first: sortedDates[0],
        last: sortedDates[sortedDates.length - 1]
      }
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
- Все таблицы форматируй СТРОГО в Markdown с использованием символа | для разделения колонок
- Каждая таблица должна иметь строку с заголовками и строку с разделителями (---|---|---)

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

**Динамика просмотров по дням (последние 10 дней):**
${dataForAnalysis.viewsDynamics.slice(-10).map(d => `- ${d.date}: ${d.views} просмотров`).join('\n')}

**ЗАДАНИЕ:**
Проанализируй эти данные и предоставь:

1. **Общий анализ эффективности кампании** (2-3 абзаца):
   - Оценка общей эффективности SMS-кампаний
   - Ключевые показатели (конверсия, вовлеченность, время просмотра)
   - Тренды и паттерны в данных

2. **Анализ по кампаниям** (ОБЯЗАТЕЛЬНО включи таблицу):
   - Создай таблицу в формате:
   
   | Кампания | Дата | Отправлено | Просмотрено | Просмотры | Конверсия |
   |----------|------|------------|-------------|-----------|-----------|
   | Название | дата | число      | число       | число     | %         |
   
   - Какие кампании показали лучшие результаты и почему
   - Какие кампании требуют оптимизации
   - Сравнение эффективности разных волн рассылок

3. **Анализ аудитории**:
   - Какие специальности наиболее активны
   - Характеристики наиболее вовлеченных клиентов
   - Потенциальные сегменты для таргетинга

4. **Временной анализ**:
   - Динамика вовлеченности по дням
   - Оптимальное время для рассылок
   - Тренды роста/снижения активности

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

