param([Parameter(Mandatory=$true)][string]$ProjectRoot)
$ErrorActionPreference='Stop'
$projectPath=(Resolve-Path -LiteralPath $ProjectRoot).Path
if(-not (Test-Path -LiteralPath (Join-Path $projectPath 'go.mod'))){throw 'ProjectRoot must be the ONpoint Go project root.'}
$sourcePath=Join-Path $PSScriptRoot 'dist'
$targetPath=Join-Path $projectPath 'dist/story'
New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
Get-ChildItem -LiteralPath $sourcePath -File | Copy-Item -Destination $targetPath -Force
Write-Host "Installed story files: $targetPath"
Write-Host 'Start ONpoint normally, then open /story/index.html. The original workbench remains at /.'
