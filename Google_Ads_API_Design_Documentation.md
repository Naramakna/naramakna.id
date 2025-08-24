# Google Ads API Integration Design Documentation
**Naramakna - Naramakna.id**

---

## 1. Company Overview

**Company Name:** Naramakna  
**Website:** https://naramakna.id  
**Business Type:** Digital News & Content Platform  
**Contact:** naramaknaskt@gmail.com  
**MCC ID:** 241-304-1593  

### Business Model
Naramakna.id is a comprehensive digital news platform focused on Indonesian current affairs, trending topics, and entertainment content. Our revenue model is primarily driven by digital advertising through automated ad placements and content monetization.

---

## 2. Project Overview

### Purpose
Implement Google Ads API integration to automatically synchronize and manage advertising campaigns on our news platform, ensuring seamless ad delivery and optimal user engagement.

### Key Objectives
- Automate ad campaign synchronization from Google Ads to our platform
- Provide real-time ad performance tracking and analytics
- Enable programmatic ad placement based on content categories
- Streamline ad management workflow for internal teams

---

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Google Ads    │    │   Naramakna.id   │    │   Frontend      │
│     API         │◄──►│    Backend       │◄──►│   Dashboard     │
│                 │    │    (Node.js)     │    │   (React)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   MySQL          │
                       │   Database       │
                       └──────────────────┘
```

### Technology Stack
- **Backend:** Node.js with Express.js framework
- **Frontend:** React with TypeScript
- **Database:** MySQL for ad storage and management
- **Authentication:** JWT-based session management
- **API Client:** Google Ads API v21 Node.js client library
- **Deployment:** PM2 process manager on Ubuntu server

---

## 4. Google Ads API Integration

### Authentication Flow
1. OAuth 2.0 authentication with Google Ads
2. Refresh token storage for persistent access
3. Customer ID validation and account verification
4. Developer token validation for API access

### API Endpoints Implementation
- **GET /api/google-ads/test-connection** - Test API connectivity
- **GET /api/google-ads/config** - Retrieve configuration status
- **GET /api/google-ads/campaigns** - Fetch active campaigns
- **GET /api/google-ads/ads** - Retrieve ads from campaigns
- **POST /api/google-ads/sync** - Synchronize ads to local database
- **GET /api/google-ads/status** - Get sync status and statistics

### Data Synchronization Process
```
1. Fetch Google Ads Campaigns
   ↓
2. Retrieve Ads from Selected Campaigns
   ↓
3. Transform Ad Data for Local Storage
   ↓
4. Update/Insert into MySQL Database
   ↓
5. Update Sync Status and Statistics
```

---

## 5. Database Design

### Advertisements Table Schema
```sql
CREATE TABLE advertisements (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  advertiser_id BIGINT UNSIGNED NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  budget DECIMAL(15,2) DEFAULT 0.00,
  placement_type VARCHAR(50) NOT NULL,
  media_type ENUM('image','gif','video','html','google_ads') NOT NULL DEFAULT 'image',
  media_url VARCHAR(500),
  image_url VARCHAR(255) NOT NULL,
  target_url VARCHAR(255) NOT NULL,
  google_ads_code TEXT,
  ad_content TEXT,
  clicks BIGINT NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_proof_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_advertiser_id (advertiser_id),
  FOREIGN KEY (advertiser_id) REFERENCES users(ID)
);
```

### Users Table Integration
```sql
-- System user for Google Ads operations (already created)
-- ID: 1001, user_login: google_ads_system
-- user_email: naramaknaskt@gmail.com
-- user_role: superadmin
-- display_name: Google Ads System
-- user_status: active

-- Table structure includes:
-- ID BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
-- user_login VARCHAR(60) NOT NULL
-- user_pass VARCHAR(255) NOT NULL  
-- user_nicename VARCHAR(50) NOT NULL
-- user_email VARCHAR(100) NOT NULL
-- user_role VARCHAR(20) NOT NULL
-- display_name VARCHAR(255)
-- user_status VARCHAR(20) DEFAULT 'active'
-- created_at, updated_at TIMESTAMP
```

---

## 6. Security Implementation

### Access Control
- **Role-Based Authentication:** Only superadmin users can access Google Ads management
- **API Token Validation:** Secure sync token for automated operations
- **Environment Variables:** Sensitive credentials stored securely
- **HTTPS Enforcement:** All API communications over secure channels

### Data Protection
- **Input Validation:** All user inputs sanitized and validated
- **SQL Injection Prevention:** Parameterized queries using Sequelize ORM
- **CORS Configuration:** Restricted cross-origin requests
- **Session Management:** Secure cookie-based authentication

### Error Handling
```javascript
// Secure error responses without exposing sensitive information
try {
  const result = await googleAdsService.testConnection();
  // ... success handling
} catch (error) {
  console.error('❌ Connection test error:', error);
  res.status(500).json({
    success: false,
    message: 'Failed to test Google Ads connection',
    error: 'Internal server error' // Generic error message
  });
}
```

---

## 7. User Interface Design

### Admin Dashboard Features
- **Configuration Status Panel:** Real-time API connection status
- **Campaign Management:** View and manage Google Ads campaigns
- **Ad Preview System:** Preview ads before synchronization
- **Sync Controls:** Manual and automated sync operations
- **Performance Analytics:** Impressions, clicks, and CTR tracking

### Dashboard Layout
```
┌─────────────────────────────────────────────────────┐
│                Navigation Bar                       │
├─────────────────────────────────────────────────────┤
│  Google Ads Integration                             │
│  ┌─────────────────┐ ┌─────────────────┐           │
│  │ Config Status   │ │ Sync Status     │           │
│  │ ✅ Connected    │ │ Last: 2 hrs ago │           │
│  └─────────────────┘ └─────────────────┘           │
│                                                     │
│  ┌─── Campaigns Tab ───┬─── Ads Tab ───┐           │
│  │ Campaign List       │ Ad Preview     │           │
│  │ ☑ Campaign A        │ [Ad Content]   │           │
│  │ ☐ Campaign B        │ [Ad Media]     │           │
│  │ [Sync Selected]     │ [Performance]  │           │
│  └─────────────────────┴────────────────┘           │
└─────────────────────────────────────────────────────┘
```

---

## 8. Automated Operations

### Cron Job Implementation
```javascript
// Daily sync at 2 AM
const cronSchedule = '0 2 * * *';
// OR every 6 hours: '0 6,12,18 * * *'

class GoogleAdsSyncCron {
  async run() {
    // 1. Validate environment variables
    // 2. Test Google Ads API connection
    // 3. Fetch campaigns and ads
    // 4. Synchronize to local database
    // 5. Log results and send notifications
  }
}
```

### Sync Process Flow
1. **Environment Validation:** Check required API credentials
2. **Connection Test:** Verify Google Ads API accessibility
3. **Data Retrieval:** Fetch campaigns and associated ads
4. **Data Transformation:** Convert API response to local format
5. **Database Operations:** Insert/update advertisement records
6. **Status Reporting:** Update sync statistics and timestamps

---

## 9. Performance Considerations

### Optimization Strategies
- **Batch Processing:** Process multiple ads in single database transaction
- **Caching:** Store frequently accessed configuration data
- **Rate Limiting:** Respect Google Ads API quotas and limits
- **Error Recovery:** Retry mechanisms for transient failures
- **Monitoring:** Real-time performance tracking and alerting

### Scalability Design
- **Modular Architecture:** Separate concerns for easy maintenance
- **Database Indexing:** Optimized queries for large datasets
- **Async Processing:** Non-blocking operations for better performance
- **Load Balancing:** Ready for horizontal scaling if needed

---

## 10. Testing & Quality Assurance

### Testing Strategy
- **Unit Tests:** Individual function and method validation
- **Integration Tests:** Google Ads API connectivity and data flow
- **End-to-End Tests:** Complete user workflow validation
- **Performance Tests:** API response time and throughput
- **Security Tests:** Authentication and authorization validation

### Quality Metrics
- **API Response Time:** < 2 seconds for standard operations
- **Data Accuracy:** 99.9% synchronization accuracy
- **Uptime Target:** 99.5% system availability
- **Error Rate:** < 1% failed sync operations

---

## 11. Maintenance & Support

### Monitoring
- **Health Checks:** Automated API connection monitoring
- **Performance Metrics:** Response time and error rate tracking
- **Log Management:** Comprehensive logging for debugging
- **Alerting System:** Immediate notification for critical issues

### Documentation
- **API Documentation:** Comprehensive endpoint documentation
- **User Guides:** Step-by-step administration guides
- **Troubleshooting:** Common issues and resolution steps
- **Change Log:** Version history and update notifications

---

## 12. Compliance & Data Privacy

### Google Ads API Policies
- **Terms of Service:** Full compliance with Google Ads API ToS
- **Data Usage:** Appropriate use of advertising data
- **Privacy Protection:** User data protection and anonymization
- **Content Policies:** Adherence to advertising content guidelines

### GDPR Compliance
- **Data Minimization:** Only collect necessary advertising data
- **User Consent:** Transparent data usage policies
- **Data Retention:** Appropriate data lifecycle management
- **Privacy Controls:** User opt-out and data deletion capabilities

---

## 13. Future Enhancements

### Planned Features
- **Advanced Analytics:** Enhanced performance reporting
- **A/B Testing:** Ad placement optimization
- **Machine Learning:** Automated ad placement recommendations
- **Mobile API:** Dedicated mobile application support

### Roadmap Timeline
- **Phase 1 (Current):** Basic API integration and sync
- **Phase 2 (Q2 2025):** Advanced analytics and reporting
- **Phase 3 (Q3 2025):** ML-powered optimization features
- **Phase 4 (Q4 2025):** Mobile application integration

---

## Conclusion

This Google Ads API integration represents a strategic enhancement to Naramakna.id's advertising infrastructure. The implementation ensures secure, scalable, and efficient management of advertising campaigns while maintaining high standards of user experience and system reliability.

The comprehensive design addresses current business needs while providing a foundation for future growth and feature expansion. Our commitment to best practices in security, performance, and compliance ensures a robust solution that aligns with Google's API policies and our business objectives.

---

**Document Version:** 1.0  
**Last Updated:** August 21, 2025  
**Prepared by:** Naramakna Technical Team  
**Contact:** naramaknaskt@gmail.com