@echo off
cd /d "%~dp0"
if not exist "apps\mobile\dist\index.html" (
  echo Preparando a build do Only Barber...
  call node scripts\ensure-dependencies.mjs
  if errorlevel 1 goto :error
  call npm run build:web
  if errorlevel 1 goto :error
)
echo Abrindo Only Barber...
call npm run preview:web
goto :eof

:error
echo.
echo Nao foi possivel preparar o aplicativo. Confira as mensagens acima.
pause
exit /b 1
