@echo off
rem ================================================================
rem  Sogang ME - old homepage opener  (2026-09, dept office)
rem  Double-click to open the OLD department homepage in its own
rem  Edge window. No admin rights needed. Just close when done.
rem ================================================================
echo.
echo   옛 기계공학과 홈페이지를 새 창으로 엽니다...
echo   (이 창은 자동으로 닫힙니다. 다 보신 뒤 브라우저 창만 닫으면 됩니다)
echo.
start msedge --user-data-dir="%TEMP%\me_old_profile" --host-resolver-rules="MAP me.sogang.ac.kr 183.110.224.211" --no-first-run "http://me.sogang.ac.kr"
timeout /t 3 >nul
