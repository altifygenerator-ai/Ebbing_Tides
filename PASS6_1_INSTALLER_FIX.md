# Pass 6.1 installer correction

Pass 6 originally used a PowerShell `TrimStart` call with a two-character string (`"\\"`) where Windows PowerShell requires individual `System.Char` values.

Pass 6.1 changes that operation to explicit character codes:

```powershell
.TrimStart([char]92,[char]47)
```

It also corrects escaped progress/report newline literals in the Node atlas generator.

The failed Pass 6 attempt stopped before copying the payload or regenerating atlas tiles, so it is safe to rerun this corrected package.
