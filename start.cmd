@echo off
cd /d "%~dp0"
set "PATH=%PATH%;C:\Program Files\nodejs"
echo Starting PRH Family Hub...
start "" http://localhost:4000
node server.js
pause
