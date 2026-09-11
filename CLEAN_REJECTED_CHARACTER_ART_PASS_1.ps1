$ErrorActionPreference = "Stop"
$old = @(
  "public/art/ui/character-themes/culture/skeldran/paper.webp",
  "public/art/ui/character-themes/culture/skeldran/creator_rail.webp",
  "public/art/ui/character-themes/culture/skeldran/creator_side.webp",
  "public/art/ui/character-themes/culture/skeldran/captain_profile.webp",
  "public/art/ui/character-themes/culture/skeldran/page_header_vignette.webp",
  "public/art/ui/character-themes/culture/skeldran/culture_rule.webp"
)
foreach ($rel in $old) {
  if (Test-Path $rel) {
    Remove-Item -Force $rel
    Write-Host "Removed obsolete rejected-pass asset $rel"
  }
}
Write-Host "Rejected Character Art Pass 1 background assets cleaned."
