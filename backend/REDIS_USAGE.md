# Redis Caching Implementation

## Files Created
1. `/src/config/redis.js` - Redis connection configuration
2. `/src/middleware/cache.js` - Caching middleware
3. `.env` - Added Redis configuration

## How to Use Redis Caching

### 1. Import the middleware
```javascript
const { cacheMiddleware, clearCache } = require('./middleware/cache');
```

### 2. Apply to routes
```javascript
// Cache for 5 minutes (300 seconds)
router.get('/ API', cacheMiddleware(300), controller.getArticles);

// Cache for 1 hour (3600 seconds)
router.get('/trending', cacheMiddleware(3600), controller.getTrending);

// Cache for 10 minutes (default if no duration specified)
router.get('/categories', cacheMiddleware(), controller.getCategories);
```

### 3. Clear cache when data changes
```javascript
// In your POST/PUT/DELETE controllers
const { clearCache } = require('../middleware/cache');

// Clear specific cache
await clearCache('cache:/api/articles*');

// Clear all caches
await clearCache('cache:*');
```

## Example Implementation

```javascript
// routes/articles.js
const express = require('express');
const router = express.Router();
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const articlesController = require('../controllers/articlesController');

// GET routes with caching
router.get('/articles', cacheMiddleware(300), articlesController.getAll);
router.get('/articles/:id', cacheMiddleware(600), articlesController.getById);

// POST/PUT/DELETE routes clear cache
router.post('/articles', async (req, res) => {
  await articlesController.create(req, res);
  await clearCache('cache:/api/articles*');
});

router.put('/articles/:id', async (req, res) => {
  await articlesController.update(req, res);
  await clearCache(`cache:/api/articles*`);
});

router.delete('/articles/:id', async (req, res) => {
  await articlesController.delete(req, res);
  await clearCache('cache:/api/articles*');
});
```

## Benefits
- ✅ Reduces database queries
- ✅ Prevents connection pool exhaustion
- ✅ Faster response times
- ✅ Lower server load
- ✅ Better scalability

## Installation Steps Completed
1. ✅ Redis server installed and running
2. ✅ ioredis added to package.json
3. ✅ Redis config created
4. ✅ Caching middleware created
5. ✅ .env configured

## Next Steps
1. Install ioredis: `npm install` (run as www-data user)
2. Apply caching to your routes (see examples above)
3. Restart backend: `kill <PID> && node server.js`
4. Monitor Redis: `redis-cli monitor`
5. Check cache stats: `redis-cli info stats`
