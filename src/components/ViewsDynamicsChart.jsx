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
            background: '#ffffff',
            border: '1px solid #e9ecef',
            borderRadius: 1,
            p: 1.5,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {payload[0].payload.date}
          </Typography>
          <Typography variant="body2" sx={{ color: '#495057' }}>
            Просмотров: <strong>{payload[0].value}</strong>
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
        border: '1px solid #e9ecef',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e9ecef' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
          Динамика просмотров по дням
        </Typography>
      </Box>
      
      <Box sx={{ p: 3, height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6c757d', fontSize: 12 }}
              stroke="#dee2e6"
            />
            <YAxis 
              tick={{ fill: '#6c757d', fontSize: 12 }}
              stroke="#dee2e6"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                color: '#495057'
              }}
            />
            <Bar 
              dataKey="Просмотров" 
              fill="#495057"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ViewsDynamicsChart;
