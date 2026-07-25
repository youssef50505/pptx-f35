@echo off
echo Starting Presentation Server...
cd presentation

:: Start the browser and wait 1 second to ensure server is up
start http://localhost:8000

:: Start the local python web server
python -m http.server 8000
