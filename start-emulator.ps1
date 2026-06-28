$ErrorActionPreference = "Stop"

$emulatorPath = "C:\Android\Sdk\emulator\emulator.exe"
$avdName = "ProperRide_API30_Light"

if (-not (Test-Path $emulatorPath)) {
    throw "Android Emulator tidak ditemukan: $emulatorPath"
}

$running = & adb devices |
    Select-String "emulator-\d+\s+device"

if ($running) {
    Write-Host "Emulator sudah berjalan."
    exit 0
}

Start-Process `
    -FilePath $emulatorPath `
    -ArgumentList @(
        "-avd", $avdName,
        "-no-boot-anim",
        "-no-audio",
        "-gpu", "host",
        "-memory", "2048",
        "-cores", "2",
        "-netdelay", "none",
        "-netspeed", "full"
    )

Write-Host "ProperRide emulator sedang dijalankan."