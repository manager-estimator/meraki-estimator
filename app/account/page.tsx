"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "../components/AuthLayout";
import styles from "./account.module.css";

function mailto(to: string, subject: string, body: string) {
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  return `mailto:${to}?subject=${s}&body=${b}`;
}

export default function AccountPage() {
  const [copied, setCopied] = useState(false);

  const supportEmail = "technical.support@merakihomeandbuild.com";
  const demoEmail = "manager@merakihomeandbuild.com";

  async function onCopyLink() {
    if (typeof window === "undefined") return;
    const link = new URL("/login", window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback: prompt copy
      window.prompt("Copy this link:", link);
    }
  }

  function onEmailInvite() {
    if (typeof window === "undefined") return;
    const link = new URL("/login", window.location.origin).toString();
    window.location.href = mailto(
      "",
      "Meraki Estimator – invite",
      `Hi,\n\nHere’s the link to access Meraki Estimator:\n${link}\n\n— Meraki Home & Build`
    );
  }

  function onWhatsApp() {
    if (typeof window === "undefined") return;
    const link = new URL("/login", window.location.origin).toString();
    const text = encodeURIComponent(
      `Meraki Estimator (free access):\n${link}\n\n— Meraki Home & Build`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <AuthLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Account</h1>
            <div className={styles.sub}>Your personal area: security + sharing tools.</div>
          </div>

          <Link className={styles.btnGhost} href="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className={styles.grid}>
          {/* Profile */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Profile</div>
                <div className={styles.cardHint}>Basic info</div>
              </div>
              <span className={styles.badge}>Beta</span>
            </div>

            <div className={styles.row}>
              <div className={styles.kvLeft}>
                <div className={styles.key}>Email</div>
                <div className={styles.valueMuted}>Shown here later from session</div>
              </div>
              <div className={styles.valueMuted}>—</div>
            </div>
          </section>

          {/* Security */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Security</div>
                <div className={styles.cardHint}>Password &amp; access</div>
              </div>
              <Link className={styles.btnPrimary} href="/forgot-password">
                Reset password
              </Link>
            </div>

            <div className={styles.note}>This sends a secure reset link to your email.</div>
          </section>

          {/* Share */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Share</div>
                <div className={styles.cardHint}>Invite others to try the app</div>
              </div>
              {copied ? <span className={styles.badge}>Copied</span> : <span className={styles.badge}>Free</span>}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.btnPrimary} onClick={onCopyLink}>
                Copy link
              </button>
              <button type="button" className={styles.pill} onClick={onEmailInvite}>
                Email invite
              </button>
              <button type="button" className={styles.pill} onClick={onWhatsApp}>
                WhatsApp
              </button>
            </div>

            <div className={styles.note}>Tip: send this to agents, clients, or partners.</div>
          </section>

          {/* Support */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Support</div>
                <div className={styles.cardHint}>Help us improve</div>
              </div>
              <span className={styles.badge}>Fast reply</span>
            </div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <div>
                  <div className={styles.liTitle}>Send feedback</div>
                  <div className={styles.liSub}>We iterate fast with real feedback.</div>
                </div>
                <a
                  className={styles.pillLink}
                  href={mailto(supportEmail, "Meraki Estimator – feedback", "Hi,\n\nFeedback:\n\n—")}
                >
                  Email
                </a>
              </div>

              <div className={styles.listItem}>
                <div>
                  <div className={styles.liTitle}>Request a demo</div>
                  <div className={styles.liSub}>We can help you adopt it in your team.</div>
                </div>
                <a
                  className={styles.pillLink}
                  href={mailto(demoEmail, "Meraki Estimator – demo request", "Hi,\n\nWe’d like a demo for:\n\n—")}
                >
                  Email
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthLayout>
  );
}
