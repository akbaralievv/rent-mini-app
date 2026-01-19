import React from "react";
import styles from "./ReportCard.module.css";

export default function ReportCard({ title, items = [], currency = "AED" }) {
  return (
    <div className={styles.card}>
      {title && <div className={styles.cardTitle}>{title}</div>}

      {items.map((item) => (
        <div key={item.key} className={styles.row}>
          <span className={`${styles.dot} ${styles[item.variant]}`} />
          <span>{item.label}:</span>
          <b>
            {item.value} {currency}
          </b>
        </div>
      ))}
    </div>
  );
}
