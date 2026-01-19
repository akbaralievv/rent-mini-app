import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./OperationPage.module.css";

import { transactions, deposit } from "../../../common/mockData";

const type = [
  { key: "increase", value: "Доходы" },
  { key: "decrease", value: "Расходы" },
  { key: "deposit", value: "Депозиты" },
];

const PAGE_SIZE = 5;

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OperationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const key = location.state?.key; // increase | decrease | deposit
  const title = type.find((el) => el.key === key)?.value || "Операции";

  const [page, setPage] = useState(1);

  const list = useMemo(() => {
    let data = [];

    if (key === "deposit") {
      data = deposit;
    } else {
      data = transactions.filter((t) =>
        key === "increase" ? t.increse === true : t.increse === false
      );
    }

    return [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [key]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [key]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return list.slice(start, end);
  }, [list, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  return (
    <AppLayout
      onBack={() => navigate(-1)}
      title={`${title} (стр. ${page})`}
    >
      {/* список */}
      <div className={styles.section}>
        {pageData.map((item) => (
          <button key={`${key}-${item.id}`} className={styles.row} type="button">
            <div className={styles.topLine}>
              <div className={styles.left}>
                <span className={styles.hash}>#{item.id}</span>
                <span className={styles.date}>{formatDate(item.created_at)}</span>

                {
                  item.increse ? '✅' : '❌'
                }
              </div>

              <div className={styles.sum}>
                {formatMoney(item.sum)} <span className={styles.currency}>AED</span>
              </div>
            </div>

            <div className={styles.bottomLine}>
              <div className={styles.carName}>{item.car_name || "—"}</div>
              <div className={styles.desc}>{item.description || ""}</div>
            </div>
          </button>
        ))}

        {/* пагинация */}
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={handlePrev}
            disabled={!canPrev}
          >
            ⬅️ Назад
          </button>

          <div className={styles.pageInfo}>
            {page} / {totalPages}
          </div>

          <button
            type="button"
            className={styles.pageBtn}
            onClick={handleNext}
            disabled={!canNext}
          >
            Вперёд ➡️
          </button>
        </div>
      </div>

      {/* в меню */}
      <div className={styles.section}>
        <button type="button" className={styles.itemBack} onClick={() => navigate(-1)}>
          ⬅ В меню
        </button>
      </div>
    </AppLayout>
  );
}
