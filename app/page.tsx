import Link from "next/link";
import styles from "./page.module.css";
import AuthLayout from "./components/AuthLayout";
import AuthTabsForm from "./components/AuthTabsForm";

export default function HomePage() {
  return (
    <AuthLayout>
      <AuthTabsForm defaultMode="signup" />
      <p className={styles.privacyText}>
        By continuing, you agree to our{" "}
        <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/terms">Terms</Link>
      </p>
    </AuthLayout>
  );
}
