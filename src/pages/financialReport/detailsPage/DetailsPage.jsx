import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import DuoButtons from "../../../components/DuoButtons/DuoButtons";
import styles from "./DetailsPage.module.css";

import { transactions, deposit } from "../../../common/mockData";
import ButtonSection from "../../../components/ButtonSection/ButtonSection";
import { ChevronLeft, ChevronRight, File, Minus, MinusCircle, Plus, PlusCircle, TrendingDown, TrendingUp } from "lucide-react";
import { tgTheme } from "../../../common/commonStyle";

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
            <div className={styles.emptyIcon}>
              <File color={tgTheme.text} size={32}/>
            </div>
            <div className={'font16w600'}>Тип не выбран</div>
            <div className={styles.emptyText}>
              <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
                Выберите “Доходы / Расходы / Депозиты”, чтобы увидеть список операций.
              </span>
            </div>
          </div>
        )}

        {currentType && filteredList.length === 0 && (
          <div className={styles.emptyWrap}>
            <div className={'font16w600'}>Нет операций</div>
            <div className={styles.emptyText}>
              <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
                По выбранному типу пока нет данных.
              </span>
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
                  <span className={'font16w500'}>#{item.id}</span>
                  <span className={'font16w500'}>{formatDate(item.created_at)}</span>
                </div>

                <div className={`${styles.sum} ${item.increse ? styles.colorIncrease : styles.colorDecrease} font14w600`}>
                  {item.increse ? '+' : '-'}{formatMoney(item.sum)}{" "}
                  <span className={styles.currency}>AED</span>
                </div>
              </div>

              <div className={styles.bottomLine}>
                <div className={'font14w500'}>{item.car_name || "—"}</div>
                <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>{item.description || ""}</span>
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
              <ChevronLeft color={tgTheme.btnActive} />
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
              <ChevronRight color={tgTheme.btnActive} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.verticalIndent36} />

      <div className={styles.verticalIndent} />
      <ButtonSection
        title="Тип операции"
        buttons={[
          {
            icon: <TrendingUp strokeWidth={1.5} />,
            text: "Доходы",
            onClick: () => setCurrentType("increase"),
          },
          {
            icon: <TrendingDown strokeWidth={1.5} />,
            text: "Расходы",
            onClick: () => setCurrentType("decrease"),
          },
          {
            icon: <Plus strokeWidth={1.5} />,
            text: "Депозиты",
            onClick: () => setCurrentType("depositPlus"),
          },
          {
            icon: <Minus strokeWidth={1.5} />,
            text: "Депозиты",
            onClick: () => setCurrentType("depositMinus"),
          },
        ]}
      />
    </AppLayout>
  );
}
