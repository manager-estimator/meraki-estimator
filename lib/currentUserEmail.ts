import * as authActions from "../app/actions/auth";

type UnknownFn = (...args: unknown[]) => unknown;

function isFunction(v: unknown): v is UnknownFn {
  return typeof v === "function";
}

function asEmail(v: unknown): string | null {
  return typeof v === "string" && v.includes("@") ? v : null;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const actions = authActions as Record<string, unknown>;

  const candidates = [
    "getCurrentUserEmail",
    "getUserEmail",
    "currentUser",
    "getCurrentUser",
    "getUser",
    "getSession",
    "session",
  ];

  for (const name of candidates) {
    const fn = actions[name];
    if (!isFunction(fn)) continue;

    try {
      const res = await fn();

      // Direct string
      const direct = asEmail(res);
      if (direct) return direct;

      // Common shapes (kept as unknown-safe)
      const obj = res as {
        email?: unknown;
        user?: { email?: unknown };
        data?: { user?: { email?: unknown } };
        session?: { user?: { email?: unknown } };
      } | null;

      const nested =
        asEmail(obj?.email) ??
        asEmail(obj?.user?.email) ??
        asEmail(obj?.data?.user?.email) ??
        asEmail(obj?.session?.user?.email);

      if (nested) return nested;
    } catch {
      // ignore and try next candidate
    }
  }

  return null;
}
