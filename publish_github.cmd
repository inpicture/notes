
@echo off
echo ---------------------------------------------------
echo Preparing for GitHub Pages...
echo ---------------------------------------------------

:: Copy index.html to root so GitHub Pages finds it easily
copy "public\index.html" "index.html" >nul

:: Create CNAME for custom domain
echo inpicture.cloud>CNAME

:: Initialize Git if not already done
if not exist .git (
    git init
    git branch -M main
    git remote add origin https://github.com/inpicture/inpicture.cloud.git
) else (
    :: Ensure remote is correct
    git remote set-url origin https://github.com/inpicture/inpicture.cloud.git
)

:: Add and Commit
git add .
git commit -m "Update Leaf Notes Site"

:: Push
echo Pushing to GitHub...
git push -u origin main --force

echo.
echo ---------------------------------------------------
echo SUCCESS!
echo Now enable Pages in Settings:
echo https://github.com/inpicture/inpicture.cloud/settings/pages
echo Select 'main' branch and '/ (root)' folder.
echo ---------------------------------------------------
echo.
echo !!! DNS SETUP REQUIRED FOR HTTPS !!!
echo Go to Hostinger (hPanel -> DNS Zone Editor) and add these A Records:
echo    Type: A ^| Name: @ ^| Points to: 185.199.108.153
echo    Type: A ^| Name: @ ^| Points to: 185.199.109.153
echo    Type: A ^| Name: @ ^| Points to: 185.199.110.153
echo    Type: A ^| Name: @ ^| Points to: 185.199.111.153
echo.
echo Also add a CNAME record:
echo    Type: CNAME ^| Name: www ^| Points to: inpicture.github.io
echo ---------------------------------------------------
echo.
echo !!! HTTPS STILL UNAVAILABLE? !!!
echo 1. Wait: It can take up to 24 hours for the certificate to issue.
echo 2. Fix: In GitHub Pages Settings, clear the "Custom domain" field and Save.
echo    Then type "inpicture.cloud" again and Save. This forces a retry.
echo 3. Check: In Hostinger, DELETE any "AAAA" (IPv6) records if they exist.
echo ---------------------------------------------------
pause
