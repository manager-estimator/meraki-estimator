import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import styles from "../page.module.css";
import { requestPasswordResetAction } from "../actions/auth";

type SP = Record<string, string | string[] | undefined>;

function pick(sp: SP, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default function ForgotPasswordPage({ searchParams }: { searchParams: SP }) {
  const email = pick(searchParams, "email");
  const errorMessage = pick(searchParams, "error");
  const sent = pick(searchParams, "sent") === "1";

  return (
    <AuthLayout>
      <form className={styles.authCard} action={requestPasswordResetAction}>
        <h1 className={styles.title}>Reset Password</h1>

        {errorMessage ? (
          <p style={{ color: "var(--Error)", marginTop: "0.75rem", textAlign: "center" }}>
            {errorMessage}
          </p>
        ) : null}

        {!sent ? (
          <>
            <div className={styles.inputGroup}>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="Your Email"
                defaultValue={email}
                required
              />
            </div>

            <div className={styles.buttonWrapper}>
              <button type="submit" className={styles.continueButton}>
                Send Reset Link
              </button>
            </div>

            <p className={styles.socialText} style={{ marginTop: "3rem" }}>
              Remember your password?
            </p>

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
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p
                style={{
                  color: "var(--Principal)",
                  fontSize: "16px",
                  marginBottom: "1rem",
                  lineHeight: "1.6",
                }}
              >
                We&apos;ve sent a password reset link to your email address.
              </p>
              <p style={{ color: "var(--Body)", fontSize: "14px", marginBottom: "2rem" }}>
                Please check your email and follow the instructions to reset your password.
              </p>
            </div>

            <div className={styles.buttonWrapper}>
              <Link
                href={"/forgot-password" + (email ? ("?email=" + encodeURIComponent(email)) : "")}
                className={styles.continueButton}
                style={{
                  textDecoration: "none",
                  width: "216px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Send Another Link
              </Link>
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
          </>
        )}

        <p className={styles.privacyText}>
        By continuing, you agree to our{" "}
        <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/terms">Terms</Link>
      </p>
      </form>
    </AuthLayout>
  );
}
