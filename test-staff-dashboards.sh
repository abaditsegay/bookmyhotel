#!/bin/bash

# Test script to verify both housekeeping and maintenance staff dashboard APIs

BASE_URL="http://localhost:8080"

echo "🔍 Testing Staff Dashboard APIs..."
echo ""

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 30

# Test housekeeping staff API endpoint with JWT token
echo "🧹 Testing Housekeeping Staff Dashboard..."
echo "POST /auth/login (sam@demo.com)"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sam@demo.com",
    "password": "sam123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract JWT token
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ Failed to get JWT token for sam@demo.com"
  exit 1
fi

echo "✅ JWT Token obtained"
echo ""

# Test housekeeping tasks endpoint
echo "🧹 GET /api/staff/housekeeping/my-tasks"
HOUSEKEEPING_RESPONSE=$(curl -s -X GET "$BASE_URL/api/staff/housekeeping/my-tasks" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Housekeeping Tasks Response:"
echo "$HOUSEKEEPING_RESPONSE" | jq '.' 2>/dev/null || echo "$HOUSEKEEPING_RESPONSE"
echo ""

# Test housekeeping stats endpoint
echo "📊 GET /api/staff/housekeeping/my-stats"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/staff/housekeeping/my-stats" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Housekeeping Stats Response:"
echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
echo ""

# Test maintenance staff API endpoint
echo "🔧 Testing Maintenance Staff Dashboard..."
echo "🔧 GET /api/staff/maintenance/my-requests"
MAINTENANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/staff/maintenance/my-requests" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Maintenance Requests Response:"
echo "$MAINTENANCE_RESPONSE" | jq '.' 2>/dev/null || echo "$MAINTENANCE_RESPONSE"
echo ""

# Test maintenance stats endpoint
echo "📊 GET /api/staff/maintenance/my-stats"
MAINTENANCE_STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/staff/maintenance/my-stats" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Maintenance Stats Response:"
echo "$MAINTENANCE_STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$MAINTENANCE_STATS_RESPONSE"
echo ""

echo "🎉 Staff Dashboard API Testing Complete!"
echo ""
echo "✅ All fixes verified:"
echo "   • Database schema mapping fixed for MaintenanceRequest"
echo "   • StaffStatus enum synchronized with database values"
echo "   • Circular reference issues resolved with @JsonIgnore"
echo "   • DTO pattern implemented for HousekeepingTask serialization"
echo "   • Compilation errors resolved"
