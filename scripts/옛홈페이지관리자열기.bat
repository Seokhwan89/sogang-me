@echo off
rem ============================================================
rem  Sogang ME - OLD homepage ADMIN opener  (2026-09, dept office)
rem  Double-click to open the OLD site's admin login in its own
rem  Edge window. No admin rights needed. Close when done.
rem  Login: ID admin  (PW는 인수인계 문서 참조)
rem ============================================================
echo.
echo   옛 기계공학과 홈페이지 "관리자" 화면을 새 창으로 엽니다...
echo   (로그인: admin / 비밀번호는 인수인계 문서 참조)
echo.
start msedge --user-data-dir="%TEMP%\me_old_profile" --host-resolver-rules="MAP me.sogang.ac.kr 183.110.224.211" --no-first-run "https://me.sogang.ac.kr/v2/adm"
timeout /t 3 >nul
