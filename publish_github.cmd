
@echo off
echo ---------------------------------------------------
echo UPDATING GITHUB PAGES
echo ---------------------------------------------------
echo.
echo IMPORTANT: Did you run 'notes.py' to generate the new HTML?
echo If not, close this and run the Python script first!
echo.
timeout /t 2

echo 1. Copying latest HTML...
copy /Y "public\index.html" "index.html"

echo 2. Setting CNAME...
echo inpicture.cloud>CNAME

echo 3. Configuring Git...
if not exist .git (
    git init
    git branch -M main
    git remote add origin https://github.com/inpicture/notes.git
) else (
    git remote set-url origin https://github.com/inpicture/notes.git
)

echo 4. Staging & Committing...
git config user.email "auto@leafnotes.app"
git config user.name "Leaf Notes Auto"
git add .
git commit -m "Update Site %date% %time%"

echo 5. Pushing...
git push -u origin main --force

echo.
echo ---------------------------------------------------
echo SUCCESS!
echo Check your site: https://github.com/inpicture/notes
echo (Updates may take 1-2 minutes to appear)
echo ---------------------------------------------------
pause
