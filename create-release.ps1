$version = (Get-Content 'package.json' | ConvertFrom-Json).version
$version = $version -replace '"',''
Compress-Archive -Path "build\*" -DestinationPath "releases\release-$version.zip"