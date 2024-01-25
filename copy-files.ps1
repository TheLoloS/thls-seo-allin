# copy-files.ps1
$sourceFolder = ".\urban-vpn"
$destinationFolder = ".\build"

# Sprawdź, czy folder docelowy istnieje
if (-not (Test-Path $destinationFolder)) {
    New-Item -ItemType Directory -Path $destinationFolder | Out-Null
}

# Skopiuj cały folder wraz z zawartością
Copy-Item -Recurse -Force -Path $sourceFolder -Destination $destinationFolder

# Skopiuj również plik config.json
Copy-Item .\config.json $destinationFolder -Force

Write-Host "Folder i pliki zostały pomyślnie skopiowane do '$destinationFolder'."
