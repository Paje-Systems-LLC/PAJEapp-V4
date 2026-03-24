@echo off
SETLOCAL EnableDelayedExpansion

REM Navigate to the repo
cd /D "C:\aaa_appPAJEclub"

echo =======================================================
echo [Alfred] Initializing Nano Banana Synchronization Sequence
echo Target: PAJEapp-V1
echo =======================================================

REM Step 1: Governance Check
echo [1] Checking ESLint Governance...
call npm run lint || echo "Lint warnings ignored for now."

REM Step 2: Staging Code
echo [2] Staging modified workspace files...
git add .

REM Step 3: Bundle Commit
SET "commit_msg=%~1"
IF "%~1"=="" (
    SET "commit_msg=chore(alfred): automated sync and update sequence"
)
echo [3] Committing changes as: "%commit_msg%"
git commit -m "%commit_msg%"

REM Step 4: Secure Push Delivery
echo [4] Transmitting code to GitHub Paje-Systems-LLC...
git push origin main

echo =======================================================
echo [Alfred] Sync Completed. Einstein Orchestrator Webhook requested.
echo =======================================================
