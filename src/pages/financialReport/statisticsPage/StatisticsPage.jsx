import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useNavigate } from "react-router-dom";
import ReportCard from "../../../components/ReportCard/ReportCard";
import { transactions } from "../../../common/mockData";
import ButtonSection from "../../../components/ButtonSection/ButtonSection";
import styles from "./StatisticsPage.module.css";
import { Car, Check, ListCollapse, PersonStandingIcon, Rows3, User } from "lucide-react";
import { tgTheme } from "../../../common/commonStyle";

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
  
  // eslint-disable-next-line no-unused-vars
  const canPrev = page > 1;
  // eslint-disable-next-line no-unused-vars
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
          <div className={styles.statTitle}>Статистика по авто за всё время</div>

          <div className={styles.statLine}>
            <span>Общее кол-во заказов:</span>
            <b>{statsAllCars.totalOrders}</b>
          </div>

          <div className={styles.statLine}>
            <span>Общая сумма:</span>
            <b>{formatMoney(statsAllCars.totalIncome)} AED</b>
          </div>

          {statsAllCars.best && (
            <div className={styles.block}>
              <div className={styles.blockTitle}>Лучший по прибыли:</div>
              <div className={styles.statSmall}>
                <div><b>Авто:</b> {statsAllCars.best.car}</div>
                <div><b>Доход:</b> {formatMoney(statsAllCars.best.income)} AED</div>
                <div><b>Заказов:</b> {statsAllCars.best.orders}</div>
              </div>
            </div>
          )}

          {statsAllCars.worst && (
            <div className={styles.block}>
              <div className={styles.blockTitle}>Худший по прибыли:</div>
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
          <div className={`${styles.statTitle} font20w700`}>
            Статистика по автомобилю
          </div>

          <div className={`${styles.statSmall} font14w400`}>
            <div><b>ID:</b> {statsCar.carId}</div>
            <div><b>Модель:</b> {statsCar.model}</div>
            <div><b>Номер:</b> {statsCar.number}</div>
          </div>

          <div className={styles.block}>
            <div className={`${styles.blockTitle} font16w600`}>
              Статистика по авто за всё время
            </div>

            <div className={styles.statLine}>
              <span className="font14w400">Кол-во заказов:</span>
              <b className="font14w600">{statsCar.ordersCount}</b>
            </div>

            <div className={styles.statLine}>
              <span className="font14w400">Сумма:</span>
              <b className="font14w600">{formatMoney(statsCar.incomeSum)} AED</b>
            </div>

            <div className={styles.statLine}>
              <span className="font14w400">Кол-во дней аренды:</span>
              <b className="font14w600">{statsCar.rentDays}</b>
            </div>
          </div>

          <div className={styles.block}>
            <div className={`${styles.blockTitle} font16w600`}>
              Заказы:
            </div>

            {pagedOrders.map((o, idx) => (
              <div key={o.id} className={styles.orderItem}>
                <div className={styles.orderTop}>
                  <b className="font14w600">
                    {idx + 1 + (page - 1) * PAGE_SIZE}. {formatDate(o.created_at)}
                  </b>

                  <span className={`${styles.orderStatus} font12w500`}>
                    Завершен
                  </span>
                </div>

                <div className={styles.orderBottom}>
                  <div className={`${styles.orderClient} font14w400`}>
                    <span>{o.payer}</span>
                  </div>

                  <div className={`${styles.orderSum} font14w600`}>
                    {formatMoney(o.sum)} AED
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.verticalIndent} />

      <ButtonSection
        buttons={[
          {
            icon: <ListCollapse strokeWidth={1.5} />,
            text: "Детализация",
            onClick: () => navigate("/financial-main/details"),
          },
          {
            icon: <Car strokeWidth={1.5} />,
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
            <span>Все авто</span>
            {selectedCar === "all" && <span className={styles.check}><Check color={tgTheme.accent} size={20} /></span>}
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
              <span>{car}</span>
              {selectedCar === car && <span className={styles.check}><Check color={tgTheme.accent} size={20} /></span>}
            </button>
          ))}
        </div>
      )}

    </AppLayout>
  );
}
