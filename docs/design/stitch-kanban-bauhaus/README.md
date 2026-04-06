# Stitch reference — Kanban Board (Bauhaus)

This folder holds **optional** design exports from [Google Stitch](https://stitch.withgoogle.com/) for visual parity while implementing the board UI in React.

| Field | Value |
|--------|--------|
| Project ID | `12323884550944750041` |
| Screen | Kanban Board - Bauhaus Style |
| Screen ID | `17188e23de0b4a50af64efc4150443c4` |

## Generate `reference.html` and `preview.png`

1. Create an API key under Stitch **Settings → API keys** (do not commit it).
2. Set `STITCH_API_KEY` in your environment (e.g. `.env.local` is gitignored; you can run Node with `--env-file`).

From the repo root:

```bash
# Node 20+ (loads vars from .env if present)
node --env-file=.env --env-file=.env.local scripts/fetch-stitch-board-assets.mjs
```

Or PowerShell:

```powershell
$env:STITCH_API_KEY="your-key"
node scripts/fetch-stitch-board-assets.mjs
```

Equivalent download with hosted URLs (after printing them from the script or SDK):

```bash
curl -L -o docs/design/stitch-kanban-bauhaus/reference.html "<html-url>"
curl -L -o docs/design/stitch-kanban-bauhaus/preview.png "<image-url>"
```

`reference.html` and `preview.png` are listed in `.gitignore` so clones without Stitch access still build.
