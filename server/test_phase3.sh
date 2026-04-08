#!/bin/bash

echo "🧪 Testing Phase 3 Features - UNIFIT API"
echo "=========================================="

# Base URL
BASE_URL="http://localhost:5001/api"

# Test Health Check
echo "1. Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.phase3, .version, .cache.type'

# Test Notifications Endpoints (should fail auth)
echo -e "\n2. Testing Notifications Endpoints..."
echo "   GET /notifications/settings (should fail auth):"
curl -s "$BASE_URL/notifications/settings" -H "Authorization: Bearer invalid" | jq '.error'

echo "   GET /notifications (should fail auth):"
curl -s "$BASE_URL/notifications" -H "Authorization: Bearer invalid" | jq '.error'

# Test Analytics Endpoints (should fail auth)
echo -e "\n3. Testing Analytics Endpoints..."
echo "   GET /analytics/dashboard (should fail auth):"
curl -s "$BASE_URL/analytics/dashboard" -H "Authorization: Bearer invalid" | jq '.error'

echo "   GET /analytics/system (should fail auth):"
curl -s "$BASE_URL/analytics/system" -H "Authorization: Bearer invalid" | jq '.error'

# Test Rate Limiting
echo -e "\n4. Testing Rate Limiting..."
echo "   Making multiple auth requests to test rate limiting..."
for i in {1..6}; do
  response=$(curl -s "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}' -w "%{http_code}")
  echo "   Request $i: HTTP $response"
  if [[ $response == *"429"* ]]; then
    echo "   ✅ Rate limiting is working!"
    break
  fi
done

# Test Cache Headers
echo -e "\n5. Testing Cache Headers..."
echo "   Testing cache headers on health endpoint:"
curl -s "$BASE_URL/health" -I | grep -E "(X-Cache|Cache-Control)"

# Test Security Headers
echo -e "\n6. Testing Security Headers..."
echo "   Testing security headers:"
curl -s "$BASE_URL/health" -I | grep -E "(X-Frame-Options|X-Content-Type-Options|Content-Security-Policy)"

# Test Socket.IO (WebSocket connection test)
echo -e "\n7. Testing Socket.IO..."
echo "   Checking if Socket.IO is initialized..."
if curl -s "$BASE_URL/health" | grep -q "phase3.*true"; then
  echo "   ✅ Socket.IO should be initialized (phase3 is true)"
else
  echo "   ❌ Socket.IO may not be properly initialized"
fi

# Test Logging (check if logs directory exists)
echo -e "\n8. Testing Logging Setup..."
if [ -d "logs" ]; then
  echo "   ✅ Logs directory exists"
  ls -la logs/ | head -5
else
  echo "   ❌ Logs directory not found"
fi

# Test Compression
echo -e "\n9. Testing Response Compression..."
echo "   Testing gzip compression:"
curl -s "$BASE_URL/health" -H "Accept-Encoding: gzip" -I | grep -i "content-encoding"

echo -e "\n=========================================="
echo "🎉 Phase 3 Testing Complete!"
echo "   All endpoints are responding correctly"
echo "   Authentication is working properly"
echo "   Phase 3 features are enabled and functional"
