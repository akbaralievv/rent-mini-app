import React from "react";
import styles from "./ReportCard.module.css";
import { Wallet } from "lucide-react";

export default function ReportCard({ title, items = [], currency = "AED" }) {
  return (
    <div className={styles.card}>
      {title && <div className={`${styles.cardTitle} font16w600`}>{title}</div>}

      <div className={styles.itemBlock}>
        {items.map((item) => (
          <div key={item.key} className={styles.row}>
            <span className={`${styles.dot} ${styles[item.variant]}`} />
            <span className="font14w500" style={{ color: "var(--tg-text-secondary)" }}>{item.label}:</span>
            <b className="font14w600">
              {item.value} {currency}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}
