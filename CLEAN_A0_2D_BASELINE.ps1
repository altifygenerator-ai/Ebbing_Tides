$ErrorActionPreference = "Stop"
$paths = @(
  "public/art/reference/symbols/approved-2026-09-07",
  "public/art/ui/runtime/equipment_male_empty.png",
  "public/art/ui/runtime/equipment_female_empty.png",
  "src/artLayouts/market/market.ts",
  "src/artLayouts/crew/roster.ts",
  "src/artLayouts/journal/journal.ts",
  "src/artLayouts/character/creator.ts",
  "src/artLayouts/ship/management.ts",
  "tests/alpha-06c-symbol-language-pass1.test.mjs",
  "tests/alpha-06c-symbol-language-pass2.test.mjs",
  "public/art/ui/symbols/runtime/asteria_pantheon_temple.png",
  "public/art/ui/symbols/runtime/asteria_solar_compass.png",
  "public/art/ui/symbols/runtime/blackhaven_freeport_anchor.png",
  "public/art/ui/symbols/runtime/covenant_knot.png",
  "public/art/ui/symbols/runtime/house_vaering_primary_arms.png",
  "public/art/ui/symbols/runtime/kaishin_civic_hall.png",
  "public/art/ui/symbols/runtime/outer_isles_ash_gull.png",
  "public/art/ui/symbols/runtime/skeldra_aun.png",
  "public/art/ui/symbols/runtime/skeldra_naval_unit_pennant.png",
  "public/art/ui/symbols/runtime/skeldra_odal.png",
  "public/art/ui/symbols/runtime/skeldra_rank_captain.png",
  "public/art/ui/symbols/runtime/turning_wheel_primary.png",
  "public/art/ui/symbols/runtime/vespera_grand_strait.png"
)
foreach ($path in $paths) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Recurse -Force
    Write-Host "Removed $path"
  }
}
Write-Host "A0.2D baseline stale-file cleanup complete."
