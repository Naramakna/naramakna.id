/**
 * Request Deduplication Middleware
 * 
 * Prevents duplicate concurrent requests from the same client
 * within a short time window (1 second by default)
 * 
 * This significantly reduces CPU load when a single page
 * makes multiple identical API calls simultaneously.
 */

const pendingRequests = new Map();

const requestDeduplication = (windowMs = 1000) => {
  return async (req, res, next) => {
    // Only deduplicate GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create unique key: IP + URL + Query params
    const key = `${req.ip}:${req.originalUrl || req.url}`;
    
    const pending = pendingRequests.get(key);
    
    // If there's already a pending request for this exact same endpoint
    if (pending && Date.now() - pending.timestamp < windowMs) {
      console.log(`🔄 Request DEDUPLICATED: ${key} (${pending.waiters.length + 1} waiters)`);
      
      // Add this response to the waiters list
      return new Promise((resolve) => {
        pending.waiters.push({ res, resolve });
      });
    }

    // This is a new unique request
    const requestData = {
      timestamp: Date.now(),
      waiters: [],
      completed: false
    };
    
    pendingRequests.set(key, requestData);

    // Intercept res.json to share response with all waiters
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    
    let statusCode = 200;
    
    res.status = function(code) {
      statusCode = code;
      return originalStatus(code);
    };
    
    res.json = function(body) {
      // Mark as completed
      requestData.completed = true;
      
      // Send response to all waiting requests
      if (requestData.waiters.length > 0) {
        console.log(`✅ Sending deduplicated response to ${requestData.waiters.length} waiters for: ${key}`);
        
        requestData.waiters.forEach(waiter => {
          waiter.res.status(statusCode).json(body);
          waiter.resolve();
        });
      }
      
      // Clean up after short delay
      setTimeout(() => {
        pendingRequests.delete(key);
      }, windowMs);
      
      return originalJson(body);
    };

    next();
  };
};

module.exports = requestDeduplication;
