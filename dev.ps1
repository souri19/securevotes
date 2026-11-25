# SecureVote Local Development Launcher (Windows PowerShell)
# Starts both the FastAPI backend (port 8000) and Vite frontend (port 5173).

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "Starting SecureVote Backend on http://127.0.0.1:8001 ..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath (Join-Path $backendDir ".venv\Scripts\uvicorn.exe") `
  -ArgumentList "app.main:app --host 127.0.0.1 --port 8001" `
  -WorkingDirectory $backendDir -PassThru

Write-Host "Starting SecureVote Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "npm.cmd" `
  -ArgumentList "run dev -- --host 127.0.0.1 --port 5173" `
  -WorkingDirectory $frontendDir -PassThru

Write-Host ""
Write-Host "SecureVote is running:" -ForegroundColor Green
Write-Host "  App:     http://localhost:5173"
Write-Host "  API Doc: http://127.0.0.1:8001/docs"
Write-Host "Press Ctrl+C or close both windows to stop."

try {
  Wait-Process -Id $backendJob.Id, $frontendJob.Id
} finally {
  if (!$backendJob.HasExited) { Stop-Process -Id $backendJob.Id -Force }
  if (!$frontendJob.HasExited) { Stop-Process -Id $frontendJob.Id -Force }
}
