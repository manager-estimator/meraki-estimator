"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import styles from "../page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <form className={styles.authCard} onSubmit={handleResetPassword}>
        <h1 className={styles.title}>Reset Password</h1>

        {!submitted ? (
          <>
            <div className={styles.inputGroup}>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                style={{ textDecoration: "none", width: "216px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ 
                color: "var(--Principal)",
                fontSize: "16px",
                marginBottom: "1rem",
                lineHeight: "1.6"
              }}>
                We&apos;ve sent a password reset link to your email address.
              </p>
              <p style={{ 
                color: "var(--Body)",
                fontSize: "14px",
                marginBottom: "2rem"
              }}>
                Please check your email and follow the instructions to reset your password.
              </p>
            </div>

            <div className={styles.buttonWrapper}>
              <button 
                type="button"
                className={styles.continueButton}
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
              >
                Send Another Link
              </button>
            </div>

            <div className={styles.buttonWrapper}>
              <Link
                href="/?mode=login"
                className={styles.continueButton}
                style={{ textDecoration: "none", width: "216px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Back to Login
              </Link>
            </div>
          </>
        )}

        <p className={styles.privacyText}>By continuing, you agree to our Privacy Policy and Terms</p>
      </form>
    </AuthLayout>
  );
}
