@echo off
REM E2E Test Script for estore-angular Spring Boot Backend
REM This script will:
REM 1. Start Spring Boot backend
REM 2. Wait for readiness
REM 3. Test unauthorized access
REM 4. Stop backend

cd /d c:\Users\hp\Contacts\estore-angular\estore-backend

echo ================================================================
echo STEP 1: Start Spring Boot Backend
echo ================================================================

REM Get Maven availability
mvn --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Command: mvn spring-boot:run
    
    REM Kill any existing Java processes from previous runs
    taskkill /f /im java.exe >nul 2>&1
    
    REM Start Maven in new window
    start "estore-backend-server" /B mvn spring-boot:run > backend_startup.log 2>&1
    
    echo Key output: Backend process started in background
    echo Waiting 5 seconds for JVM startup...
    timeout /t 5 /nobreak >nul
) else (
    echo Maven not found, trying mvnw.cmd
    if exist mvnw.cmd (
        echo Command: mvnw.cmd spring-boot:run
        start "estore-backend-server" /B mvnw.cmd spring-boot:run > backend_startup.log 2>&1
        echo Key output: Backend process started in background
        timeout /t 5 /nobreak >nul
    ) else (
        echo ERROR: Neither mvn nor mvnw.cmd found
        exit /b 1
    )
)

REM Get the PID - find Java process running Spring Boot
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq java.exe" /FO LIST') do (
    if "%%i" neq "" set "BACKEND_PID=%%i"
)

echo PID=%BACKEND_PID%

echo.
echo ================================================================
echo STEP 2: Poll for backend readiness on localhost:8080
echo ================================================================

set "max_attempts=40"
set "attempt=0"

:poll_loop
set /a attempt=!attempt! + 1

if !attempt! gtr !max_attempts! (
    echo Key output: TIMEOUT - Backend did not respond after !max_attempts! attempts (120 seconds)
    echo Checking log file for errors...
    type backend_startup.log | findstr /i "error exception" | head -n 5
    goto test_unauthorized
)

curl -s -i http://localhost:8080/api/users/1 2>nul | findstr /R "^HTTP" >nul 2>&1
if !errorlevel! equ 0 (
    for /f "delims=" %%a in ('curl -s -i http://localhost:8080/api/users/1 2^>nul ^| findstr /R "^HTTP"') do (
        echo Key output: %%a
        goto test_unauthorized
    )
)

echo Attempt !attempt!/!max_attempts!: waiting...
timeout /t 3 /nobreak >nul
goto poll_loop

:test_unauthorized
echo.
echo ================================================================
echo STEP 3: Send HTTP request without Authorization
echo ================================================================

echo Command: curl -i http://localhost:8080/api/users/1

curl -i http://localhost:8080/api/users/1 > http_response.txt 2>&1
echo.
echo Key output [HTTP Status]:
findstr /R "^HTTP" http_response.txt

:step4
echo.
echo ================================================================
echo STEP 4: Capture authorization failure evidence
echo ================================================================

echo Key output [Response Body snippet]:
REM Show first 10 lines of response (header + first few body lines)
for /f "tokens=*" %%a in (http_response.txt) do (
    echo %%a
)

:step5
echo.
echo ================================================================
echo STEP 5: Stop backend process
echo ================================================================

if defined BACKEND_PID (
    echo Command: taskkill /PID %BACKEND_PID% /F
    taskkill /PID %BACKEND_PID% /F >nul 2>&1
    if %errorlevel% equ 0 (
        echo Key output: Process %BACKEND_PID% terminated successfully
    ) else (
        echo Key output: taskkill result: %errorlevel%
        REM Fallback: kill all Java
        taskkill /f /im java.exe >nul 2>&1
        echo Key output: Killed all java.exe processes
    )
) else (
    echo Could not determine PID, killing all java.exe processes
    taskkill /f /im java.exe >nul 2>&1
    echo Key output: Killed all java.exe processes
)

timeout /t 2 /nobreak >nul

:cleanup
echo.
echo ================================================================
echo Cleanup temp files
echo ================================================================

del /q backend_startup.log http_response.txt 2>nul
echo Key output: Temp files cleaned up

echo.
echo ================================================================
echo E2E Test Complete
echo ================================================================

endlocal
