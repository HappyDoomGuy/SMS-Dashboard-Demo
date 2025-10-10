import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ViewsDynamicsChart = ({ data, currentContentType }) => {
  // Group data by date (day only, without time)
  const viewsByDate = new Map();
  
  data.forEach(item => {
    if (!item.date) return;
    
    // Parse date and extract only the date part (without time)
    const dateStr = item.date.split(' ')[0]; // Get "DD.MM.YYYY" part
    
    if (!viewsByDate.has(dateStr)) {
      viewsByDate.set(dateStr, 0);
    }
    
    viewsByDate.set(dateStr, viewsByDate.get(dateStr) + 1);
  });
  
  // Convert to array and sort by date
  const chartData = Array.from(viewsByDate.entries())
    .map(([dateStr, count]) => {
      // Parse date for sorting
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(year, month - 1, day);
        return {
          date: dateStr,
          dateObj: date,
          views: count
        };
      }
      return null;
    })
    .filter(item => item !== null)
    .sort((a, b) => a.dateObj - b.dateObj) // Sort chronologically
    .map(item => ({
      date: item.date,
      'Просмотров': item.views
    }));
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(100, 116, 255, 0.3)',
            borderRadius: 2,
            p: 1.5,
            boxShadow: '0 8px 32px rgba(100, 116, 255, 0.2)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#1a2332' }}>
            {payload[0].payload.date}
          </Typography>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            Просмотров: <strong style={{ color: '#6474ff', fontSize: '1.1em' }}>{payload[0].value}</strong>
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper 
      sx={{ 
        width: '100%',
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.125rem' }}>
          Динамика просмотров по дням
        </Typography>
      </Box>
      
      <Box sx={{ p: 3, height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 255, 0.15)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="rgba(100, 116, 255, 0.2)"
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="rgba(100, 116, 255, 0.2)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                color: '#374151',
                fontWeight: 600
              }}
            />
            <Bar 
              dataKey="Просмотров" 
              fill="url(#colorGradient)"
              radius={[6, 6, 0, 0]}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6474ff" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#8b95ff" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ViewsDynamicsChart;
