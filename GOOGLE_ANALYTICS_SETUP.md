# 📊 Google Analytics 4 Setup Guide - Naramakna.id

## 🚀 Quick Setup Steps

### 1. **Create Google Analytics Account**
1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Start measuring" 
3. Create Account name: "Naramakna"
4. Create Property name: "naramakna.id"
5. Select Industry: "News and Media"
6. Choose reporting time zone: "Indonesia"

### 2. **Get Measurement ID**
1. In GA4 Dashboard → Admin → Property Settings
2. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. **Update Configuration Files**

**File 1: `/frontend/.env.production`**
```
REACT_APP_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
```

**File 2: `/backend/src/controllers/metaTagsController.js`**
Replace `G-XXXXXXXXXX` (lines 227 & 232) with your actual ID:
```javascript
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ACTUAL-ID"></script>
<script>
  gtag('config', 'G-YOUR-ACTUAL-ID');
</script>
```

### 4. **Deploy Changes**
```bash
npm run build
pm2 restart naramakna-backend
```

## 📈 **Analytics Features Implemented**

### **Automatic Tracking:**
✅ **Page Views** - All routes automatically tracked  
✅ **Article Reads** - Title, category, author, read time  
✅ **Video Plays** - TikTok video interactions  
✅ **User Navigation** - Route changes and flow  

### **Enhanced Events:**
✅ **Article Engagement** - Reading time, scroll depth  
✅ **Video Interactions** - Play, duration, platform  
✅ **Social Sharing** - Platform tracking  
✅ **Search Events** - Query terms and results  
✅ **Error Tracking** - JavaScript errors & API failures  

### **Content Analytics:**
✅ **Category Performance** - Which topics perform best  
✅ **Author Attribution** - Writer performance tracking  
✅ **Read Time Analysis** - Content engagement depth  
✅ **User Flow** - How users navigate the site  

## 🎯 **Custom Events Available**

### **Content Events:**
- `article_read` - Article page visits
- `video_play` - TikTok video plays  
- `scroll_depth` - Reading engagement (25%, 50%, 75%, 90%)
- `search` - Site search usage

### **Engagement Events:**
- `share` - Social media sharing
- `navigation` - Internal link clicks
- `conversion` - Newsletter signups, forms
- `engagement` - Likes, comments, downloads

### **Performance Events:**
- `timing_complete` - Page load times
- `exception` - Error tracking
- `api_response_time` - Backend performance

## 📊 **Expected Reports**

### **Audience Insights:**
- Demographics (age, gender, location)
- Interests and behavior patterns  
- Device and browser usage
- Traffic sources (search, social, direct)

### **Content Performance:**
- Top articles by category
- Video engagement rates
- Reading completion rates
- Popular search terms

### **User Journey:**
- Entry pages and exit pages
- Navigation flow between articles
- Conversion funnel analysis
- Real-time active users

## 🛡️ **Privacy & Compliance**

### **GDPR Ready:**
- No personal data collection without consent
- IP anonymization enabled
- Cookie consent integration ready
- Data retention controls

### **Performance Optimized:**
- Async loading (non-blocking)
- Minimal impact on page speed
- Efficient event batching
- Development mode disabled

## 🔧 **Testing Setup**

### **Verify Installation:**
1. Open website in incognito mode
2. Open DevTools → Network tab
3. Look for requests to `google-analytics.com`
4. Check GA4 Real-time reports for activity

### **Test Custom Events:**
1. Read an article → Check "article_read" event
2. Play a TikTok video → Check "video_play" event
3. Navigate pages → Check page view events

## 📞 **Support**

If you need help setting up:
1. Share your GA4 Measurement ID
2. Test the tracking in Real-time reports
3. Verify events are firing correctly

---

**Ready to track website performance and optimize content strategy!** 📊✨