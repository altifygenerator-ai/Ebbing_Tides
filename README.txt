EBBING TIDES - 12K ATLAS BUILD VALIDATION FIX v3

Why v2 failed
-------------
Windows PowerShell 5.1 writes a UTF-8 BOM when using:
  Set-Content -Encoding UTF8

The v2 script used that command when rewriting tsconfig.json. In this project,
Turbopack then rejected tsconfig.json at line 1 / character 1 with:
  tsconfig is not parseable: invalid JSON: Unexpected token

v3 fixes that by writing explicit UTF-8 WITHOUT BOM.

It also preserves the intended exclusions so root TypeScript validation ignores
incomplete handoff snapshots under dist/.

The 12K atlas itself was already installed successfully before the build step.
This package does NOT reinstall the atlas or alter gameplay.

Usage
-----
1. Extract both files into the Ebbing_Tides repository root.
2. From PowerShell in that root, run:

powershell -ExecutionPolicy Bypass -File ".\FIX_12K_ATLAS_BUILD_VALIDATION_v3.ps1"

The script backs up tsconfig.json, rewrites it without a BOM, verifies JSON
parsing with Node, and runs npm build.
