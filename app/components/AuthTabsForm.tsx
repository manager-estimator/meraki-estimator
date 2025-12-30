"use client";

import {useMemo, Suspense, type ComponentProps} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../page.module.css";
import { signInAction, signUpAction } from "../actions/auth";

type Mode = "signup" | "login";

function AuthTabsFormInner({ defaultMode = "signup" }: { defaultMode?: Mode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const urlMode = sp.get("mode");
  const mode: Mode =
    urlMode === "login" || urlMode === "signup" ? (urlMode as Mode) : defaultMode;

  const errorMsg = sp.get("error");

  const setModeAndUrl = (m: Mode) => {
const nextUrl = m === "login" ? "/?mode=login" : "/?mode=signup";
    router.replace(nextUrl);
  };

  const title = useMemo(() => (mode === "signup" ? "Sign up" : "Log in"), [mode]);

  return (
    <form className={styles.authCard} action={mode === "signup" ? signUpAction : signInAction}>
      <div className={styles.authTabsRow} role="tablist" aria-label="Authentication">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={`${styles.authTab} ${mode === "signup" ? styles.authTabActive : ""}`}
          onClick={() => setModeAndUrl("signup")}
        >
          Sign up
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={`${styles.authTab} ${mode === "login" ? styles.authTabActive : ""}`}
          onClick={() => setModeAndUrl("login")}
        >
          Log in
        </button>
      </div>

      <h1 className={`${styles.title} ${styles.srOnly}`}>{title}</h1>

      {errorMsg ? <p className={styles.authError}>{errorMsg}</p> : null}

      <div className={styles.inputGroup}>
        <input
          id="email"
          name="email"
          type="email"
          className={styles.input}
          placeholder="Your Email"
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          id="password"
          name="password"
          type="password"
          className={styles.input}
          placeholder="Password"
          required
        />
      </div>

      <div className={styles.buttonWrapper}>
        <button type="submit" className={styles.continueButton}>
          Continue
        </button>
      </div>

      {mode === "login" ? (
        <Link className={styles.forgotLink} href="/forgot-password">
          Forgot password?
        </Link>
      ) : null}

      <p className={styles.socialText}>
        Or {mode === "signup" ? "sign up" : "log in"} with social account
      </p>

      <div className={styles.buttonWrapper}>
        <button type="button" className={styles.googleButton}>
          <svg
            className={styles.googleIcon}
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path d="M17.5016 14.3198V21.0978H26.9208C26.5072 23.2776 25.266 25.1233 23.4045 26.3643L29.0846 30.7717C32.3941 27.7169 34.3034 23.23 34.3034 17.8999C34.3034 16.6589 34.192 15.4654 33.9851 14.32L17.5016 14.3198Z" fill="#4285F4"/>
              <path d="M7.69307 20.8332L6.41198 21.8139L1.87732 25.346C4.75717 31.0579 10.6597 35.0039 17.5013 35.0039C22.2266 35.0039 26.1884 33.4446 29.0842 30.7716L23.4041 26.3643C21.8448 27.4144 19.856 28.0509 17.5013 28.0509C12.9508 28.0509 9.08456 24.9802 7.70022 20.8433L7.69307 20.8332Z" fill="#34A853"/>
              <path d="M1.87734 9.65784C0.684094 12.0125 0 14.6697 0 17.5018C0 20.3338 0.684094 22.991 1.87734 25.3457C1.87734 25.3615 7.7008 20.827 7.7008 20.827C7.35077 19.7769 7.14387 18.6632 7.14387 17.5016C7.14387 16.3399 7.35077 15.2263 7.7008 14.1761L1.87734 9.65784Z" fill="#FBBC05"/>
              <path d="M17.5016 6.96894C20.0792 6.96894 22.3703 7.85992 24.2001 9.57831L29.2119 4.56647C26.1729 1.73439 22.2272 0 17.5016 0C10.66 0 4.75717 3.92997 1.87732 9.65788L7.7006 14.1766C9.08476 10.0397 12.9511 6.96894 17.5016 6.96894Z" fill="#EA4335"/>
            </g>
          </svg>
          Google
        </button>
      </div>

      <p className={styles.privacyText}>By continuing, you agree to our Privacy Policy and Terms</p>
    </form>
  );
}


export default function AuthTabsForm(props: ComponentProps<typeof AuthTabsFormInner>) {
  return (
    <Suspense fallback={null}>
      <AuthTabsFormInner {...props} />
    </Suspense>
  );
}
