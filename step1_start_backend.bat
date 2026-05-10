@echo off
setlocal enabledelayedexpansion

cd /d c:\Users\hp\Contacts\estore-angular\estore-backend

echo === STEP 1: Start Spring Boot Backend ===

REM Try to find java
java -version > nul 2>&1
if %errorlevel% equ 0 (
    echo Java found
) else (
    echo Java not found - checking PATH
    echo %PATH%
)

REM Try Maven
mvn --version > nul 2>&1
if %errorlevel% equ 0 (
    echo Maven found
    REM Check if already running
    tasklist | find /i "java" > nul
    if %errorlevel% equ 0 (
        echo Java process already running - killing it first
        taskkill /f /im java.exe
    )
    
    echo Starting: mvn spring-boot:run
    start "estore-backend" mvn spring-boot:run
    echo Command: mvn spring-boot:run
    echo Key output: Backend process started
    timeout /t 15
) else (
    echo Maven not found
)
