
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
echo !!! HTTPS FIX (THE "KICK") !!!
echo If DNS is correct but HTTPS says "Unavailable":
echo 1. Go to GitHub Pages Settings.
echo 2. Click "Remove" next to Custom Domain (or delete text and Save).
echo 3. Wait 2 minutes.
echo 4. Type "inpicture.cloud" back in and Save.
echo    (This forces GitHub to re-check DNS and issue the certificate)
echo ---------------------------------------------------
pause
