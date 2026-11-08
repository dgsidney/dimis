$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
if (-not $DesktopPath) {
    $DesktopPath = Join-Path $env:USERPROFILE "Desktop"
}
$ShortcutPath = Join-Path $DesktopPath "dimis.lnk"
$TargetPath = Join-Path $PSScriptRoot "node_modules\electron\dist\electron.exe"
$IconPath = Join-Path $PSScriptRoot "assets\icon.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.Arguments = "."
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "dimis - Multi WhatsApp Web para Windows"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()

Write-Host "Atalho atualizado com sucesso na Area de Trabalho: $ShortcutPath" -ForegroundColor Green
