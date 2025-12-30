import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import styles from "./invite.module.css";

export default function InvitePage() {
  return (
    <AuthLayout>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.kicker}>Meraki Estimator</div>
          <h1 className={styles.title}>You’re invited</h1>
          <p className={styles.sub}>
            Join via this invite link. If you already have an account, just sign in.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryBtn} href="/?mode=login">
              Continue
            </Link>
            <Link className={styles.linkBtn} href="/?mode=login">
              Sign in
            </Link>
          </div>

          </div>
      </div>
    </AuthLayout>
  );
}
