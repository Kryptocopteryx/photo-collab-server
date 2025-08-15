@echo off
REM ===== CONFIG =====
set IMAGE_NAME=photo-collab
set PROJECT_ID=photo-collab-468610
set REGION=europe-west1
set SERVICE_NAME=photo-collab

REM === Copy frontend dist build into server public folder ===
xcopy "..\photo-collab\dist\*" "public\" /E /H /C /Y

REM Optional: Auto-generate a timestamp tag (for rollback ability)
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set DATE=%%d-%%b-%%a
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set TIME=%%a%%b
)
set TAG=%DATE%-%TIME%

REM Remove special characters
set TAG=%TAG:/=-%
set TAG=%TAG::=-%
set TAG="latest"

echo Deploying version: %TAG%

REM ===== BUILD =====
docker build -t gcr.io/%PROJECT_ID%/%IMAGE_NAME%:%TAG% .

REM ===== PUSH =====
docker push gcr.io/%PROJECT_ID%/%IMAGE_NAME%:%TAG%

REM ===== DEPLOY =====
gcloud run deploy %SERVICE_NAME% ^
  --image gcr.io/%PROJECT_ID%/%IMAGE_NAME%:%TAG% ^
  --region %REGION%

echo.
echo ✅ Deployment finished!
pause
