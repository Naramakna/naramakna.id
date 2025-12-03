#!/usr/bin/env node

import jwt from 'jsonwebtoken';

// Your token from the curl command
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoic3VwZXJhZG1pbkBuYXJhbWFrbmEuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImxvZ2luIjoic3VwZXJhZG1pbiIsImlhdCI6MTc1NTExMTg2NiwiZXhwIjoxNzU1NzE2NjY2fQ.gRp6ZPUKG-JYtB9rRwDR4Tkk-ZOCOZfgA74v1pgsCrQ';

console.log('🔍 Token Analysis\n');

try {
  // Decode without verification to see contents
  const decoded = jwt.decode(token);
  console.log('📋 Token Contents:', JSON.stringify(decoded, null, 2));
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(decoded.exp * 1000);
  const issuedAt = new Date(decoded.iat * 1000);
  
  console.log('\n⏰ Time Info:');
  console.log('  Current time:', new Date().toISOString());
  console.log('  Token issued:', issuedAt.toISOString());
  console.log('  Token expires:', expiresAt.toISOString());
  console.log('  Is expired?', now > decoded.exp ? '❌ YES' : '✅ NO');
  console.log('  Time until expiry:', Math.round((decoded.exp - now) / 3600), 'hours');
  
  // Try to verify with different secrets
  const possibleSecrets = [
    'fallback-secret',
    process.env.JWT_SECRET,
    'your-jwt-secret',
    'development-secret'
  ];
  
  console.log('\n🔐 Verification Tests:');
  for (const secret of possibleSecrets) {
    if (!secret) continue;
    try {
      const verified = jwt.verify(token, secret);
      console.log(`  ✅ SUCCESS with secret: "${secret}"`);
      console.log('    Verified payload:', JSON.stringify(verified, null, 4));
      break;
    } catch (error) {
      console.log(`  ❌ FAILED with secret: "${secret}" - ${error.message}`);
    }
  }
  
} catch (error) {
  console.error('❌ Error analyzing token:', error.message);
}

console.log('\n🧪 Testing curl commands:\n');

// Test different endpoints
const testCommands = [
  {
    name: 'Test API Health',
    cmd: `curl -X GET http://dev.naramakna.id/api/ -v`
  },
  {
    name: 'Test Auth Profile (Cookie)',
    cmd: `curl -X GET http://dev.naramakna.id/api/auth/profile \\
  -H "Cookie: token=${token}" \\
  -v`
  },
  {
    name: 'Test Auth Profile (Bearer)',
    cmd: `curl -X GET http://dev.naramakna.id/api/auth/profile \\
  -H "Authorization: Bearer ${token}" \\
  -v`
  },
  {
    name: 'Test Upload Image',
    cmd: `curl -X POST http://dev.naramakna.id/api/writer/upload-image \\
  -H "Cookie: token=${token}" \\
  -F "image=@Tupai-80x80.jpg" \\
  -v`
  }
];

testCommands.forEach(test => {
  console.log(`## ${test.name}:`);
  console.log(test.cmd);
  console.log('');
});

console.log('💡 Debugging Tips:');
console.log('1. Make sure backend server is running on port 3001');
console.log('2. Check that database connection is working');
console.log('3. Verify JWT_SECRET environment variable matches');
console.log('4. Check nginx configuration if using reverse proxy');
console.log('5. Ensure CORS headers are properly configured');
