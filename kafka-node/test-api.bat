@echo off
REM Quick Test Script for Kafka Messaging Application (Windows Batch)
REM Tests all API endpoints
REM Requires: jq (JSON query tool) - install via chocolatey: choco install jq

setlocal enabledelayedexpansion

set "API_URL=http://localhost:3000"
set "SENDER_NAME=TestClient"

echo.
echo 🧪 Testing Kafka Messaging Application API
echo ==================================
echo.

REM Test 1: Health Check
echo 1️⃣  Testing Health Check...
curl -s "%API_URL%/api/health"
echo.
echo.

REM Test 2: Send a message
echo 2️⃣  Sending a test message...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
curl -s -X POST "%API_URL%/api/send" ^
  -H "Content-Type: application/json" ^
  -d "{\"content\": \"Hello from API test at %mydate% %mytime%\", \"sender\": \"%SENDER_NAME%\"}"
echo.
echo.

REM Test 3: Get all messages
echo 3️⃣  Fetching all messages...
curl -s "%API_URL%/api/messages"
echo.
echo.

REM Test 4: Send multiple messages
echo 4️⃣  Sending multiple test messages...
for /L %%i in (1,1,3) do (
  echo   Sending message %%i...
  curl -s -X POST "%API_URL%/api/send" ^
    -H "Content-Type: application/json" ^
    -d "{\"content\": \"Test message #%%i\", \"sender\": \"%SENDER_NAME%\"}" >nul
  timeout /t 1 /nobreak >nul
)
echo   ✓ Done
echo.
echo.

REM Test 5: Get messages again
echo 5️⃣  Fetching messages again...
curl -s "%API_URL%/api/messages"
echo.
echo.

REM Test 6: Clear messages
echo 6️⃣  Clearing all messages...
curl -s -X POST "%API_URL%/api/clear"
echo.
echo.

echo ✅ Testing Complete!
echo.
echo 💡 Open http://localhost:3000 in your browser to see the UI
echo.

pause
