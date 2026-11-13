#!/usr/bin/env bash
# Builds a clean, buyer-ready ZIP for UI8:
#   Northwind-AI-Agent-Workspace-v<version>.zip
#   ├── Northwind-React-Template/   source code (no node_modules, dist or OS junk)
#   └── START-HERE.txt
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/package.json').version")"
NAME="Northwind-AI-Agent-Workspace-v$VERSION"
OUT="$ROOT/../release"
STAGE="$OUT/$NAME"

echo "› Verifying the project builds cleanly"
(cd "$ROOT" && npm run lint && npm run build)

echo "› Staging $NAME"
rm -rf "$STAGE" "$OUT/$NAME.zip"
mkdir -p "$STAGE/Northwind-React-Template"
rsync -a "$ROOT/" "$STAGE/Northwind-React-Template/" \
  --exclude node_modules --exclude dist --exclude .DS_Store --exclude '*.log' \
  --exclude '.git' --exclude '.netlify' --exclude 'node_modules/.tmp'

cat > "$STAGE/START-HERE.txt" <<TXT
Northwind — AI Agent Workspace · React template v$VERSION
=======================================================

1. Install Node.js 22.22 or newer (LTS) from https://nodejs.org.
2. Open a terminal in Northwind-React-Template/ and run:

     npm install
     npm run dev

3. Open http://localhost:5173
   - /screens         index of all 101 screens
   - /design-system   tokens, icons and live components

Documentation: Northwind-React-Template/README.md and Northwind-React-Template/docs/
Support: babar@zaptatech.com
TXT

(cd "$OUT" && zip -qr "$NAME.zip" "$NAME" -x '*.DS_Store')
rm -rf "$STAGE"
echo "✓ $OUT/$NAME.zip"
