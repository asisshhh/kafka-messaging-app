#!/bin/bash
# Quick Test Script for Kafka Messaging Application
# Tests all API endpoints

API_URL="http://localhost:3000"
SENDER_NAME="TestClient"

echo "🧪 Testing Kafka Messaging Application API"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$API_URL/api/health" | jq . || echo "FAILED"
echo ""

# Test 2: Send a message
echo "2️⃣  Sending a test message..."
curl -s -X POST "$API_URL/api/send" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Hello from API test at $(date)\", \"sender\": \"$SENDER_NAME\"}" | jq . || echo "FAILED"
echo ""

# Test 3: Get all messages
echo "3️⃣  Fetching all messages..."
curl -s "$API_URL/api/messages" | jq . || echo "FAILED"
echo ""

# Test 4: Send multiple messages
echo "4️⃣  Sending multiple test messages..."
for i in {1..3}; do
  echo "  Sending message $i..."
  curl -s -X POST "$API_URL/api/send" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Test message #$i\", \"sender\": \"$SENDER_NAME\"}" > /dev/null
  sleep 0.5
done
echo "  ✓ Done"
echo ""

# Test 5: Get messages again
echo "5️⃣  Fetching messages again..."
curl -s "$API_URL/api/messages" | jq . || echo "FAILED"
echo ""

# Test 6: Clear messages
echo "6️⃣  Clearing all messages..."
curl -s -X POST "$API_URL/api/clear" | jq . || echo "FAILED"
echo ""

echo "✅ Testing Complete!"
echo ""
echo "💡 Open http://localhost:3000 in your browser to see the UI"
