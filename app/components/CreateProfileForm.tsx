"use client";

import styles from "../page.module.css";
import cp from "./CreateProfileForm.module.css";
import { createProfileAction } from "../actions/profile";
import { useSearchParams } from "next/navigation";

export default function CreateProfileForm() {
  const sp = useSearchParams();
  const err = sp.get("error");
  const next = sp.get("next") || "";

  return (
    <form className={styles.authCard} action={createProfileAction}>
      <h1 className={styles.title}>Create profile</h1>

      <p className={`${styles.socialText} ${cp.leftText}`} style={{ marginTop: 8 }}>
        This helps us personalize your estimate.
      </p>

      {err ? (
        <p className={styles.authError} style={{ marginTop: 10 }}>
          {err}
        </p>
      ) : null}

      {/* Preserve destination after profile creation */}
      <input type="hidden" name="next" value={next} />

      <div className={styles.inputGroup} style={{ marginTop: 28 }}>
        <input
          name="fullName"
          className={styles.input}
          placeholder="Full name"
          autoComplete="name"
          required
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
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <select
          name="language"
          className={`${styles.input} ${cp.select}`}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Preferred language
          </option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      <label className={cp.checkboxRow}>
        <input type="checkbox" className={cp.checkbox} required />
        <span className={styles.privacyText}>I agree to the Privacy Policy and Terms.</span>
      </label>

      <div className={styles.buttonWrapper} style={{ marginTop: 28 }}>
        <button type="submit" className={styles.continueButton}>
          Continue
        </button>
      </div>
    </form>
  );
}
