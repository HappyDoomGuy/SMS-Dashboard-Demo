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
            background: '#1a1f3a',
            border: '1px solid rgba(100, 116, 255, 0.3)',
            borderRadius: 1,
            p: 1.5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#ffffff' }}>
            {payload[0].payload.date}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Просмотров: <strong style={{ color: '#6474ff' }}>{payload[0].value}</strong>
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
        background: '#151933',
        border: '1px solid rgba(100, 116, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(100, 116, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
          Динамика просмотров по дням
        </Typography>
      </Box>
      
      <Box sx={{ p: 3, height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
              stroke="rgba(100, 116, 255, 0.3)"
            />
            <YAxis 
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
              stroke="rgba(100, 116, 255, 0.3)"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            />
            <Bar 
              dataKey="Просмотров" 
              fill="#6474ff"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ViewsDynamicsChart;
