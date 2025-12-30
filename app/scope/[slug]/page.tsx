import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";
import styles from "./scope.module.css";

const SCOPE_BY_SLUG: Record<string, { title: string; scope: string }> = {
  // soporta variantes de slug por si cambió el naming
  "entry-and-circulation": {
    title: "Entry & Circulation",
    scope:
      "Entry and circulation ready and safe: protections, small removals, basic wall/ceiling repairs and leveling, functional lighting and standard switches, base painting and sealants. Minor door/trim adjustments and railing check if needed. Final cleaning and waste handling.",
  },
  "entrance-circulation": {
    title: "Entry & Circulation",
    scope:
      "Entry and circulation ready and safe: protections, small removals, basic wall/ceiling repairs and leveling, functional lighting and standard switches, base painting and sealants. Minor door/trim adjustments and railing check if needed. Final cleaning and waste handling.",
  },
};

function safeDecode(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export default async function ScopePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const decoded = safeDecode(slug);
  const cleanSlug = decoded.replace(/:$/, "").trim();

  const item =
    SCOPE_BY_SLUG[cleanSlug] ??
    SCOPE_BY_SLUG[cleanSlug.toLowerCase()] ?? {
      title: cleanSlug || "Scope",
      scope:
        "Scope not found for this area yet. Add it to SCOPE_BY_SLUG in app/scope/[slug]/page.tsx.",
    };

  return (
    <AuthLayout>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <div className={styles.kicker}>Area</div>
              <h1 className={styles.title}>{item.title}</h1>
            </div>

            <div className={styles.actions}>
              <Link className={styles.linkBtn} href={`/area/${encodeURIComponent(cleanSlug)}`}>
                Back to Area
              </Link>
              <Link className={styles.linkBtnSecondary} href="/select-areas">
                Areas
              </Link>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.label}>Scope:</div>
            <div className={styles.scopeText}>{item.scope}</div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
