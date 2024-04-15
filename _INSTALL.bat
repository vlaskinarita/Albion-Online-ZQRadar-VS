@echo off
echo Installing necessary packages
echo.
echo npm install

@call npm install
call npm install -g express-generator@4
pause