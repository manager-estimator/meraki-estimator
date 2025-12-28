#!/usr/bin/env bash
set -e
REPO="/Users/pablo/Proyectos/meraki-estimator"
cd "$REPO" || exit 1

cp -f app/account/page.future.tsx app/account/page.tsx
echo "✅ Restored FUTURE -> app/account/page.tsx"
