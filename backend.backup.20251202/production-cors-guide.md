# Production CORS Configuration Guide

## Updated CORS Setup ✅

The CORS configuration has been updated to handle both development and production environments safely.

### What Changed:

1. **Dynamic Origin Checking** - Now uses a function to validate allowed origins
2. **Production Domain Support** - Pre-configured for `naramakna.id` and `www.naramakna.id`
3. **Cloudflare Tunnel Ready** - Easy to add your tunnel domain
4. **Environment Variable Support** - Can override via `CORS_ORIGIN` env variable

### For Production Deployment:

#### Option 1: Add Cloudflare Tunnel Domain to Code
When you get your Cloudflare tunnel domain, uncomment and update line 33 in `app.js`:
```javascript
// Change this line:
// 'https://your-tunnel-domain.cloudflareaccess.com'

// To your actual tunnel domain:
'https://amazing-tunnel-123.cloudflareaccess.com'
```

#### Option 2: Use Environment Variable (Recommended)
Set the `CORS_ORIGIN` environment variable on your server:
```bash
# In your production .env file:
CORS_ORIGIN=https://your-tunnel-domain.cloudflareaccess.com,https://naramakna.id,https://www.naramakna.id
```

### Security Features:

✅ **Origin Validation** - Only allows specific domains
✅ **Development/Production Split** - Different configs for different environments  
✅ **Warning Logs** - Logs blocked CORS attempts for monitoring
✅ **Flexible Configuration** - Easy to add new domains via environment variables

### Testing in Production:

1. Deploy your backend
2. Set up Cloudflare tunnel pointing to your backend
3. Update the frontend API URL to use your tunnel domain
4. Add your tunnel domain to the CORS config
5. Test all API endpoints including PATCH requests

### Common Issues & Solutions:

- **CORS Error in Production**: Add your exact domain to `allowedOrigins` array
- **Subdomain Issues**: Make sure both `domain.com` and `www.domain.com` are included
- **Cloudflare Errors**: Ensure tunnel is properly configured and domain is added to CORS

The configuration is now production-ready and should work smoothly with Cloudflare tunnel! 🚀
