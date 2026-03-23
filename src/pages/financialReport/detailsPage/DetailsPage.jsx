import React, { useMemo, useState } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import styles from "./DetailsPage.module.css";
import ButtonSection from "../../../components/ButtonSection/ButtonSection";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, File, Minus, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { tgTheme } from "../../../common/commonStyle";
import { useGetTransactionsQuery } from "../../../redux/services/financeApi";
import CalendarCustom from "../../../components/CalendarCustom/CalendarCustom";

const types = [
  { key: "income", value: "доходы" },
  { key: "expense", value: "расходы" },
  { key: "deposit_add", value: "депозит +" },
  { key: "deposit_return", value: "депозит -" },
];

const PERIODS = [
  { key: "current_month", label: "Текущий месяц" },
  { key: "last_month", label: "Прошлый месяц" },
  { key: "last_3_months", label: "За 3 месяца" },
  { key: "last_6_months", label: "За 6 месяцев" },
  { key: "current_year", label: "За текущий год" },
  { key: "last_year", label: "За прошлый год" },
  { key: "all_time", label: "За все время" },
  { key: "custom_range", label: "По календарю" },
];

function getPeriodLabel(key, customRange) {
  if (key === "custom_range" && customRange) {
    return `${customRange.start_date.split("-").reverse().join(".")} – ${customRange.end_date.split("-").reverse().join(".")}`;
  }
  return PERIODS.find((p) => p.key === key)?.label || key;
}

const PAGE_SIZE = 10;

const isIncrease = (type) => type === "income" || type === "deposit_add";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DetailsPage() {
  const navigate = useNavigate();
  const [currentType, setCurrentType] = useState("income");
  const [period, setPeriod] = useState("current_month");
  const [customRange, setCustomRange] = useState(null);
  const [isPeriodSelectOpen, setIsPeriodSelectOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [page, setPage] = useState(1);

  const handlePeriodSelect = (key) => {
    if (key === "custom_range") {
      setIsPeriodSelectOpen(false);
      setIsCalendarOpen(true);
      return;
    }
    setPeriod(key);
    setCustomRange(null);
    setIsPeriodSelectOpen(false);
    setPage(1);
  };

  const handleCalendarDate = (dateStr) => {
    const parts = dateStr.split("/");
    if (parts.length === 2) {
      const parseDate = (s) => {
        const [d, m, y] = s.trim().split(".");
        return `${y}-${m}-${d}`;
      };
      setCustomRange({
        start_date: parseDate(parts[0]),
        end_date: parseDate(parts[1]),
      });
      setPeriod("custom_range");
      setPage(1);
    }
  };


  const queryParams = useMemo(() => {
    if (!currentType) return null;
    const params = {
      type: currentType,
      page,
      per_page: PAGE_SIZE,
      order: "desc",
    };
    if (period === "custom_range" && customRange) {
      params.start_date = customRange.start_date;
      params.end_date = customRange.end_date;
    } else {
      params.period = period;
    }
    return params;
  }, [currentType, period, customRange, page]);

  const { data: transactionsData, isFetching } = useGetTransactionsQuery(queryParams, {
    skip: !currentType,
  });

  const items = transactionsData?.data || [];
  const totalPages = transactionsData?.last_page || 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const title =
    "Детализация" +
    (currentType
      ? " (" + types.find((el) => el.key === currentType)?.value + ")"
      : "");

  return (
    <AppLayout onBack={() => navigate(-1)} title={title}>

      <div className={styles.field}>
        <span className="font16w500">Период</span>

        <div className={styles.selectWrapper}>
          <button
            className={styles.selectLike}
            onClick={() => setIsPeriodSelectOpen((p) => !p)}
          >
            <span className="font14w600">
              {getPeriodLabel(period, customRange)}
            </span>
            <ChevronDown size={16} color={tgTheme.textSecondary} />
          </button>

          {isPeriodSelectOpen && (
            <>
              <div className={styles.overlay} onClick={() => setIsPeriodSelectOpen(false)} />
              <div className={styles.dropdown}>
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePeriodSelect(p.key)}
                  >
                    <span className="font14w600">{p.label}</span>
                    {period === p.key && p.key !== "custom_range" && (
                      <Check color={tgTheme.accent} size={20} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <CalendarCustom
            visible={isCalendarOpen}
            setVisible={setIsCalendarOpen}
            date=""
            setDate={handleCalendarDate}
            mode="range"
          />
        </div>
      </div>

      <div className={styles.section}>
        {!currentType && (
          <div className={styles.emptyWrap}>
            <div className={styles.emptyIcon}>
              <File color={tgTheme.text} size={32} />
            </div>
            <div className={"font16w600"}>Тип не выбран</div>
            <div className={styles.emptyText}>
              <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
                Выберите "Доходы / Расходы / Депозиты", чтобы увидеть список операций.
              </span>
            </div>
          </div>
        )}

        {currentType && isFetching && (
          <div className={styles.emptyWrap}>
            <div className={"font14w500"} style={{ color: "var(--tg-text-secondary)" }}>
              Загрузка...
            </div>
          </div>
        )}

        {currentType && !isFetching && items.length === 0 && (
          <div className={styles.emptyWrap}>
            <div className={"font16w600"}>Нет операций</div>
            <div className={styles.emptyText}>
              <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
                По выбранному типу пока нет данных.
              </span>
            </div>
          </div>
        )}

        {currentType && !isFetching &&
          items.map((item) => (
            <button
              key={item.id}
              className={styles.row}
              type="button"
              onClick={() => navigate(`/operations/${item.id}/edit`)}
            >
              <div className={styles.topLine}>
                <div className={styles.left}>
                  <span className={"font16w500"}>#{item.id}</span>
                  <span className={"font16w500"}>{formatDate(item.created_at)}</span>
                </div>

                <div className={`${styles.sum} ${isIncrease(item.type) ? styles.colorIncrease : styles.colorDecrease} font14w600`}>
                  {isIncrease(item.type) ? "+" : "-"}{formatMoney(item.amount)}{" "}
                  <span className={styles.currency}>{item.currency || "AED"}</span>
                </div>
              </div>

              <div className={styles.bottomLine}>
                <div className={"font14w500"}>
                  {item.car_name ? `${item.car_name} (${item.car_number})` : "—"}
                </div>
                <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
                  {item.description || item.finance_tag?.name || ""}
                </span>
              </div>
            </button>
          ))}

        {currentType && !isFetching && items.length > 0 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
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
            onClick: () => { setCurrentType("income"); setPage(1); },
          },
          {
            icon: <TrendingDown strokeWidth={1.5} />,
            text: "Расходы",
            onClick: () => { setCurrentType("expense"); setPage(1); },
          },
          {
            icon: <Plus strokeWidth={1.5} />,
            text: "Депозиты +",
            onClick: () => { setCurrentType("deposit_add"); setPage(1); },
          },
          {
            icon: <Minus strokeWidth={1.5} />,
            text: "Депозиты −",
            onClick: () => { setCurrentType("deposit_return"); setPage(1); },
          },
        ]}
      />
    </AppLayout>
  );
}
