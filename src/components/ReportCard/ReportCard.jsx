import React from "react";
import styles from "./ReportCard.module.css";
import { Wallet } from "lucide-react";

export default function ReportCard({
  title,
  balance = 0,
  income = 0,
  expense = 0,
  currency = "AED"
}) {

  const formatSplit = (value) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

    const [main, cents] = formatted.split('.');
    return { main, cents };
  };

  const balanceFormatted = formatSplit(balance);
  const incomeFormatted = formatSplit(income);
  const expenseFormatted = formatSplit(expense);

  return (
    <div className={styles.card}>
      {title && (
        <div className={`${styles.cardTitle} font16w600`}>
          {title}
        </div>
      )}

      <div className={styles.balanceBlock}>
        <div className={styles.balanceTop}>
          <Wallet size={18} />
          <span className="font12w500">Текущий баланс</span>
        </div>

        <div className={styles.balanceAmount}>
          <span className="font24w700">
            {balanceFormatted.main}
          </span>

          <span className="font16w600" style={{ opacity: 0.8 }}>
            .{balanceFormatted.cents}
          </span>

          <span className="font16w500" style={{ opacity: 0.7, marginLeft: 4 }}>
            {currency}
          </span>
        </div>

      </div>

      <div className={styles.divider} />

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={`${styles.dot} ${styles.income}`} />
          <div>
            <div className="font14w500" style={{ color: "var(--tg-text-secondary)" }}>
              Доходы
            </div>
            <div className={styles.smallAmount}>
              <span className="font14w600">
                {incomeFormatted.main}
              </span>

              <span className="font12w500" style={{ opacity: 0.7 }}>
                .{incomeFormatted.cents}
              </span>

              <span className="font12w500" style={{ opacity: 0.6, marginLeft: 2 }}>
                {currency}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statItem}>
          <span className={`${styles.dot} ${styles.expense}`} />
          <div>
            <div className="font14w500" style={{ color: "var(--tg-text-secondary)" }}>
              Расходы
            </div>
            <div className={styles.smallAmount}>
              <span className="font14w600">
                {expenseFormatted.main}
              </span>

              <span className="font12w500" style={{ opacity: 0.7 }}>
                .{expenseFormatted.cents}
              </span>

              <span className="font12w500" style={{ opacity: 0.6, marginLeft: 2 }}>
                {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
