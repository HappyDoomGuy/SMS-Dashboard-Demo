// Direct Google Sheets data service
import config, { isAllowedCampaignSource, shouldExcludeUser } from '../config';

// Get spreadsheet IDs from config
const SPREADSHEET_ID = config.dataSources.smsData.spreadsheetId;
const USERS_SPREADSHEET_ID = config.dataSources.usersDatabase.spreadsheetId;
const CAMPAIGNS_SPREADSHEET_ID = config.dataSources.campaignsLog.spreadsheetId;
const CAMPAIGNS_SHEET_ID = config.dataSources.campaignsLog.sheetId;

// Store campaigns data globally for statistics
let globalCampaignsData = [];

export const apiService = {
  // Fetch SMS data from Google Sheets via CSV export
  async getData() {
    try {
      // CSV export URL for public sheets with cache busting
      const timestamp = new Date().getTime();
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0&t=${timestamp}`;
      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return [];
      }
      
      // Parse headers
      const headers = this.parseCSVLine(lines[0]);
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCSVLine(lines[i]);
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          data.push(obj);
        }
      }
      
      console.log(`Loaded ${data.length} SMS records from Google Sheets`);
      
      // Debug: Show date range
      if (data.length > 0) {
        const dates = data.map(item => item['Дата и время']).filter(date => date);
        if (dates.length > 0) {
          dates.sort();
          console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
          console.log(`Latest 5 records:`, dates.slice(-5));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching SMS data from Google Sheets:', error);
      throw error;
    }
  },

  // Fetch users data from PhC 2025 database
  async getUsersData() {
    try {
      // CSV export URL for users database with cache busting
      const timestamp = new Date().getTime();
      const csvUrl = `https://docs.google.com/spreadsheets/d/${USERS_SPREADSHEET_ID}/export?format=csv&gid=0&t=${timestamp}`;
      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return [];
      }
      
      // Parse headers
      const headers = this.parseCSVLine(lines[0]);
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCSVLine(lines[i]);
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          data.push(obj);
        }
      }
      
      console.log(`Loaded ${data.length} users from PhC 2025 database`);
      return data;
    } catch (error) {
      console.error('Error fetching users data from Google Sheets:', error);
      throw error;
    }
  },

  // Fetch campaigns data from SMS campaigns log
  async getCampaignsData() {
    try {
      // CSV export URL for campaigns database with cache busting
      const timestamp = new Date().getTime();
      const csvUrl = `https://docs.google.com/spreadsheets/d/${CAMPAIGNS_SPREADSHEET_ID}/export?format=csv&gid=${CAMPAIGNS_SHEET_ID}&t=${timestamp}`;
      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return [];
      }
      
      // Parse headers
      const headers = this.parseCSVLine(lines[0]);
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = this.parseCSVLine(lines[i]);
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          data.push(obj);
        }
      }
      
      console.log(`Loaded ${data.length} campaigns from SMS campaigns log`);
      return data;
    } catch (error) {
      console.error('Error fetching campaigns data from Google Sheets:', error);
      throw error;
    }
  },

  // Parse CSV line (handles quoted values)
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  },

  // Fetch unique content types
  async getContentTypes() {
    try {
      const data = await this.getData();
      const contentTypes = [...new Set(data.map(item => item['Тип контента']).filter(type => type))];
      return contentTypes.sort();
    } catch (error) {
      console.error('Error fetching content types:', error);
      throw error;
    }
  },

  // Fetch combined data with user information and campaign data
  async getCombinedData() {
    try {
      const [smsData, usersData, campaignsData] = await Promise.all([
        this.getData(),
        this.getUsersData(),
        this.getCampaignsData()
      ]);

      // Store campaigns data globally for statistics
      globalCampaignsData = campaignsData;

      // Create phone lookup map
      const phoneMap = new Map();
      usersData.forEach(user => {
        const phone = user['Телефон'];
        if (phone) {
          // Normalize phone number (remove spaces, dashes, etc.)
          const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
          phoneMap.set(normalizedPhone, user);
          
          // Also try with country code
          if (!normalizedPhone.startsWith('375')) {
            phoneMap.set('375' + normalizedPhone, user);
          }
        }
      });

      // Create campaign lookup map by distribution ID and A/B group
      // Filter: only include campaigns from Delta Medical
      const campaignMap = new Map();
      campaignsData.forEach(campaign => {
        const source = campaign['Название таблицы (Источник)'] || '';
        const distributionId = campaign['ID дистрибуции'];
        const abGroup = campaign['Группа (A/B)'] || '';
        
        // Only include campaigns from allowed sources (e.g., Delta Medical)
        if (distributionId && isAllowedCampaignSource(source)) {
          // Create key: "distributionId|abGroup" for A/B testing support
          const key = abGroup ? `${distributionId}|${abGroup}` : distributionId;
          campaignMap.set(key, campaign);
        }
      });

      // Combine data and filter out "Не врач" users
      const combinedData = smsData
        .map((smsRecord, index) => {
          const phone = smsRecord['Номер телефона (utm_medium)'];
          const normalizedPhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : '';
          
          // Find user data
          let userData = phoneMap.get(normalizedPhone);
          if (!userData && normalizedPhone.startsWith('375')) {
            // Try without country code
            userData = phoneMap.get(normalizedPhone.substring(3));
          }

          // Find campaign data by distribution type and A/B group
          const distributionType = smsRecord['Тип дистрибуции'] || '';
          const additionalInfo = smsRecord['Доп сведения (utm_test)'] || '';
          
          // Try to find campaign data with A/B group first, then without
          let campaignData = null;
          if (additionalInfo) {
            campaignData = campaignMap.get(`${distributionType}|${additionalInfo}`);
          }
          if (!campaignData) {
            campaignData = campaignMap.get(distributionType);
          }

          return {
            id: index + 1,
            date: smsRecord['Дата и время'] || '',
            phone: phone || '',
            videoName: smsRecord['Название видео'] || '',
            contentType: smsRecord['Тип контента'] || '',
            timeSec: parseInt(smsRecord['Время сек']) || 0,
            sessionId: smsRecord['SessionID'] || '',
            viewPercent: parseInt(smsRecord['% просмотра']) || 0,
            distributionType: distributionType,
            additionalInfo: additionalInfo,
            abGroup: additionalInfo, // A/B группа из utm_test
            // User data
            userName: userData ? userData['ФИО'] : '',
            specialty: userData ? userData['Специальность'] : '',
            workplace: userData ? userData['Место работы'] : '',
            district: userData ? userData['Район'] : '',
            hasUserData: !!userData,
            // Campaign data (с учетом A/B группы)
            campaignName: campaignData ? campaignData['Название кампании'] : '',
            smsText: campaignData ? campaignData['Текст SMS'] : '',
            contactCount: campaignData ? parseInt(campaignData['Кол-во обычных контактов']) || 0 : 0,
            hasCampaignData: !!campaignData
          };
        })
        .filter(record => {
          // Filter 1: Only include records with campaign data from Delta Medical
          // If no campaign data found, exclude the record
          if (!record.hasCampaignData) {
            return false;
          }
          
          // Filter 2: Exclude records where user has specialty "Не врач"
          // If no user data found, include the record (anonymous viewing)
          if (record.hasUserData) {
            if (shouldExcludeUser(record.specialty)) {
              return false;
            }
          }
          
          return true;
        });

      const excludedCount = smsData.length - combinedData.length;
      const allowedCampaigns = campaignsData.filter(c => isAllowedCampaignSource(c['Название таблицы (Источник)'])).length;
      
      console.log(`Combined ${smsData.length} SMS records with ${usersData.length} users and ${campaignsData.length} campaigns`);
      console.log(`Allowed campaigns (${config.company.name}): ${allowedCampaigns} of ${campaignsData.length}`);
      console.log(`Filtered out ${excludedCount} records (no Delta Medical campaign or "Не врач")`);
      console.log(`Final dataset: ${combinedData.length} records (only Delta Medical)`);
      return combinedData;
    } catch (error) {
      console.error('Error fetching combined data:', error);
      throw error;
    }
  },

  // Get filtered campaigns data for statistics
  getFilteredCampaigns() {
    return globalCampaignsData;
  }
};

// Data transformation utilities
export const dataUtils = {
  // Get unique content types from data
  getContentTypes(data) {
    const types = [...new Set(data.map(item => item.contentType).filter(type => type))];
    return types.sort();
  },

  // Filter data by content type
  filterByContentType(data, contentType) {
    return data.filter(item => item.contentType === contentType);
  },

  // Get statistics about user data coverage
  getUserDataStats(data) {
    const total = data.length;
    const withUserData = data.filter(item => item.hasUserData).length;
    const withoutUserData = total - withUserData;
    
    return {
      total,
      withUserData,
      withoutUserData,
      coveragePercent: total > 0 ? Math.round((withUserData / total) * 100) : 0
    };
  },

  // Get statistics about campaign data coverage
  getCampaignDataStats(data) {
    const total = data.length;
    const withCampaignData = data.filter(item => item.hasCampaignData).length;
    const withoutCampaignData = total - withCampaignData;
    
    return {
      total,
      withCampaignData,
      withoutCampaignData,
      coveragePercent: total > 0 ? Math.round((withCampaignData / total) * 100) : 0
    };
  }
};
