#!/usr/bin/env bash
set -e

OUT="_estimate_flow_dump_$(date +%Y%m%d_%H%M%S).txt"

{
  echo "=== ESTIMATE FLOW DUMP ==="
  echo "Dir: $(pwd)"
  echo "Date: $(date)"
  echo ""

  echo "== FLOW PAGES (contenido) =="
  for f in \
    "app/select-areas/page.tsx" \
    "app/area/[slug]/page.tsx" \
    "app/scope/[slug]/page.tsx" \
    "app/quantity/[slug]/page.tsx" \
    "app/optionals/[slug]/page.tsx" \
    "app/optionals/[slug]/[roomIndex]/page.tsx" \
    "app/room-summary/[slug]/[roomIndex]/page.tsx" \
    "app/project-summary/page.tsx"
  do
    if [ -f "$f" ]; then
      echo "---- $f ----"
      nl -ba "$f" | sed -n '1,220p'
      echo ""
    else
      echo "---- $f (missing) ----"
      echo ""
    fi
  done

  echo "== COMPONENTS (contenido) =="
  for f in \
    "app/components/SelectAreasForm.tsx" \
    "app/components/AreaDetailsForm.tsx" \
    "app/components/QuantityForm.tsx" \
    "app/components/OptionalsForm.tsx" \
    "app/components/RoomSummaryForm.tsx"
  do
    if [ -f "$f" ]; then
      echo "---- $f ----"
      nl -ba "$f" | sed -n '1,340p'
      echo ""
    fi
  done

  echo "== DRAFT STORAGE =="
  nl -ba "lib/estimateDraft.ts" | sed -n '1,260p'
  echo ""
} | tee "$OUT"

echo "✅ Dump generado: $OUT"
echo "👉 Ábrelo con: open \"$OUT\""
