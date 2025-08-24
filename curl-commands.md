# Naramakna API - cURL Test Commands

Base URL: `https://api.naramakna.id/api`

## 🔐 Authentication

### Register New User
```bash
curl -X POST "https://api.naramakna.id/api/auth/register" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "user_login": "testuser123",
    "user_email": "test123@example.com", 
    "user_pass": "password123",
    "display_name": "Test User",
    "role_request": "user"
  }' | jq
```

### Login User  
```bash
curl -X POST "https://api.naramakna.id/api/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "identifier": "admin@naramakna.id",
    "user_pass": "admin123",
    "remember_me": true
  }' | jq
```

### Get User Profile (Protected)
```bash
curl "https://api.naramakna.id/api/auth/profile" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq
```

### Update Profile  
```bash
curl -X PUT "https://api.naramakna.id/api/auth/profile" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "display_name": "Updated Name",
    "bio": "Updated bio"
  }' | jq
```

### Logout
```bash
curl -X POST "https://api.naramakna.id/api/auth/logout" \
  -H "Content-Type: application/json" \
  -b cookies.txt | jq
```

## 📰 Content

### Get Content Feed
```bash
curl "https://api.naramakna.id/api/content/feed?limit=5&type=post" \
  -b cookies.txt | jq
```

### Get Trending Content
```bash
curl "https://api.naramakna.id/api/content/trending?limit=5&type=post" \
  -b cookies.txt | jq  
```

### Get Categories
```bash
curl "https://benarmakna.naramakna.id/api/content/categories?limit=10&mainCategoriesOnly=true" \
  -b cookies.txt | jq
```

### Search Content
```bash
curl "https://api.naramakna.id/api/content/search?q=teknologi&limit=3" \
  -b cookies.txt | jq
```

### Get Single Article
```bash
curl "https://api.naramakna.id/api/content/article/123" \
  -b cookies.txt | jq
```

## 📢 Advertisements

### Get Ads by Placement
```bash
curl "https://api.naramakna.id/api/ads/serve?placement=regular&limit=3" \
  -b cookies.txt | jq
```

### Get Popup Ads
```bash  
curl "https://api.naramakna.id/api/ads/popup-active" \
  -b cookies.txt | jq
```

## 🗳️ Polling

### Get Active Polls
```bash
curl "https://api.naramakna.id/api/polling/active?limit=5" \
  -b cookies.txt | jq
```

### Vote on Poll
```bash
curl -X POST "https://api.naramakna.id/api/polling/vote" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "poll_id": 1,
    "option_id": 2
  }' | jq
```

## 📺 Videos

### Get YouTube Videos  
```bash
curl "https://api.naramakna.id/api/youtube/public?limit=3" \
  -b cookies.txt | jq
```

### Get TikTok Videos
```bash
curl "https://api.naramakna.id/api/tiktok/videos?limit=3" \
  -b cookies.txt | jq  
```

## 📊 Analytics

### Track Page View
```bash
curl -X POST "https://api.naramakna.id/api/analytics/track" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "event_type": "page_view", 
    "page_url": "/test-page",
    "page_title": "Test Page",
    "referrer": "https://google.com"
  }' | jq
```

### Get Dashboard Stats (Admin)
```bash
curl "https://api.naramakna.id/api/analytics/dashboard-stats" \
  -b cookies.txt | jq
```

## 👑 Admin Endpoints

### Get All Users (Admin)
```bash  
curl "https://api.naramakna.id/api/admin/users?limit=5" \
  -b cookies.txt | jq
```

### Update User Role (Admin)
```bash
curl -X PUT "https://api.naramakna.id/api/admin/users/123" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "user_role": "writer", 
    "user_status": "active"
  }' | jq
```

## 🌐 CORS Testing

### Test CORS Preflight
```bash
curl -X OPTIONS "https://api.naramakna.id/api/auth/login" \
  -H "Origin: https://naramakna.id" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### Test CORS with Origin Header
```bash  
curl -H "Origin: https://naramakna.id" \
  "https://api.naramakna.id/api/content/feed" -v
```

## 🔧 Debug Commands

### Check API Status
```bash
curl "https://api.naramakna.id/api" | jq
```

### Check Headers Only
```bash
curl -I "https://api.naramakna.id/api/content/feed"
```

### Verbose Output  
```bash
curl "https://api.naramakna.id/api/auth/profile" -b cookies.txt -v
```

---

## 📝 Usage Notes

1. **Cookie Management**: Use `-c cookies.txt` to save cookies and `-b cookies.txt` to send cookies
2. **JSON Output**: Add `| jq` for pretty JSON formatting  
3. **Headers**: Use `-H "Content-Type: application/json"` for POST requests
4. **Verbose**: Add `-v` flag to see full request/response headers
5. **Origin Testing**: Add `-H "Origin: https://naramakna.id"` to test CORS

## 🚀 Quick Test Sequence

```bash
# 1. Login and save cookies
curl -X POST "https://api.naramakna.id/api/auth/login" \
  -H "Content-Type: application/json" -c cookies.txt \
  -d '{"identifier":"admin@naramakna.id","user_pass":"admin123"}' | jq

# 2. Test protected endpoint  
curl "https://api.naramakna.id/api/auth/profile" -b cookies.txt | jq

# 3. Get content
curl "https://api.naramakna.id/api/content/feed?limit=3" -b cookies.txt | jq

# 4. Logout
curl -X POST "https://api.naramakna.id/api/auth/logout" -b cookies.txt | jq
```