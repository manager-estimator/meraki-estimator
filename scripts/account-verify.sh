#!/usr/bin/env bash
set -e
REPO="/Users/pablo/Proyectos/meraki-estimator"
cd "$REPO" || exit 1

npm run lint
npm run build
echo "✅ lint + build OK"
