'use client';

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./EmailVerification.module.css";
import pageStyles from "../page.module.css";
import { resendVerificationAction } from "../actions/auth";

const COOLDOWN_SECONDS = 60;
const LINK_SENT_MS = 2000;

export default function EmailVerification({
  email,
  initialSent,
}: {
  email: string;
  initialSent: boolean;
}) {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";
  const effectiveEmail = email || emailFromUrl;

  // Si llegamos con ?resent=1, arrancamos ya con 60s
  const [cooldown, setCooldown] = useState<number>(initialSent ? COOLDOWN_SECONDS : 0);

  // Bandera para mostrar "Link sent" justo después de reenviar
  const [justSent, setJustSent] = useState<boolean>(false);

  // Guardamos el timeout para poder limpiarlo si el componente se desmonta
  const sentTimerRef = useRef<number | null>(null);

  // Si entramos desde redirect con resent=1, mostramos "Link sent" un momento
  useEffect(() => {
    if (!initialSent) return;

    // Evita setState sincronizado en el body del effect (regla lint)
    const t = window.setTimeout(() => {
      setJustSent(true);
      if (sentTimerRef.current) window.clearTimeout(sentTimerRef.current);
      sentTimerRef.current = window.setTimeout(() => setJustSent(false), LINK_SENT_MS);
    }, 0);

    return () => window.clearTimeout(t);
  }, [initialSent]);

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

    // Arranca el cooldown y bloquea ya
    setCooldown(COOLDOWN_SECONDS);

    // Muestra "Link sent" un momento, luego vuelve a contador
    setJustSent(true);
    if (sentTimerRef.current) window.clearTimeout(sentTimerRef.current);
    sentTimerRef.current = window.setTimeout(() => setJustSent(false), LINK_SENT_MS);
  }

  return (
    <div className={styles.authCard}>
      <h1 className={`${pageStyles.title} ${styles.title}`}>Check your email</h1>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}> We sent a verification link to: </p>
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

      <p className={styles.helperText}> Didn’t receive it? Check your spam folder. </p>

      <div className={styles.buttonWrapper}>
        <Link className={styles.continueButton} href="/?mode=login" role="button">
          Continue
        </Link>
      </div>
    </div>
  );
}
