import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import styles from "../page.module.css";
import { updatePasswordAction } from "../actions/auth";

type SP = Record<string, string | string[] | undefined>;

function pick(sp: SP, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default function ResetPasswordPage({ searchParams }: { searchParams: SP }) {
  const errorMessage = pick(searchParams, "error");

  return (
    <AuthLayout>
      <form className={styles.authCard} action={updatePasswordAction}>
        <h1 className={styles.title}>Set New Password</h1>

        {errorMessage ? (
          <p style={{ color: "var(--Error)", marginTop: "0.75rem", textAlign: "center" }}>
            {errorMessage}
          </p>
        ) : null}

        <div className={styles.inputGroup}>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.input}
            placeholder="New password (min 8 chars)"
            required
            minLength={8}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            id="confirm"
            name="confirm"
            type="password"
            className={styles.input}
            placeholder="Confirm new password"
            required
            minLength={8}
          />
        </div>

        <div className={styles.buttonWrapper}>
          <button type="submit" className={styles.continueButton}>
            Update Password
          </button>
        </div>

        <div className={styles.buttonWrapper}>
          <Link
            href="/?mode=login"
            className={styles.continueButton}
            style={{
              textDecoration: "none",
              width: "216px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
