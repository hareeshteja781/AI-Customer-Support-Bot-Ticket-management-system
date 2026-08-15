@echo off
cd /d "%~dp0backend"
if not exist .venv\Scripts\python.exe (
  python -m venv .venv
)
call .venv\Scripts\activate.bat
if not exist .env copy .env.example .env >nul
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
