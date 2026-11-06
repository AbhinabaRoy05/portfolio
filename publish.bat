@echo off
rem Double-click to publish your latest changes to GitHub (the live site updates in ~1 minute).
cd /d "%~dp0"
git add -A
git commit -m "Update portfolio" || echo Nothing new to commit.
git push
pause
