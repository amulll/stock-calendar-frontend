"use client";

import styles from "./Loading.module.css";

export default function Loading({ text = "努力載入中...", compact = false, scale = 1 }) {
  const isCompact = compact || scale < 1;

  return (
    <div
      className={`${styles.loading} ${isCompact ? styles.compact : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{text}</span>
    </div>
  );
}
