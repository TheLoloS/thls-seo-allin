# unzip.ps1
$zipFilePath = ".\puppeteer.zip"
$extractPath = ".\build"

# Sprawdź, czy plik zip istnieje
if (Test-Path $zipFilePath) {
    # Sprawdź, czy folder docelowy istnieje
    if (-not (Test-Path $extractPath)) {
        New-Item -ItemType Directory -Path $extractPath | Out-Null
    }

    # Rozpakuj plik zip
    Expand-Archive -Path $zipFilePath -DestinationPath $extractPath -Force
    Write-Host "Plik 'puppeteer.zip' został pomyślnie rozpakowany do '$extractPath'."
} else {
    Write-Host "Błąd: Plik 'puppeteer.zip' nie istnieje w bieżącym katalogu."
}
