#!/usr/bin/env bash
set -e
REPO="/Users/pablo/Proyectos/meraki-estimator"
cd "$REPO" || exit 1

cp -f app/account/page.slim.before-premium.tsx app/account/page.tsx
cp -f app/account/account.module.before-premium.css app/account/account.module.css

echo "✅ Restored SLIM (before premium backup) -> app/account/page.tsx + css"
