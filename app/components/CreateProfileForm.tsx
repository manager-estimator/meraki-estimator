"use client";

import Link from "next/link";
import styles from "../page.module.css";
import cp from "./CreateProfileForm.module.css";

export default function CreateProfileForm() {
  return (
    <form className={styles.authCard}>
      <h1 className={styles.title}>Create profile</h1>

      <p className={`${styles.socialText} ${cp.leftText}`} style={{ marginTop: 8 }}>
        This helps us personalize your estimate.
      </p>

      <div className={styles.inputGroup} style={{ marginTop: 28 }}>
        <input
          name="fullName"
          className={styles.input}
          placeholder="Full name"
          autoComplete="name"
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          name="phone"
          className={styles.input}
          placeholder="Phone (optional)"
          autoComplete="tel"
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          name="city"
          className={styles.input}
          placeholder="City"
          autoComplete="address-level2"
        />
      </div>

      <div className={styles.inputGroup}>
        <select
          name="language"
          className={`${styles.input} ${cp.select}`}
          defaultValue=""
        >
          <option value="" disabled>
            Preferred language
          </option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      <label className={cp.checkboxRow}>
        <input type="checkbox" className={cp.checkbox} />
        <span className={styles.privacyText}>
          I agree to the Privacy Policy and Terms.
        </span>
      </label>

      <div className={styles.buttonWrapper} style={{ marginTop: 28 }}>
        <button type="button" className={styles.continueButton}>
          Continue
        </button>
      </div>

      <div className={cp.skipRow}>
        <Link href="#" className={cp.skipLink}>
          Skip for now
        </Link>
      </div>
    </form>
  );
}
