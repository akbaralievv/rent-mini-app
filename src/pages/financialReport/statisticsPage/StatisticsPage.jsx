import React, { useMemo, useState } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import ButtonSection from "../../../components/ButtonSection/ButtonSection";
import styles from "./StatisticsPage.module.css";
import { Calendar, Car, Check, ChevronDown, ChevronLeft, ChevronRight, ListCollapse } from "lucide-react";
import { tgTheme } from "../../../common/commonStyle";
import { useGetFinanceSummaryQuery } from "../../../redux/services/financeApi";
import { useGetCarStatsQuery, useGetCarsQuery } from "../../../redux/services/carAction";
import CalendarCustom from "../../../components/CalendarCustom/CalendarCustom";

const PAGE_SIZE = 5;

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

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function getPeriodLabel(key, customRange) {
  if (key === "custom_range" && customRange) {
    return `${customRange.start_date.split("-").reverse().join(".")} – ${customRange.end_date.split("-").reverse().join(".")}`;
  }
  return PERIODS.find((p) => p.key === key)?.label || key;
}

export default function StatisticsPage() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("current_month");
  const [customRange, setCustomRange] = useState(null);
  const [isPeriodSelectOpen, setIsPeriodSelectOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [view, setView] = useState("finance");
  const [selectedCar, setSelectedCar] = useState("all");
  const [isCarSelectOpen, setIsCarSelectOpen] = useState(false);
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
    if (period === "custom_range" && customRange) {
      return { start_date: customRange.start_date, end_date: customRange.end_date };
    }
    return { period };
  }, [period, customRange]);

  const { data: financeSummary, isFetching: isFinanceLoading } = useGetFinanceSummaryQuery(queryParams);

  const carStatsParams = useMemo(() => {
    let params;
    if (period === "custom_range" && customRange) {
      params = { start: customRange.start_date, end: customRange.end_date };
    } else {
      params = { period };
    }
    if (selectedCar !== "all") {
      params.car_id = selectedCar;
    }
    return params;
  }, [period, customRange, selectedCar]);

  const { data: carStats, isFetching: isCarStatsLoading } = useGetCarStatsQuery(carStatsParams, {
    skip: view !== "cars",
  });

  const { data: carsData } = useGetCarsQuery();
  const carsList = carsData?.cars || [];

  const orders = carStats?.orders || [];
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedCarInfo = selectedCar === "all"
    ? null
    : carsList.find((c) => c.id === selectedCar) || null;

  return (
    <AppLayout onBack={() => navigate(-1)} title={"Статистика"}>

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

      <div className={styles.tabsBlock}>
        <button
          type="button"
          className={`${styles.tabBtn} ${view === "finance" ? styles.tabActive : ""}`}
          onClick={() => setView("finance")}
        >
          Финансы
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${view === "cars" ? styles.tabActive : ""}`}
          onClick={() => setView("cars")}
        >
          По авто
        </button>
      </div>

      {view === "finance" && (
        <div className={styles.statCard}>
          <div className={`${styles.statTitle} font20w700`}>
            Финансовый отчет
          </div>
          <div className={styles.periodLabel}>
            {getPeriodLabel(period, customRange)}
          </div>

          {isFinanceLoading ? (
            <div className={styles.loader}>Загрузка...</div>
          ) : financeSummary ? (
            <>
              <div className={styles.financeRow}>
                <span className={styles.financeIcon}>🟢</span>
                <span className="font14w400">Приход:</span>
                <b className="font14w600">{formatMoney(financeSummary.income)} AED</b>
              </div>
              <div className={styles.financeRow}>
                <span className={styles.financeIcon}>🔴</span>
                <span className="font14w400">Расход:</span>
                <b className="font14w600">{formatMoney(financeSummary.expense)} AED</b>
              </div>
              <div className={styles.financeRow}>
                <span className={styles.financeIcon}>💸</span>
                <span className="font14w400">Баланс:</span>
                <b className="font14w600">{formatMoney(financeSummary.balance)} AED</b>
              </div>

              <div className={styles.divider} />

              <div className={styles.financeRow}>
                <span className={styles.financeIcon}>📋</span>
                <span className="font14w400">Депозиты +:</span>
                <b className="font14w600">{formatMoney(financeSummary.deposit_add)} AED</b>
              </div>
              <div className={styles.financeRow}>
                <span className={styles.financeIcon}>📋</span>
                <span className="font14w400">Депозиты −:</span>
                <b className="font14w600">{formatMoney(financeSummary.deposit_return)} AED</b>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>Нет данных</div>
          )}
        </div>
      )}

      {view === "cars" && (
        <>
          <div className={styles.field}>
            <span className="font16w500">Автомобиль</span>

            <div className={styles.selectWrapper}>
              <button
                className={styles.selectLike}
                onClick={() => setIsCarSelectOpen((p) => !p)}
              >
                <span className="font14w600">
                  {selectedCar === "all"
                    ? "Все авто"
                    : selectedCarInfo
                      ? `${selectedCarInfo.car_name} (${selectedCarInfo.car_number})`
                      : "Авто"}
                </span>
                <ChevronDown size={16} color={tgTheme.textSecondary} />
              </button>

              {isCarSelectOpen && (
                <>
                  <div className={styles.overlay} onClick={() => setIsCarSelectOpen(false)} />
                  <div className={styles.dropdown}>
                    <button
                      onClick={() => {
                        setSelectedCar("all");
                        setIsCarSelectOpen(false);
                        setPage(1);
                      }}
                    >
                      <span className="font14w600">Все авто</span>
                      {selectedCar === "all" && (
                        <Check color={tgTheme.accent} size={20} />
                      )}
                    </button>

                    {carsList.map((car) => (
                      <button
                        key={car.id}
                        onClick={() => {
                          setSelectedCar(car.id);
                          setIsCarSelectOpen(false);
                          setPage(1);
                        }}
                      >
                        <span className="font14w600">{car.car_name} ({car.car_number})</span>
                        {selectedCar === car.id && (
                          <Check color={tgTheme.accent} size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {isCarStatsLoading ? (
            <div className={styles.statCard}>
              <div className={styles.loader}>Загрузка...</div>
            </div>
          ) : carStats ? (
            <div className={styles.statCard}>
              {selectedCar === "all" && (
                <>
                  <div className={`${styles.statTitle} font20w700`}>
                    Статистика по всем авто
                  </div>
                  <div className={styles.periodLabel}>
                    {getPeriodLabel(period, customRange)}
                  </div>

                  <div className={styles.statLine}>
                    <span className="font14w400">Общее кол-во заказов:</span>
                    <b className="font14w600">{carStats.count ?? 0}</b>
                  </div>

                  <div className={styles.statLine}>
                    <span className="font14w400">Общая сумма:</span>
                    <b className="font14w600">{formatMoney(carStats.sum)} AED</b>
                  </div>

                  {carStats.best_car && (
                    <div className={styles.block}>
                      <div className={`${styles.blockTitle} font16w600`}>⭐ Лучший по прибыли:</div>
                      <div className={styles.statSmall}>
                        <div><b>Авто:</b> {carStats.best_car.car?.car_name} ({carStats.best_car.car?.car_number})</div>
                        <div><b>Доход:</b> {formatMoney(carStats.best_car.sum)} AED</div>
                        <div><b>Заказов:</b> {carStats.best_car.orders}</div>
                      </div>
                    </div>
                  )}

                  {carStats.worst_car && (
                    <div className={styles.block}>
                      <div className={`${styles.blockTitle} font16w600`}>👎 Худший по прибыли:</div>
                      <div className={styles.statSmall}>
                        <div><b>Авто:</b> {carStats.worst_car.car?.car_name} ({carStats.worst_car.car?.car_number})</div>
                        <div><b>Доход:</b> {formatMoney(carStats.worst_car.sum)} AED</div>
                        <div><b>Заказов:</b> {carStats.worst_car.orders}</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedCar !== "all" && (
                <>
                  <div className={`${styles.statTitle} font20w700`}>
                    Статистика по автомобилю
                  </div>

                  {carStats.car && (
                    <div className={`${styles.statSmall} font14w400`}>
                      <div><b>ID:</b> {carStats.car.id}</div>
                      <div><b>Модель:</b> {carStats.car.car_name}</div>
                      <div><b>Номер:</b> {carStats.car.car_number}</div>
                    </div>
                  )}

                  <div className={styles.block}>
                    <div className={`${styles.blockTitle} font16w600`}>
                      {getPeriodLabel(period, customRange)}
                    </div>

                    <div className={styles.statLine}>
                      <span className="font14w400">Кол-во заказов:</span>
                      <b className="font14w600">{carStats.count ?? 0}</b>
                    </div>

                    <div className={styles.statLine}>
                      <span className="font14w400">Сумма:</span>
                      <b className="font14w600">{formatMoney(carStats.sum)} AED</b>
                    </div>

                    <div className={styles.statLine}>
                      <span className="font14w400">Кол-во дней аренды:</span>
                      <b className="font14w600">{carStats.days ?? 0}</b>
                    </div>
                  </div>

                  {carStats.orders && carStats.orders.length > 0 && (
                    <div className={styles.block}>
                      <div className={`${styles.blockTitle} font16w600`}>
                        Заказы:
                      </div>

                      {pagedOrders.map((o, idx) => (
                        <div key={o.id} className={styles.orderItem}>
                          <div className={styles.orderTop}>
                            <b className="font14w600">
                              {idx + 1 + (page - 1) * PAGE_SIZE}. {formatDate(o.start_date || o.created_at)}
                            </b>

                            <span className={`${styles.orderStatus} font12w500`}>
                              {o.status_label || "—"}
                            </span>
                          </div>

                          <div className={styles.orderBottom}>
                            <div className={`${styles.orderClient} font14w400`}>
                              <span>{o.customer_name || o.payer || "—"}</span>
                            </div>

                            <div className={`${styles.orderSum} font14w600`}>
                              {formatMoney(o.price || o.sum)} AED
                            </div>
                          </div>
                        </div>
                      ))}

                      {totalPages > 1 && (
                        <div className={styles.pagination}>
                          <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                          >
                            <ChevronLeft size={16} /> Назад
                          </button>

                          <span className={styles.pageInfo}>
                            {page} / {totalPages}
                          </span>

                          <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                          >
                            Вперед <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.statCard}>
              <div className={styles.emptyState}>Нет данных</div>
            </div>
          )}
        </>
      )}

      <div className={styles.verticalIndent} />

      <ButtonSection
        buttons={[
          {
            icon: <ListCollapse strokeWidth={1.5} />,
            text: "Детализация",
            onClick: () => navigate("/financial-main/details"),
          },
        ]}
      />
    </AppLayout>
  );
}
