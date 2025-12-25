
@echo off
echo ---------------------------------------------------
echo CLOUDFLARE MIGRATION ASSISTANT
echo ---------------------------------------------------
echo.
echo [STEP 1] Create Cloudflare Account
echo    Go to https://dash.cloudflare.com/sign-up
echo.
echo [STEP 2] Add Site
echo    Click "Add a Site" -> Enter "inpicture.cloud" -> Select "Free" plan.
echo.
echo [STEP 3] Update Nameservers (Hostinger)
echo    1. Copy the 2 nameservers Cloudflare gives you.
echo    2. Go to Hostinger -> Domains -> inpicture.cloud -> DNS / Nameservers.
echo    3. Change Nameservers to "Custom" and paste the Cloudflare ones.
echo.
echo [STEP 4] Configure Cloudflare DNS
echo    1. In Cloudflare, go to DNS -> Records.
echo    2. DELETE all existing A/AAAA/CNAME records for root (@) and www.
echo    3. Add Record: Type=CNAME | Name=@   | Target=inpicture.github.io | Proxy=On
echo    4. Add Record: Type=CNAME | Name=www | Target=inpicture.github.io | Proxy=On
echo.
echo [STEP 5] SSL Mode
echo    Go to SSL/TLS -> Set to "Full".
echo.
echo ---------------------------------------------------
pause
