const geoip = require('geoip-lite');

// Middleware untuk tracking IP address dan lokasi
const ipTracker = (req, res, next) => {
  try {
    // Dapatkan IP address dari request
    let ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Clean up IP (remove port if exists)
    if (ip) {
      ip = ip.split(',')[0].trim();
      
      // Remove IPv6 prefix if present
      if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
      }
    }

    // Fallback untuk development (localhost)
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      ip = '114.122.168.1'; // Sample Jakarta IP for testing
    }

    // Lookup geolocation
    const geo = geoip.lookup(ip);
    
    // Mapping untuk kota-kota besar Indonesia
    const indonesianCities = {
      'Jakarta': ['Jakarta', 'DKI Jakarta', 'Central Jakarta', 'South Jakarta', 'North Jakarta', 'East Jakarta', 'West Jakarta'],
      'Bandung': ['Bandung', 'Bandung Regency'],
      'Surabaya': ['Surabaya'],
      'Medan': ['Medan'],
      'Semarang': ['Semarang'],
      'Makassar': ['Makassar', 'Ujung Pandang'],
      'Palembang': ['Palembang'],
      'Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul'],
      'Malang': ['Malang'],
      'Denpasar': ['Denpasar', 'Badung', 'Gianyar'],
      'Banjarmasin': ['Banjarmasin'],
      'Pontianak': ['Pontianak'],
      'Balikpapan': ['Balikpapan'],
      'Samarinda': ['Samarinda'],
      'Manado': ['Manado'],
      'Batam': ['Batam'],
      'Pekanbaru': ['Pekanbaru'],
      'Padang': ['Padang'],
      'Bogor': ['Bogor'],
      'Tangerang': ['Tangerang'],
      'Bekasi': ['Bekasi'],
      'Depok': ['Depok']
    };

    let locationData = {
      ip: ip,
      country: 'Indonesia', // Default
      region: 'Unknown',
      city: 'Unknown',
      latitude: null,
      longitude: null,
      timezone: 'Asia/Jakarta'
    };

    if (geo) {
      locationData = {
        ip: ip,
        country: geo.country === 'ID' ? 'Indonesia' : geo.country,
        region: geo.region || 'Unknown',
        city: geo.city || 'Unknown',
        latitude: geo.ll ? geo.ll[0] : null,
        longitude: geo.ll ? geo.ll[1] : null,
        timezone: geo.timezone || 'Asia/Jakarta'
      };

      // Map ke kota besar Indonesia jika ditemukan
      if (geo.country === 'ID' && geo.city) {
        for (const [mainCity, variations] of Object.entries(indonesianCities)) {
          if (variations.some(variant => 
            geo.city.toLowerCase().includes(variant.toLowerCase()) ||
            variant.toLowerCase().includes(geo.city.toLowerCase())
          )) {
            locationData.city = mainCity;
            break;
          }
        }
      }
    }

    // Tambahkan ke request object
    req.location = locationData;
    
    next();
  } catch (error) {
    console.error('IP Tracker Error:', error);
    
    // Fallback location data
    req.location = {
      ip: req.ip || 'unknown',
      country: 'Indonesia',
      region: 'Unknown',
      city: 'Unknown',
      latitude: null,
      longitude: null,
      timezone: 'Asia/Jakarta'
    };
    
    next();
  }
};

module.exports = ipTracker;
