
@echo off
echo ---------------------------------------------------
echo HOSTINGER DNS SETUP & DIAGNOSTICS
echo ---------------------------------------------------
echo.
echo [STEP 1] Opening Hostinger DNS Panel...
start https://hpanel.hostinger.com/
echo.
echo [STEP 2] Opening DNS Checker (Check if IPs match 185.199.108.153)...
start https://www.whatsmydns.net/#A/inpicture.cloud
echo.
echo ---------------------------------------------------
echo CRITICAL CHECKLIST FOR HTTPS:
echo ---------------------------------------------------
echo 1. DELETE ALL "AAAA" records. (IPv6 causes HTTPS errors)
echo 2. DELETE ALL "CAA" records. (Can block certificates)
echo 3. Ensure only these 4 A records exist for '@':
echo    185.199.108.153
echo    185.199.109.153
echo    185.199.110.153
echo    185.199.111.153
echo.
echo 4. Ensure "www" CNAME points to "inpicture.github.io"
echo.
echo ---------------------------------------------------
pause
