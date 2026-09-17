# Wrapper to run the daily power-sector news refresh.
# Registered with Windows Task Scheduler (see scripts/register-news-task.ps1).
# Sets up PATH for Node, runs the refresh script, and appends a log.

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot   # ...\india-power-dashboard
$nodeDir     = 'C:\Program Files\nodejs'
$nodeExe     = Join-Path $nodeDir 'node.exe'
$script      = Join-Path $projectRoot 'scripts\refresh-news.mjs'
$logFile     = Join-Path $projectRoot 'scripts\refresh-news.log'

$env:Path = "$nodeDir;$env:Path"

$stamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
Add-Content -Path $logFile -Value "===== Run $stamp ====="

try {
    $output = & $nodeExe $script 2>&1
    Add-Content -Path $logFile -Value $output
    Add-Content -Path $logFile -Value "Exit code: $LASTEXITCODE`r`n"
} catch {
    Add-Content -Path $logFile -Value "ERROR: $($_.Exception.Message)`r`n"
}
