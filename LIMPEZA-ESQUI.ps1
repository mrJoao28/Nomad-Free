# Remove arquivos da versão anterior (destinos genéricos, oportunidades e trabalho voluntário).
# Rode UMA vez, na pasta do projeto, depois de extrair o zip por cima:
#   powershell -ExecutionPolicy Bypass -File .\LIMPEZA-ESQUI.ps1
$alvos = @(
  "src\app\oportunidades",
  "tests\unit\sort-remote.test.ts",
  "public\img\hero-fiorde.svg"
)
foreach ($a in $alvos) {
  if (Test-Path $a) { Remove-Item -Recurse -Force $a; Write-Host "removido: $a" }
}
# Ilustrações SVG antigas por destino/oportunidade (a nova versão não usa mais).
Get-ChildItem "public\img" -Filter "*.svg" -ErrorAction SilentlyContinue | ForEach-Object {
  Remove-Item -Force $_.FullName; Write-Host "removido: $($_.Name)"
}
if (Test-Path "scripts\generate-images.mjs") { Remove-Item -Force "scripts\generate-images.mjs"; Write-Host "removido: scripts\generate-images.mjs" }
# Fotos da versão anterior (inclusive a foto errada de "Da Nang"): serão baixadas de novo, já corretas.
Get-ChildItem "public\img\photos" -Include *.jpg,*.jpeg,*.png,*.webp -ErrorAction SilentlyContinue | ForEach-Object {
  Remove-Item -Force $_.FullName; Write-Host "removida foto antiga: $($_.Name)"
}
Set-Content -Path "public\img\photos\credits.json" -Value "{}"
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next"; Write-Host "removido: .next (cache)" }
Write-Host "Pronto."
