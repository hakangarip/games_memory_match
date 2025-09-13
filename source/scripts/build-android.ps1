param(
    [switch]$VerboseLog
)

$ErrorActionPreference = 'Stop'
$previousLocation = Get-Location

function Write-Info($msg) {
    Write-Host "[build-android] $msg" -ForegroundColor Cyan
}

try {
    Write-Info "Starting build pipeline (web build -> cap sync -> gradle assembleDebug)"

    # Ensure we run from the source folder
    $repoRoot = Split-Path -Parent $PSScriptRoot
    Set-Location $repoRoot

    # Step 1: Web build
    Write-Info "1/3: npm run build"
    npm run build

    # Step 2: Capacitor sync (Android)
    Write-Info "2/3: npx cap sync android"
    npx cap sync android

    # Step 3: Gradle assembleDebug with JBR from Android Studio
    $defaultJavaHome = "C:\Program Files\Android\Android Studio\jbr"
    if (-not (Test-Path $defaultJavaHome)) {
        Write-Info "Android Studio JBR not found at '$defaultJavaHome'. Using current JAVA_HOME if set."
    } else {
        $env:JAVA_HOME = $defaultJavaHome
    }

    $androidDir = Join-Path $repoRoot 'android'
    if (-not (Test-Path $androidDir)) {
        throw "Android project directory not found: $androidDir. Did you run 'npx cap add android'?"
    }

    Write-Info "3/3: Gradle assembleDebug"
    Push-Location $androidDir
    try {
        .\gradlew.bat assembleDebug
    } finally {
        Pop-Location
    }

    Write-Info "Build complete. APK/AAB outputs are under 'source/android/app/build/outputs/'."
}
catch {
    Write-Error $_
    exit 1
}
finally {
    Set-Location $previousLocation
}
