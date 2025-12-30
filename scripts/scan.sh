#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
TS="$(date +"%Y%m%d_%H%M%S")"
OUT="${ROOT}/.scan/${TS}"
mkdir -p "${OUT}"

echo "Writing scan to: ${OUT}"

run () {
  local name="$1"; shift
  echo "==> ${name}"
  ( "$@" ) >"${OUT}/${name}.txt" 2>&1 || true
}

run "00_pwd"          pwd
run "01_date"         date
run "02_node"         node -v
run "03_npm"          npm -v
run "04_git_branch"   git rev-parse --abbrev-ref HEAD
run "05_git_head"     git rev-parse HEAD
run "06_git_status"   git status --porcelain=v1

run "07_pkg"          bash -lc 'sed -n "1,200p" package.json'
run "08_lock_top"     bash -lc 'test -f package-lock.json && sed -n "1,120p" package-lock.json || echo "no package-lock.json"'

run "09_next_info"    bash -lc 'npx --yes next info || true'

run "10_lint"         bash -lc 'npm run -s lint'
run "11_build"        bash -lc 'npm run -s build'

run "12_tsc"          bash -lc 'if [ -f tsconfig.json ]; then npx --yes tsc -p tsconfig.json --noEmit; else echo "no tsconfig.json"; fi'

run "13_routes_pages" bash -lc 'find app -type f \( -name "page.tsx" -o -name "page.jsx" -o -name "route.ts" -o -name "route.js" -o -name "layout.tsx" -o -name "layout.jsx" \) | sort'

run "14_use_client"   bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan --exclude=package-lock.json --exclude=*.map "\"use client\"" app || true'

run "15_useSearchParams" bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan "useSearchParams" app || true'
run "16_middleware_proxy" bash -lc 'ls -la middleware.* proxy.* 2>/dev/null || true; grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan -E "middleware|proxy" app || true'

run "17_eslint_disable" bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan "eslint-disable" app lib || true'
run "18_any"           bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan -E ":\s*any\b|as any\b" app lib || true'
run "19_todos"         bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan -E "TODO|FIXME|HACK" app lib || true'
run "20_console"       bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan "console\." app lib || true'
run "21_env"           bash -lc 'grep -RIn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.scan "process\.env" app lib || true'

cat > "${OUT}/SUMMARY.md" <<MD
# Scan summary (${TS})

Outputs in this folder. Key files:
- 06_git_status.txt
- 10_lint.txt
- 11_build.txt
- 12_tsc.txt
- 13_routes_pages.txt
- 15_useSearchParams.txt
- 17_eslint_disable.txt
- 18_any.txt

MD

echo "DONE. Summary: ${OUT}/SUMMARY.md"
