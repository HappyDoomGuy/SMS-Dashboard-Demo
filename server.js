const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Sheets configuration
const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_SHEETS_API_KEY });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A1:N1000';

// API Routes
app.get('/api/data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    // Skip header row and process data
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index] || '';
      });
      return item;
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
});

app.get('/api/content-types', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    // Get unique content types (column D)
    const contentTypes = [...new Set(rows.slice(1).map(row => row[3]).filter(type => type))];
    
    res.json(contentTypes);
  } catch (error) {
    console.error('Error fetching content types:', error);
    res.status(500).json({ error: 'Failed to fetch content types' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
