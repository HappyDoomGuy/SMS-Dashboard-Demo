// Direct Google Sheets data service
const SPREADSHEET_ID = '1iIm0hx5bDEqvd3kpJBBbv_FgdpI6qxM-0pDGvl6bWJY'; // SMS данные
const USERS_SPREADSHEET_ID = '13hEDBGU-nzz0ak8D_JNBzGeOy5lgSRy__kpJTXbk9ZA'; // База пользователей PhC 2025

export const apiService = {
  // Fetch SMS data from Google Sheets via CSV export
  async getData() {
    try {
      // CSV export URL for public sheets
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
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
      return data;
    } catch (error) {
      console.error('Error fetching SMS data from Google Sheets:', error);
      throw error;
    }
  },

  // Fetch users data from PhC 2025 database
  async getUsersData() {
    try {
      // CSV export URL for users database
      const csvUrl = `https://docs.google.com/spreadsheets/d/${USERS_SPREADSHEET_ID}/export?format=csv&gid=0`;
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

  // Fetch combined data with user information
  async getCombinedData() {
    try {
      const [smsData, usersData] = await Promise.all([
        this.getData(),
        this.getUsersData()
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

          return {
            id: index + 1,
            date: smsRecord['Дата и время'] || '',
            phone: phone || '',
            videoName: smsRecord['Название видео'] || '',
            contentType: smsRecord['Тип контента'] || '',
            timeSec: parseInt(smsRecord['Время сек']) || 0,
            sessionId: smsRecord['SessionID'] || '',
            viewPercent: parseInt(smsRecord['% просмотра']) || 0,
            distributionType: smsRecord['Тип дистрибуции'] || '',
            additionalInfo: smsRecord['Доп сведения (utm_test)'] || '',
            // User data
            userName: userData ? userData['ФИО'] : '',
            specialty: userData ? userData['Специальность'] : '',
            workplace: userData ? userData['Место работы'] : '',
            district: userData ? userData['Район'] : '',
            hasUserData: !!userData
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
      console.log(`Combined ${smsData.length} SMS records with ${usersData.length} users`);
      console.log(`Filtered out ${excludedCount} records with "Не врач" specialty`);
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
  }
};
