import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import ReportCard from "../../../components/ReportCard/ReportCard";
import { transactions } from "../../../common/mockData";
import ButtonSection from "../../../components/ButtonSection/ButtonSection";
import styles from "./StatisticsPage.module.css";

const PAGE_SIZE = 5;

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function StatisticsPage() {
  const navigate = useNavigate();

  const [isCarSelectOpen, setIsCarSelectOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState("all"); // all | car_name
  const [page, setPage] = useState(1);

  const carsList = useMemo(() => {
    const unique = Array.from(new Set(transactions.map((t) => t.car_name))).filter(Boolean);
    return unique.slice(0, 10);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [selectedCar]);

  const ordersAll = useMemo(() => {
    return [...transactions]
      .filter((t) => t.increse === true)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, []);

  const ordersByCar = useMemo(() => {
    if (selectedCar === "all") return [];
    return ordersAll.filter((o) => o.car_name === selectedCar);
  }, [ordersAll, selectedCar]);

  const statsAllCars = useMemo(() => {
    const totalOrders = ordersAll.length;

    const totalIncome = ordersAll.reduce((acc, o) => acc + Number(o.sum || 0), 0);

    const map = new Map();
    for (const o of ordersAll) {
      const car = o.car_name || "—";
      if (!map.has(car)) {
        map.set(car, { car, income: 0, orders: 0 });
      }
      const item = map.get(car);
      item.income += Number(o.sum || 0);
      item.orders += 1;
    }

    const list = Array.from(map.values());

    const best = list.reduce((prev, cur) => (cur.income > prev.income ? cur : prev), list[0] || null);
    const worst = list.reduce((prev, cur) => (cur.income < prev.income ? cur : prev), list[0] || null);

    return {
      totalOrders,
      totalIncome,
      best,
      worst,
    };
  }, [ordersAll]);

  const statsCar = useMemo(() => {
    if (selectedCar === "all") return null;

    const carOrders = ordersByCar;
    const ordersCount = carOrders.length;

    const incomeSum = carOrders.reduce((acc, o) => acc + Number(o.sum || 0), 0);
    const rentDays = 0;

    const fakeCarId = 50;
    const fakeCarNumber = "M94374";

    return {
      carId: fakeCarId,
      model: selectedCar,
      number: fakeCarNumber,
      ordersCount,
      incomeSum,
      rentDays,
      orders: carOrders,
    };
  }, [selectedCar, ordersByCar]);

  const totalPages = Math.max(1, Math.ceil((statsCar?.orders?.length || 0) / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pagedOrders = useMemo(() => {
    if (!statsCar?.orders) return [];
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return statsCar.orders.slice(start, end);
  }, [statsCar, page]);

  const carTitle = selectedCar === "all" ? "📊 Все авто" : `${selectedCar}`;

  return (
    <AppLayout onBack={() => navigate(-1)} title={"Статистика"}>

      {selectedCar === "all" && (
        <div className={styles.statCard}>
          <div className={styles.statTitle}>📊 Статистика по авто за всё время</div>

          <div className={styles.statLine}>
            <span>📦 Общее кол-во заказов:</span>
            <b>{statsAllCars.totalOrders}</b>
          </div>

          <div className={styles.statLine}>
            <span>💰 Общая сумма:</span>
            <b>{formatMoney(statsAllCars.totalIncome)} AED</b>
          </div>

          {statsAllCars.best && (
            <div className={styles.block}>
              <div className={styles.blockTitle}>⭐ Лучший по прибыли:</div>
              <div className={styles.statSmall}>
                <div><b>Авто:</b> {statsAllCars.best.car}</div>
                <div><b>Доход:</b> {formatMoney(statsAllCars.best.income)} AED</div>
                <div><b>Заказов:</b> {statsAllCars.best.orders}</div>
              </div>
            </div>
          )}

          {statsAllCars.worst && (
            <div className={styles.block}>
              <div className={styles.blockTitle}>👎 Худший по прибыли:</div>
              <div className={styles.statSmall}>
                <div><b>Авто:</b> {statsAllCars.worst.car}</div>
                <div><b>Доход:</b> {formatMoney(statsAllCars.worst.income)} AED</div>
                <div><b>Заказов:</b> {statsAllCars.worst.orders}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCar !== "all" && statsCar && (
        <div className={styles.statCard}>
          <div className={styles.statTitle}>🚗 Статистика по автомобилю</div>

          <div className={styles.statSmall}>
            <div><b>ID:</b> {statsCar.carId}</div>
            <div><b>Модель:</b> {statsCar.model}</div>
            <div><b>Номер:</b> {statsCar.number}</div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>📊 Статистика по авто за всё время</div>

            <div className={styles.statLine}>
              <span>📦 Кол-во заказов:</span>
              <b>{statsCar.ordersCount}</b>
            </div>

            <div className={styles.statLine}>
              <span>💰 Сумма:</span>
              <b>{formatMoney(statsCar.incomeSum)} AED</b>
            </div>

            <div className={styles.statLine}>
              <span>⏱ Кол-во дней аренды:</span>
              <b>{statsCar.rentDays}</b>
            </div>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>🗂 Заказы:</div>

            {pagedOrders.map((o, idx) => (
              <div key={o.id} className={styles.orderItem}>
                <div className={styles.orderTop}>
                  <b>
                    {idx + 1 + (page - 1) * PAGE_SIZE}. {formatDate(o.created_at)}
                  </b>
                  <span className={styles.orderStatus}>✅ Завершен</span>
                </div>

                <div className={styles.orderBottom}>
                  <div className={styles.orderClient}>👤 {o.payer}</div>
                  <div className={styles.orderSum}>💰 {formatMoney(o.sum)} AED</div>
                </div>
              </div>
            ))}

            {/* пагинация */}
            {statsCar.orders.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => canPrev && setPage((p) => p - 1)}
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
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                >
                  Вперёд ➡️
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={styles.verticalIndent}/>

      <ButtonSection
        buttons={[
          {
            icon: "📋",
            text: "Детализация",
            onClick: () => navigate("/financial-main/details"),
          },
          {
            icon: "🚗",
            text: selectedCar == 'all' ? "Статистика по авто" : carTitle,
            onClick: () => setIsCarSelectOpen((p) => !p),
          },
        ]}
      />

      {isCarSelectOpen && (
        <div className={styles.selectBlock}>
          <div className={styles.selectTitle}>Выберите авто</div>

          <button
            type="button"
            className={`${styles.selectItem} ${selectedCar === "all" ? styles.selectActive : ""
              }`}
            onClick={() => {
              setSelectedCar("all");
              setIsCarSelectOpen(false);
            }}
          >
            <span>📊 Все авто</span>
            {selectedCar === "all" && <span className={styles.check}>✅</span>}
          </button>

          {carsList.map((car) => (
            <button
              key={car}
              type="button"
              className={`${styles.selectItem} ${selectedCar === car ? styles.selectActive : ""
                }`}
              onClick={() => {
                setSelectedCar(car);
                setIsCarSelectOpen(false);
              }}
            >
              <span>🚗 {car}</span>
              {selectedCar === car && <span className={styles.check}>✅</span>}
            </button>
          ))}
        </div>
      )}

      <div className={styles.section}>
        <button type="button" className={styles.itemBack} onClick={() => navigate(-1)}>
          ⬅️ В меню
        </button>
      </div>
    </AppLayout>
  );
}
