"use client";

import { useMemo } from "react";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import styles from "./account.module.css";

export default function AccountPage() {
  // (MVP) placeholders. Luego lo conectamos a sesión/DB.
  const user = useMemo(
    () => ({
      email: "—",
      plan: "Free (beta)",
    }),
    []
  );

  const sharePath = "/login";

  function getShareUrl(): string {
    // No dependemos de esto para el render SSR → solo para clicks
    if (typeof window === "undefined") return sharePath;
    return `${window.location.origin}${sharePath}`;
  }

  async function onCopyLink() {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied ✅");
    } catch {
      prompt("Copy this link:", url);
    }
  }

  function onEmailInvite() {
    const url = getShareUrl();
    const mailto = `mailto:?subject=${encodeURIComponent("Meraki Estimator")}&body=${encodeURIComponent(
      `Try Meraki Estimator:\n\n${url}\n`
    )}`;
    window.location.href = mailto;
  }

  function onWhatsAppInvite() {
    const url = getShareUrl();
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Try Meraki Estimator: ${url}`)}`;
    window.open(whatsapp, "_blank", "noopener,noreferrer");
  }

  return (
    <AuthLayout>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Account</h1>
            <p className={styles.muted}>Your personal area. Security + sharing tools.</p>
          </div>
          <Link className={styles.linkBtn} href="/dashboard">
            Back to dashboard
          </Link>
        </div>

        {/* FUTURO: tabs reales en la misma página */}
        <div className={styles.tabs} aria-label="Account sections">
          <button type="button" className={styles.tabActive} aria-current="page">
            Account
          </button>
          <button type="button" className={styles.tabDisabled} disabled>
            Billing (soon)
          </button>
          <button type="button" className={styles.tabDisabled} disabled>
            Referrals (soon)
          </button>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Profile</div>
                <div className={styles.cardSub}>Basic info</div>
              </div>
              <span className={styles.badge}>Beta</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <div className={styles.k}>Email</div>
                <div className={styles.v}>{user.email}</div>
              </div>
              <div className={styles.row}>
                <div className={styles.k}>Plan</div>
                <div className={styles.v}>{user.plan}</div>
              </div>
              <div className={styles.note}>Next: show real user email/plan from the session.</div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Security</div>
                <div className={styles.cardSub}>Password & access</div>
              </div>
              <Link className={styles.primaryBtn} href="/forgot-password">
                Change password
              </Link>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.note}>This sends a secure reset link to your email.</div>
              <div className={styles.pills}>
                <span className={styles.pill}>Reset password</span>
                <span className={styles.pillMuted}>2FA (soon)</span>
                <span className={styles.pillMuted}>Devices (soon)</span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Share & grow</div>
                <div className={styles.cardSub}>Invite others to try the app</div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.shareRow}>
                <button type="button" className={styles.primaryBtn} onClick={onCopyLink}>
                  Copy link
                </button>
                <button type="button" className={styles.linkBtn} onClick={onEmailInvite}>
                  Email invite
                </button>
                <button type="button" className={styles.linkBtn} onClick={onWhatsAppInvite}>
                  WhatsApp
                </button>
              </div>

              <div className={styles.note}>Tip: use this to send the app to agents, clients, or partners.</div>

              <div className={styles.divider} />

              <div className={styles.listItem}>
                <div>
                  <div className={styles.liTitle}>Referral program</div>
                  <div className={styles.liSub}>Give discounts/credits for each invite (coming soon).</div>
                </div>
                <button className={styles.disabledBtn} type="button" disabled>
                  Soon
                </button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Commercial</div>
                <div className={styles.cardSub}>Quick actions for growth</div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.listItem}>
                <div>
                  <div className={styles.liTitle}>Request a demo</div>
                  <div className={styles.liSub}>CTA (we can connect to a form later).</div>
                </div>
                <a className={styles.linkBtn} href="mailto:info@merakihomeandbuild.com?subject=Meraki%20Estimator%20Demo">
                  Email
                </a>
              </div>

              <div className={styles.listItem}>
                <div>
                  <div className={styles.liTitle}>Send feedback</div>
                  <div className={styles.liSub}>Helps us iterate fast.</div>
                </div>
                <a className={styles.linkBtn} href="mailto:info@merakihomeandbuild.com?subject=Meraki%20Estimator%20Feedback">
                  Email
                </a>
              </div>

              <div className={styles.note}>Next: replace emails with a proper Support form + tracking.</div>
            </div>
          </section>
        </div>
      </div>
    </AuthLayout>
  );
}
