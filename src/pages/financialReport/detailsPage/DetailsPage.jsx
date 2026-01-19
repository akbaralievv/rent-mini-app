import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import DuoButtons from "../../../components/DuoButtons/DuoButtons";
import styles from "./DetailsPage.module.css";

import { transactions, deposit } from "../../../common/mockData";

const types = [
  { key: "increase", value: "доходы" },
  { key: "decrease", value: "расходы" },
  { key: "depositPlus", value: "депозит +" },
  { key: "depositMinus", value: "депозит -" },
];

const PAGE_SIZE = 4;

function formatDate(iso) {
  // 2026-01-12 -> 12/01/2026
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DetailsPage() {
  const navigate = useNavigate();
  const [currentType, setCurrentType] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [currentType]);

  const title =
    "Детализация" +
    (currentType != null
      ? " (" + types.find((el) => el.key === currentType)?.value + ")"
      : "");

  const filteredList = useMemo(() => {
    if (!currentType) return [];

    if (currentType === "increase") {
      return [...transactions]
        .filter((t) => t.increse === true)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (currentType === "decrease") {
      return [...transactions]
        .filter((t) => t.increse === false)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (currentType === "depositPlus") {
      return [...deposit]
        .filter((d) => d.increse === true)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (currentType === "depositMinus") {
      return [...deposit]
        .filter((d) => d.increse === false)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return [];
  }, [currentType]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredList.slice(start, end);
  }, [filteredList, page]);

  const handlePrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  return (
    <AppLayout onBack={() => navigate(-1)} title={title}>
      {/* Список */}
      <div className={styles.section}>
        {!currentType && (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon}>📒</div>
            <div className={styles.emptyTitle}>Тип не выбран</div>
            <div className={styles.emptyText}>
              Выберите “Доходы / Расходы / Депозиты”, чтобы увидеть список операций.
            </div>
          </div>
        )}

        {currentType && filteredList.length === 0 && (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon}>🗒️</div>
            <div className={styles.emptyTitle}>Нет операций</div>
            <div className={styles.emptyText}>
              По выбранному типу пока нет данных.
            </div>
          </div>
        )}

        {currentType &&
          pageData.map((item) => (
            <button
              key={`${currentType}-${item.id}`}
              className={styles.row}
              type="button"
            >
              <div className={styles.topLine}>
                <div className={styles.left}>
                  <span className={styles.hash}>#{item.id}</span>
                  <span className={styles.date}>{formatDate(item.created_at)}</span>

                  {currentType === "increase" && "✅"}
                  {currentType === "decrease" && "❌"}
                  {currentType === "depositPlus" && "🔽"}
                  {currentType === "depositMinus" && "🔼"}
                </div>

                <div className={styles.sum}>
                  {formatMoney(item.sum)}{" "}
                  <span className={styles.currency}>AED</span>
                </div>
              </div>

              <div className={styles.bottomLine}>
                <div className={styles.carName}>🚗 {item.car_name || "—"}</div>
                <div className={styles.desc}>{item.description || ""}</div>
              </div>
            </button>
          ))}

        {currentType && filteredList.length > 0 && (
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
        )}
      </div>
      <div className={styles.verticalIndent16} />

      <DuoButtons
        buttons={[
          {
            text: "✅ Доходы",
            onClick: () => setCurrentType("increase"),
          },
          {
            text: "💸 Расходы",
            onClick: () => setCurrentType("decrease"),
          },
        ]}
      />

      <div className={styles.verticalIndent} />

      <DuoButtons
        buttons={[
          {
            text: "📋 Депозиты +",
            onClick: () => setCurrentType("depositPlus"),
          },
          {
            text: "📋 Депозиты -",
            onClick: () => setCurrentType("depositMinus"),
          },
        ]}
      />
      <div className={styles.section}>
        <button
          type="button"
          className={styles.itemBack}
          onClick={() => navigate(-1)}
        >
          ⬅️ В меню
        </button>
      </div>
    </AppLayout>
  );
}
