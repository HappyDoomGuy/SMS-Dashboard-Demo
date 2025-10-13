import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  Fab
} from '@mui/material';
import {
  Close as CloseIcon,
  LightMode as LightModeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { keyframes } from '@mui/system';
import AnimatedLogo from './AnimatedLogo';

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
      0 0 20px rgba(255, 193, 7, 0.3),
      0 0 40px rgba(255, 193, 7, 0.15),
      0 8px 32px rgba(255, 193, 7, 0.2);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(255, 193, 7, 0.5),
      0 0 60px rgba(255, 193, 7, 0.25),
      0 8px 32px rgba(255, 193, 7, 0.3);
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

const AIConsultantOptimistic = ({ data, contentType, campaignsData, clientsData }) => {
  const { enqueueSnackbar } = useSnackbar();
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

      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Позитивный_Анализ_${contentType}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
      pdf.save(filename);
      enqueueSnackbar('PDF успешно сохранен', { variant: 'success' });
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      enqueueSnackbar('Ошибка при экспорте в PDF', { variant: 'error' });
      setError(`Ошибка при экспорте в PDF: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const exportToWord = async () => {
    if (!analysis) return;
    
    setExporting(true);
    try {
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
          <h1>Позитивный анализ - ${contentType}</h1>
          <p><strong>Дата создания:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          <hr/>
          ${analysis.replace(/\n/g, '<br/>')}
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { 
        type: 'application/msword' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Позитивный_Анализ_${contentType}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('Файл Word успешно сохранен', { variant: 'success' });
    } catch (err) {
      console.error('Error exporting to Word:', err);
      enqueueSnackbar('Ошибка при экспорте в Word', { variant: 'error' });
      setError(`Ошибка при экспорте в Word: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const prepareDataForAnalysis = () => {
    const parseDate = (dateString) => {
      if (!dateString) return null;
      
      const cleanDate = String(dateString).trim();
      let date = null;
      let match = null;
      
      match = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
      if (match) {
        const [, day, month, year, hour, minute, second] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
      }
      
      if (!date || isNaN(date.getTime())) {
        match = cleanDate.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (match) {
          const [, day, month, year] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      if (!date || isNaN(date.getTime())) {
        match = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
        if (match) {
          const [, year, month, day, hour, minute, second] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }
      }
      
      if (!date || isNaN(date.getTime())) {
        match = cleanDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (match) {
          const [, year, month, day] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      if (!date || isNaN(date.getTime())) {
        date = new Date(dateString);
      }
      
      return (!date || isNaN(date.getTime())) ? null : date;
    };

    const totalRecords = data.length;
    const totalTime = data.reduce((sum, item) => sum + (item.timeSec || 0), 0);
    const avgTime = totalRecords > 0 ? (totalTime / totalRecords).toFixed(2) : 0;
    
    const viewPercents = data.map(item => item.viewPercent || 0).filter(p => p > 0);
    const avgViewPercent = viewPercents.length > 0 
      ? (viewPercents.reduce((sum, p) => sum + p, 0) / viewPercents.length).toFixed(2) 
      : 0;

    const campaignsStats = campaignsData.map(c => ({
      name: c.campaignName,
      date: c.latestDate,
      smsSent: c.smsSent,
      smsViewed: c.smsViewed,
      pageViews: c.pageViews,
      conversionRate: ((c.pageViews / c.smsSent) * 100).toFixed(2)
    }));

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

    const specialtyDistribution = {};
    clientsData.forEach(client => {
      const specialty = client.specialty || 'Не указано';
      specialtyDistribution[specialty] = (specialtyDistribution[specialty] || 0) + 1;
    });

    const dailyViews = {};
    data.forEach(item => {
      if (!item.date) return;
      
      const dateObj = parseDate(item.date);
      
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
      }
    };
  };

  const analyzeData = async () => {
    setLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const dataForAnalysis = prepareDataForAnalysis();

      const prompt = `Ты — маркетинговый консультант-стратег фармацевтической индустрии. Твоя задача — дать ПРАКТИЧЕСКИЕ РЕКОМЕНДАЦИИ по улучшению SMS-кампании для препарата "${dataForAnalysis.contentType}".

**ВАЖНЫЕ ПРАВИЛА:**
- ❌ НЕ давай оценок текущим показателям (НЕ говори "хорошо" или "плохо")
- ❌ НЕ анализируй конверсию как "высокую" или "низкую"
- ❌ НЕ оценивай эффективность кампаний
- ✅ ФОКУСИРУЙСЯ только на рекомендациях и советах
- ✅ Предлагай конкретные действия для улучшения
- ✅ Давай практические стратегии повышения конверсии
- ✅ Объясняй КАК улучшить, а не ЧТО плохо
- ✅ Используй формат: "Для повышения X рекомендую Y"
- ✅ Тон: консультативный, практичный, ориентированный на действия

**ВАЖНО:** 
- НЕ указывай дату анализа от себя, используй ТОЛЬКО даты из предоставленных данных
- НЕ используй таблицы в своем ответе
- Все данные представляй в виде структурированных списков
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

**Топ-5 самых вовлеченных клиентов:**
${dataForAnalysis.topClients.map((c, i) => 
  `${i + 1}. ${c.name} (${c.specialty}, ${c.workplace}): ${c.pageViews} просмотров, время: ${c.totalTime}`
).join('\n')}

**Распределение по специальностям:**
${Object.entries(dataForAnalysis.specialtyDistribution)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([specialty, count]) => `- ${specialty}: ${count} клиентов`)
  .join('\n')}

**Динамика просмотров по дням:**
${dataForAnalysis.viewsDynamics.map(d => `- ${d.date}: ${d.views} просмотров`).join('\n')}

**Статистика по дням недели:**
${Object.entries(dataForAnalysis.dayOfWeekStats).map(([day, count]) => `- ${day}: ${count} просмотров`).join('\n')}

**Статистика по часам (топ-10):**
${Object.entries(dataForAnalysis.hourlyStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([hour, count]) => `- ${hour}:00 - ${count} просмотров`)
  .join('\n')}

**ЗАДАНИЕ:**
На основе этих данных дай ПРАКТИЧЕСКИЕ РЕКОМЕНДАЦИИ (БЕЗ оценок):

1. **Стратегии повышения конверсии** (3-5 рекомендаций):
   - Как увеличить количество просмотров SMS
   - Способы повышения переходов на страницу
   - Методы увеличения времени просмотра видео
   - Тактики для улучшения вовлеченности

2. **Рекомендации по кампаниям** (для каждой кампании):
   - Что можно улучшить в следующей волне
   - Как оптимизировать текст SMS
   - Идеи для повышения отклика
   - Предложения по таргетингу

3. **Работа с аудиторией** (конкретные действия):
   - Как лучше работать с активными специальностями
   - Способы вовлечения менее активных сегментов
   - Идеи персонализации для разных врачей
   - Стратегии удержания внимания

4. **Оптимизация времени и частоты**:
   - Рекомендации по дням недели для рассылок
   - Оптимальные часы для отправки SMS
   - Частота контакта с аудиторией
   - График проведения кампаний

5. **Улучшение контента**:
   - Идеи для повышения интереса к видео
   - Рекомендации по длине и формату контента
   - Способы сделать материал более привлекательным
   - Предложения по структуре информации

6. **Практический план на следующий месяц**:
   - Конкретные шаги для улучшения результатов
   - Приоритетные действия
   - Что внедрить в первую очередь
   - Как отслеживать эффективность изменений

ВАЖНО: Не давай оценок! Только рекомендации и советы. Формат: "Рекомендую...", "Предлагаю...", "Для улучшения стоит..."`;

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.75,
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
        enqueueSnackbar('Рекомендации готовы!', { variant: 'success' });
      } else {
        throw new Error('Неверный формат ответа от API');
      }
    } catch (err) {
      console.error('Error analyzing data:', err);
      setError(`Ошибка при анализе данных: ${err.message}`);
      enqueueSnackbar('Ошибка при анализе данных', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button with Energy Field */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 200,
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
              border: '1.5px solid rgba(255, 193, 7, 0.4)',
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
              background: 'linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.4), transparent)',
              animation: `${hologramShift} ${2.5 + i * 0.3}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 0.2 + 0.8}s`,
              pointerEvents: 'none'
            }}
          />
        ))}
        

        <Fab
          color="warning"
          aria-label="AI консультант позитивный"
          onClick={handleOpen}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            pointerEvents: 'auto',
            background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
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
              background: 'linear-gradient(135deg, #FFB300 0%, #FFC107 100%)',
              boxShadow: '0 12px 48px rgba(255, 193, 7, 0.4)',
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
          <LightModeIcon 
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
        disableScrollLock={true}
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
              background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LightModeIcon sx={{ color: '#ffffff', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: -0.3 }}>
              ИИ Консультант — Советник
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: '#86868b',
              '&:hover': {
                background: 'rgba(255, 193, 7, 0.08)',
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
              <LightModeIcon sx={{ fontSize: 80, color: '#FFC107', mb: 3, filter: 'drop-shadow(0 4px 20px rgba(255, 193, 7, 0.3))' }} />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 800, color: '#1a2332' }}>
                Готов дать рекомендации по кампании "{contentType}"
              </Typography>
              <Typography variant="body2" sx={{ mb: 4, color: '#6b7280', maxWidth: '400px', lineHeight: 1.6 }}>
                Нажмите кнопку ниже, чтобы получить практические советы по улучшению конверсии и эффективности
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={analyzeData}
                sx={{
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
                  px: 5,
                  py: 1.8,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 32px rgba(255, 193, 7, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                    transition: 'left 0.6s ease'
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFB300 0%, #FFC107 100%)',
                    boxShadow: '0 12px 48px rgba(255, 193, 7, 0.4)',
                    transform: 'translateY(-3px)',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Получить рекомендации
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
              <AnimatedLogo size={120} showParticles={true} />
              <Typography variant="h6" sx={{ mb: 1, mt: 4, color: '#1a2332', fontWeight: 700 }}>
                Формирую рекомендации...
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                ИИ готовит практические советы по улучшению
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
                  color: '#FFA000'
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
                  color: '#FFA000',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(255, 193, 7, 0.08)'
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
                  color: '#FFA000',
                  fontWeight: 500,
                  '&:hover': {
                    background: 'rgba(255, 193, 7, 0.08)'
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
                  color: '#FFA000',
                  fontWeight: 500,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.2), transparent)',
                    transition: 'left 0.6s ease'
                  },
                  '&:hover': {
                    background: 'rgba(255, 193, 7, 0.08)',
                    '&::before': {
                      left: '100%'
                    }
                  }
                }}
              >
Обновить рекомендации
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
                background: 'rgba(255, 193, 7, 0.08)',
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

export default AIConsultantOptimistic;

