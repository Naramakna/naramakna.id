const axios = require('axios');

class IndexNowService {
  constructor() {
    this.apiKey = '8c7e4b9a2f5d6e1c3a8b9d7f4e5c6a2b'; // Generate random key
    this.host = 'naramakna.id';
    this.keyLocation = `https://${this.host}/${this.apiKey}.txt`;
  }

  async submitUrl(url) {
    try {
      const payload = {
        host: this.host,
        key: this.apiKey,
        keyLocation: this.keyLocation,
        urlList: [url]
      };

      // Submit to Bing
      await axios.post('https://api.indexnow.org/indexnow', payload, {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });

      console.log(`✅ IndexNow: Submitted ${url}`);
      return true;
    } catch (error) {
      console.error(`❌ IndexNow error for ${url}:`, error.message);
      return false;
    }
  }

  async submitUrls(urls) {
    if (!urls || urls.length === 0) return;
    
    try {
      const payload = {
        host: this.host,
        key: this.apiKey,
        keyLocation: this.keyLocation,
        urlList: urls.slice(0, 10000) // Max 10000 URLs per request
      };

      await axios.post('https://api.indexnow.org/indexnow', payload, {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });

      console.log(`✅ IndexNow: Submitted ${urls.length} URLs`);
      return true;
    } catch (error) {
      console.error(`❌ IndexNow batch error:`, error.message);
      return false;
    }
  }
}

module.exports = new IndexNowService();
