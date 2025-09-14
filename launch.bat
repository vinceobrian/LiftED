@echo off
echo Starting LiftED - Student Crowdfunding Platform...
echo.
echo Opening in your default browser...
echo.

REM Try to start with npm if available
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo Using npm to start the server...
    npm start
) else (
    echo npm not found, opening index.html directly...
    start index.html
)

echo.
echo LiftED is now running!
echo If the browser didn't open automatically, navigate to:
echo http://localhost:3000
echo.
pause
