'use client';

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./EmailVerification.module.css";
import pageStyles from "../page.module.css";
import { resendVerificationAction } from "../actions/auth";

const COOLDOWN_SECONDS = 60;
const LINK_SENT_MS = 2000;
const DEFAULT_RATE_LIMIT_SECONDS = 60;

function parseWaitSeconds(msg: string): number {
  const m = msg.match(/after\s+(\d+)\s+seconds/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) ? n : DEFAULT_RATE_LIMIT_SECONDS;
}


export default function EmailVerification({
  email,
  initialSent,
  errorMessage,
}: {
  email: string;
  initialSent: boolean;
  errorMessage?: string;
}) {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";
  const effectiveEmail = email || emailFromUrl;

  // Si llegamos con ?resent=1, arrancamos ya con 60s
  const initialWait = errorMessage ? parseWaitSeconds(errorMessage) : 0;
  const [cooldown, setCooldown] = useState<number>(initialSent ? COOLDOWN_SECONDS : initialWait);

  // Bandera para mostrar "Link sent" justo después de reenviar
  const [justSent, setJustSent] = useState<boolean>(initialSent && !errorMessage);

  // Guardamos el timeout para poder limpiarlo si el componente se desmonta
  const sentTimerRef = useRef<number | null>(null);

  // Si entramos desde redirect con resent=1, mostramos "Link sent" un momento
  useEffect(() => {
    if (!initialSent) return;
    if (errorMessage) return;

    // Evita setState sincronizado en el body del effect (regla lint)
    const t = window.setTimeout(() => {
      setJustSent(true);
      if (sentTimerRef.current) window.clearTimeout(sentTimerRef.current);
      sentTimerRef.current = window.setTimeout(() => setJustSent(false), LINK_SENT_MS);
    }, 0);

    return () => window.clearTimeout(t);
  }, [initialSent, errorMessage]);

  // Tick: baja 1 cada segundo mientras cooldown > 0
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  // Cleanup general (por si acaso)
  useEffect(() => {
    return () => {
      if (sentTimerRef.current) window.clearTimeout(sentTimerRef.current);
    };
  }, []);

  const isDisabled = !effectiveEmail || cooldown > 0;

  const buttonText =
    justSent ? "Link sent" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link";

  function handleSubmit() {
    if (!effectiveEmail) return;

    // Bloquea inmediatamente en UI (evita doble click)
    setCooldown(COOLDOWN_SECONDS);
  }

  return (
    <div className={styles.authCard}>
      <h1 className={`${pageStyles.title} ${styles.title}`}>Check your email</h1>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}> We sent a verification link to: </p>
      <p className={styles.altHint}>If you already have an account, <Link href="/?mode=login">log in</Link> instead.</p>
        {effectiveEmail ? <p className={styles.infoEmail}>{effectiveEmail}</p> : null}
      </div>

      <form
        action={resendVerificationAction}
        className={styles.resendForm}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="email" value={effectiveEmail} />
        <button
          type="submit"
          className={styles.resendButton}
          disabled={isDisabled}
          aria-disabled={isDisabled}
        >
          {buttonText}
        </button>
      </form>

      {errorMessage ? (
        <p className={styles.helperText} role="alert">
          {errorMessage}
        </p>
      ) : null}


      <p className={styles.helperText}> Didn’t receive it? Check your spam folder. </p>

      <div className={styles.buttonWrapper}>
        <Link className={styles.continueButton} href="/?mode=login" role="button">
          Continue
        </Link>
      </div>
    </div>
  );
}
