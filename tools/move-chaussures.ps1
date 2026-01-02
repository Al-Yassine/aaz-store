# Move 'mocassins', 'sneakers', 'soulieurs' into 'public/Images/chaussures'
$root = Join-Path $PSScriptRoot '..' | Resolve-Path
$images = Join-Path $root 'public\Images'
$target = Join-Path $images 'chaussures'
if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target | Out-Null }

$dirs = @('mocassins','sneakers','soulieurs')
foreach ($d in $dirs) {
    $src = Join-Path $images $d
    if (Test-Path $src) {
        $dest = Join-Path $target $d
        if (Test-Path $dest) { Write-Host "Destination exists: $dest -- skipping move" }
        else { Move-Item -Path $src -Destination $dest; Write-Host "Moved $src -> $dest" }
    } else {
        Write-Host "Source not found: $src"
    }
}

Write-Host "Done."
