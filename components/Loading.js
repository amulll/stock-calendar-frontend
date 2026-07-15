"use client";

import styles from "./Loading.module.css";

export default function Loading({ text = "努力載入中...", compact = false, scale = 1 }) {
  const isCompact = compact || scale < 1;
  const dogScale = compact ? 0.42 : scale;

  return (
    <div
      className={`${styles.loading} ${isCompact ? styles.compact : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{text}</span>
      <div className={styles.scene} aria-hidden="true">
        <div
          className={styles.dogContainer}
          style={{ "--dog-scale": dogScale }}
        >
          <div className={styles.dog}>
            <div className={styles.dogFront}>
              <div className={styles.dogFrontBody}>
                <div className={styles.dogFace} />
                <div className={styles.dogEye} />
              </div>
              <div className={`${styles.dogFoot} ${styles.active}`} />
              <div className={`${styles.dogFoot} ${styles.active}`} />
            </div>
            <div className={styles.dogBack}>
              <div className={styles.dogBackBody} />
              <div className={`${styles.dogFoot} ${styles.active}`} />
              <div className={`${styles.dogFoot} ${styles.active}`} />
              <div className={styles.dogTail} />
            </div>
          </div>
        </div>
      </div>
      <span className={styles.label} aria-hidden="true">{text}</span>
    </div>
  );
}
