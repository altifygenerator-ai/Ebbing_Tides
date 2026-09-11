#!/usr/bin/env bash
set -euo pipefail
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  rm -rf -- "$path"
  echo "Removed $path"
done < "$(dirname "$0")/A0_2D_STALE_PATHS.txt"
echo "A0.2D baseline stale-file cleanup complete."
