# A0.2D Combined-Baseline Cleanup

This cleanup removes only stale historical files found in the user-provided full A0.2C archive. Those leftovers caused 11 unrelated failures even though the accepted later code was correct.

Run this once from the project root after extracting the full project (before or after applying A0.2D is fine), then apply A0.3A normally.

## Windows PowerShell

Copy `CLEAN_A0_2D_BASELINE.ps1` into the project root, open PowerShell there, and run:

`powershell -ExecutionPolicy Bypass -File .\CLEAN_A0_2D_BASELINE.ps1`

## Bash / Git Bash

`bash ./CLEAN_A0_2D_BASELINE.sh`

The script deletes only the exact superseded paths listed in `A0_2D_STALE_PATHS.txt`. It does not modify gameplay source or accepted current assets.
