"use client";

import AuthLayout from "../components/AuthLayout";
import Link from "next/link";
import { useState } from "react";
import styles from "./account.module.css";

function buildInviteText(url: string) {
  return [
    "Try Meraki Estimator (free):",
    url,
    "",
    "It helps you build a quick scope + estimate you can share with clients.",
  ].join("\n");
}

export default function AccountPage() {
  const [copied, setCopied] = useState(false);

  async function onCopyLink() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback: prompt copy
      window.prompt("Copy this link:", url);
    }
  }

  function onWhatsAppShare() {
    const url = `${window.location.origin}/login`;
    const text = buildInviteText(url);
    const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function onEmailInvite() {
    const url = `${window.location.origin}/login`;
    const subject = "Meraki Estimator (free)";
    const body = buildInviteText(url);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <AuthLayout>
      <div className={styles.wrap}>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Account</h1>
            <p className={styles.subTitle}>Your personal area: security + sharing tools.</p>
          </div>

          <Link className={styles.backBtn} href="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Profile</div>
                <div className={styles.cardSub}>Basic info</div>
              </div>
            </div>

            <div className={styles.list}>
              <div className={styles.listItem}>
                <div>
                  <div className={styles.liTitle}>Email</div>
                  <div className={styles.liSub}>Shown here later from session</div>
                </div>
                <div className={styles.liRight}>—</div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Security</div>
                <div className={styles.cardSub}>Password & access</div>
              </div>
              <Link className={styles.primaryBtn} href="/forgot-password">
                Reset password
              </Link>
            </div>

            <div className={styles.note}>
              This sends a secure reset link to your email.
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Share</div>
                <div className={styles.cardSub}>Invite others to try the app</div>
              </div>
            </div>

            <div className={styles.btnRow}>
              <button className={styles.primaryBtn} type="button" onClick={onCopyLink}>
                {copied ? "Copied" : "Copy link"}
              </button>

              <button className={styles.linkBtn} type="button" onClick={onEmailInvite}>
                Email invite
              </button>

              <button className={styles.linkBtn} type="button" onClick={onWhatsAppShare}>
                WhatsApp
              </button>
            </div>

            <div className={styles.note}>
              Tip: send this to agents, clients, or partners.
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Support</div>
                <div className={styles.cardSub}>Help us improve</div>
              </div>
            </div>

            <div className={styles.list}>
              <a className={styles.listItemLink} href="mailto:technical.support@merakihomeandbuild.com?subject=Meraki%20Estimator%20—%20Feedback">
                <div>
                  <div className={styles.liTitle}>Send feedback</div>
                  <div className={styles.liSub}>We iterate fast with real feedback.</div>
                </div>
                <span className={styles.pill}>Email</span>
              </a>

              <a className={styles.listItemLink} href="mailto:technical.support@merakihomeandbuild.com?subject=Meraki%20Estimator%20—%20Request%20a%20demo">
                <div>
                  <div className={styles.liTitle}>Request a demo</div>
                  <div className={styles.liSub}>We can help you adopt it in your team.</div>
                </div>
                <span className={styles.pill}>Email</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </AuthLayout>
  );
}
