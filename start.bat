@echo off
REM Quick Start Script for PaliGemma Image-to-Text Application

echo ========================================
echo PaliGemma Image-to-Text Generator
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "C:\Users\Administrator\anaconda3\envs\Image-to-text_generation_with_BLIP-2\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please create environment first:
    echo   conda create -n Image-to-text_generation_with_BLIP-2 python=3.12
    pause
    exit /b 1
)

echo [1/4] Activating virtual environment...
call C:\Users\Administrator\anaconda3\envs\Image-to-text_generation_with_BLIP-2\Scripts\activate.bat

echo [2/4] Checking Python version...
python --version

echo [3/4] Testing model loading...
echo This may take 15-45 minutes on first run (downloading ~11GB model)
python test_model.py

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo Model test failed!
    echo ========================================
    echo.
    echo Please check:
    echo - Internet connection
    echo - Available disk space (20GB+ needed)
    echo - Run: pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo ========================================
echo [4/4] Starting application...
echo ========================================
echo.
echo Application will be available at:
echo http://127.0.0.1:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
