// Direct Google Sheets data service
const SPREADSHEET_ID = '1iIm0hx5bDEqvd3kpJBBbv_FgdpI6qxM-0pDGvl6bWJY'; // SMS данные
const USERS_SPREADSHEET_ID = '13hEDBGU-nzz0ak8D_JNBzGeOy5lgSRy__kpJTXbk9ZA'; // База пользователей PhC 2025
const CAMPAIGNS_SPREADSHEET_ID = '1wtiGT4vn5o4icOKnON8a-Orwhz87nGV1qA2Xu6lpuss'; // Лог рассылок

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
      const csvUrl = `https://docs.google.com/spreadsheets/d/${CAMPAIGNS_SPREADSHEET_ID}/export?format=csv&gid=754461975&t=${timestamp}`;
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

      // Create campaign lookup map by distribution ID
      const campaignMap = new Map();
      campaignsData.forEach(campaign => {
        const distributionId = campaign['ID дистрибуции'];
        if (distributionId) {
          campaignMap.set(distributionId, campaign);
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

          // Find campaign data by distribution type
          const distributionType = smsRecord['Тип дистрибуции'] || '';
          const campaignData = campaignMap.get(distributionType);

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
            additionalInfo: smsRecord['Доп сведения (utm_test)'] || '',
            // User data
            userName: userData ? userData['ФИО'] : '',
            specialty: userData ? userData['Специальность'] : '',
            workplace: userData ? userData['Место работы'] : '',
            district: userData ? userData['Район'] : '',
            hasUserData: !!userData,
            // Campaign data
            campaignName: campaignData ? campaignData['Название кампании'] : '',
            smsText: campaignData ? campaignData['Текст SMS'] : '',
            contactCount: campaignData ? parseInt(campaignData['Кол-во обычных контактов']) || 0 : 0,
            hasCampaignData: !!campaignData
          };
        })
        .filter(record => {
          // Exclude records where user has specialty "Не врач"
          // If no user data found, include the record (anonymous viewing)
          if (!record.hasUserData) {
            return true;
          }
          
          // Filter out "Не врач" specialty
          const specialty = record.specialty ? record.specialty.toLowerCase().trim() : '';
          const excludeKeywords = ['не врач', 'неврач', 'не врач.', 'не врач!'];
          
          return !excludeKeywords.some(keyword => specialty.includes(keyword));
        });

      const excludedCount = smsData.length - combinedData.length;
      const withCampaignData = combinedData.filter(record => record.hasCampaignData).length;
      console.log(`Combined ${smsData.length} SMS records with ${usersData.length} users and ${campaignsData.length} campaigns`);
      console.log(`Filtered out ${excludedCount} records with "Не врач" specialty`);
      console.log(`Records with campaign data: ${withCampaignData} of ${combinedData.length}`);
      console.log(`Final dataset: ${combinedData.length} records`);
      return combinedData;
    } catch (error) {
      console.error('Error fetching combined data:', error);
      throw error;
    }
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
