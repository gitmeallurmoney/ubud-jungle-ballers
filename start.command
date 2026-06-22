#!/bin/bash
# =============================================================
# Ubud Jungle Ballers — one-click launcher (macOS)
# Double-click this file to start the site and open it in your browser.
# Close this Terminal window when you're done viewing.
# =============================================================

# Switch to the directory this script lives in (the website folder)
cd "$(dirname "$0")"

PORT=8765
URL="http://localhost:${PORT}"

clear
echo ""
echo "  🌴  UBUD JUNGLE BALLERS"
echo "  ───────────────────────────"
echo "  Starting local server on:"
echo "  ${URL}"
echo ""
echo "  ➜ Browser will open in a moment."
echo "  ➜ Close this window to stop the server."
echo ""

# Find a Python that can run a static server
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "  ✗ Could not find Python on this Mac."
  echo "    Install it from python.org, or run any other static server"
  echo "    from this folder, then visit ${URL} manually."
  echo ""
  read -n 1 -s -r -p "Press any key to exit..."
  exit 1
fi

# Generate env.js + the i18n catalog and localized /id/ pages before serving,
# so the dynamic strings and the Indonesian site are present locally too.
# (Node is used only for these small codegen scripts — no npm install.)
if command -v node >/dev/null 2>&1; then
  node scripts/gen-env.mjs 2>/dev/null || true
  node scripts/build-i18n.mjs 2>/dev/null || true
else
  echo "  ⚠ Node not found — skipping i18n build; the /id/ pages won't be generated."
fi

# Open the browser shortly after the server starts
( sleep 1 && open "${URL}" ) &

# Start the server (foreground — Ctrl+C or close window to stop)
"${PY}" -m http.server "${PORT}"
