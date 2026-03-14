import React, { useMemo } from "react";
import styles from "./ReportCard.module.css";
import { Wallet } from "lucide-react";
import { useGetTransactionsQuery } from "../../redux/services/financeApi";
import Tag from "../Tag/Tag";
import { useNavigate } from "react-router-dom";

const increasetArr = ['income', 'deposit_add']

const type = [
  { key: "expense", label: "Расходы" },
  { key: "income", label: "Доходы" },
  { key: "deposit_add", label: "Депозит +" },
  { key: "deposit_return", label: "Депозит -" },
];

function formatDate(iso) {
  const date = new Date(iso);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ReportCard({
  title,
  balance = 0,
  income = 0,
  expense = 0,
  totalDeposit = 0,
  currency = "AED"
}) {
  const navigate = useNavigate();

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
  const totalDepositFormatted = formatSplit(totalDeposit);

  const transactionParams = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const format = (d) => d.toISOString().slice(0, 10);
    return {
      start_date: format(weekAgo),
      end_date: format(today),
      page: 1,
      per_page: 50,
    };
  }, []);

  const { data: transactionsData = { data: [] } } = useGetTransactionsQuery(transactionParams);

  const groupedTransactions = transactionsData.data.reduce((acc, item) => {
    const date = new Date(item.created_at).toISOString().slice(0, 10);

    if (!acc[date]) acc[date] = [];
    acc[date].push(item);

    return acc;
  }, {});

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
        <div className={styles.statItem}>
          <span className={`${styles.dot} ${styles.deposit}`} />
          <div>
            <div className="font14w500" style={{ color: "var(--tg-text-secondary)" }}>
              Депозиты
            </div>
            <div className={styles.smallAmount}>
              <span className="font14w600">
                {totalDepositFormatted.main}
              </span>

              <span className="font12w500" style={{ opacity: 0.7 }}>
                .{totalDepositFormatted.cents}
              </span>

              <span className="font12w500" style={{ opacity: 0.6, marginLeft: 2 }}>
                {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
      {
        transactionsData?.data?.length > 0 ? <div className={styles.historyContent}>
          {Object.entries(groupedTransactions).map(([date, items]) => (
            <div key={date} className={styles.historyGroup}>

              <div className={styles.historyDate}>
                {formatDate(date)}
              </div>

              <div className={styles.historyCard}>
                {items.map((el) => (
                  <div key={el.id} className={styles.historyRow} onClick={() => navigate(`/operations/${el.id}/edit`)}>

                    <div className={styles.historyLeft}>

                      <div className={styles.historyTitle}>
                        {el.finance_tag?.name || "Транзакция"}
                      </div>

                      <div className={styles.historySubtitle}>
                        {el.car_name || "—"}
                      </div>
                    </div>

                    <div className={styles.rowRightBlock}>
                      <p className="font12w400">{type.find((item) => item.key == el.type)?.label}</p>
                      <div
                        className={
                          (increasetArr.includes(el.type)
                            ? styles.amountIncome
                            : styles.amountExpense) + ' font12w400'
                        }
                      >
                        {formatMoney(el.amount)} {el.currency}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
        : <div className={styles.emptyState}>
          <p className="font14w500" style={{ color: "var(--tg-text-secondary)" }}>
            Нет транзакций за последние 7 дней
          </p>
        </div>
      }
    </div>
  );
}
