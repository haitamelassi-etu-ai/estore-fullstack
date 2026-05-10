@echo off
setlocal enabledelayedexpansion

echo === STEP 1: Start Spring Boot Backend ===
cd /d c:\Users\hp\Contacts\estore-angular\estore-backend

REM Check if Maven is available
mvn -v >nul 2>&1
if %errorlevel% equ 0 (
    echo Command: mvn spring-boot:run
    REM Start Maven in background
    start "Spring Boot Backend" /B mvn spring-boot:run > backend.log 2>&1
    REM Get the PID of the last started process
    for /f "tokens=2" %%A in ('tasklist /FI "WINDOWTITLE eq Spring Boot Backend" /FO LIST 2^>nul') do set "BackendPID=%%A"
    REM Alternative: use wmic to get the process ID
    for /f "tokens=2 delims==" %%A in ('wmic process list brief /format:list ^| find "mvn"') do set BackendPID=%%A
    echo Key output: Process started with PID !BackendPID!
    echo PID=!BackendPID!
) else (
    echo Maven not found, checking for mvnw.cmd...
    if exist mvnw.cmd (
        echo Found mvnw.cmd
        echo Command: mvnw.cmd spring-boot:run
        start "Spring Boot Backend" /B mvnw.cmd spring-boot:run > backend.log 2>&1
        for /f "tokens=2 delims==" %%A in ('wmic process list brief /format:list ^| find "mvnw"') do set BackendPID=%%A
        echo Key output: Process started with PID !BackendPID!
        echo PID=!BackendPID!
    ) else (
        echo Neither mvn nor mvnw.cmd found!
        exit /b 1
    )
)

REM Save PID to file for later cleanup
echo !BackendPID! > backend.pid

timeout /t 3 /nobreak

echo.
echo === STEP 2: Poll for backend readiness on localhost:8080 ===
set "max_attempts=30"
set "attempt=0"

:poll_loop
set /a attempt+=1
if %attempt% gtr %max_attempts% (
    echo Key output: TIMEOUT - Backend did not become ready after %max_attempts% attempts
    goto step3
)

REM Use curl to check if backend is ready
curl -s -i http://localhost:8080/api/users/1 > curl_response.txt 2>&1
if %errorlevel% equ 0 (
    REM Check for HTTP status in response
    findstr /R "HTTP/1.1 HTTP/2" curl_response.txt >nul
    if !errorlevel! equ 0 (
        echo Attempt %attempt%: Backend is responding
        type curl_response.txt | findstr /R "^HTTP" 
        echo Key output: Backend ready after %attempt% attempts
        goto step3
    )
)

timeout /t 1 /nobreak
goto poll_loop

:step3
echo.
echo === STEP 3: Send HTTP request without Authorization ===
echo Command: curl -i http://localhost:8080/api/users/1
curl -i http://localhost:8080/api/users/1 > step3_response.txt 2>&1
type step3_response.txt
REM Extract first line (HTTP status)
for /f "delims=" %%A in ('findstr /R "^HTTP" step3_response.txt') do (
    echo Key output: %%A
    goto step4
)

:step4
echo.
echo === STEP 4: Capture HTTP response for unauthorized check ===
REM Show first few lines of response body
echo Key output [Response snippet]:
for /f "tokens=1,2" %%A in (step3_response.txt) do (
    if "%%A" neq "" (
        echo %%A %%B
    )
)

echo.
echo === STEP 5: Stop backend process ===
if exist backend.pid (
    set /p BackendPID=<backend.pid
    echo Command: taskkill /PID !BackendPID! /F
    taskkill /PID !BackendPID! /F
    if %errorlevel% equ 0 (
        echo Key output: Process !BackendPID! terminated successfully
    ) else (
        echo Key output: Failed to terminate process !BackendPID!
    )
)

echo.
echo === Cleanup temp files ===
del /q backend.log backend.err backend.pid curl_response.txt step3_response.txt 2>nul
echo Key output: Temp files cleaned up

endlocal
