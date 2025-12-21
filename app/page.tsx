"use client";

import { useState, FormEvent } from "react";
import styles from "./page.module.css";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    console.log("Sign up with:", { email, password });
  };

  const handleGoogleSignUp = () => {
    console.log("Sign up with Google");
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logoWrapper}>
          <img
            className={styles.logo}
            src="https://cdn.builder.io/api/v1/image/assets%2Fd94fa6e5f0634242979e8f5a4b8f636a%2F0a2e7e90488c4b828fc15b53ad74ad64?format=webp&width=800"
            alt="Meraki Home & Build"
          />
        </div>
      </div>

      <div className={styles.rightPanel}>
        <form className={styles.authCard} onSubmit={handleContinue}>
          <h1 className={styles.title}>Sign up</h1>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Your Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.buttonWrapper}>
            <button type="submit" className={styles.continueButton}>
              Continue
            </button>
          </div>

          <p className={styles.socialText}>Or sign up with social account</p>

          <div className={styles.buttonWrapper}>
            <button type="button" className={styles.googleButton} onClick={handleGoogleSignUp}>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/edcd41d473e900ee59ff77f19c11898110e7c1eb?width=69"
                alt=""
                className={styles.googleIcon}
              />
              Google
            </button>
          </div>

          <p className={styles.privacyText}>By continuing, you agree to our Privacy Policy and Terms</p>
        </form>
      </div>
    </div>
  );
}
