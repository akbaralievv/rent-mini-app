import React from 'react'
import styles from './CarDetailPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetCarByNumberQuery } from '../../../redux/services/carAction'
import { STATUS_MAPPING } from '../../../common/commonStyle'

export default function CarDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const {
    data: car,
    isLoading,
    isError,
  } = useGetCarByNumberQuery(id)

  return (
    <AppLayout title="Детализация" onBack={() => navigate(-1)}>

      {/* ⏳ Загрузка */}
      {isLoading && (
        <div className={styles.state}>
          Загрузка данных автомобиля…
        </div>
      )}

      {/* ❌ Ошибка */}
      {isError && (
        <div className={styles.stateError}>
          ❌ Не удалось загрузить автомобиль
        </div>
      )}

      {/* ✅ Данные */}
      {!isLoading && !isError && car && (
        <div className={styles.tgCard}>

          {/* Заголовок */}
          <div className={styles.tgTitle}>
            🚗 {car.car_name || '—'} ({car.car_number || '—'})
          </div>

          {/* Статус */}
          <div className={styles.tgLine}>
            📍 <span className={styles.label}>Статус:</span>
            <b>{STATUS_MAPPING?.[car.status] || car.status || '—'}</b>
          </div>

          {/* B2C */}
          <div className={styles.tgSection}>
            <div className={styles.tgSectionTitle}>💼 B2C (AED)</div>

            <div className={styles.tgRow}>
              <span>День</span>
              <span>{car.car_price_b2c ?? 0} AED</span>
            </div>
            <div className={styles.tgRow}>
              <span>Неделя</span>
              <span>0 AED</span>
            </div>
            <div className={styles.tgRow}>
              <span>Месяц</span>
              <span>0 AED</span>
            </div>
          </div>

          {/* B2B */}
          <div className={styles.tgSection}>
            <div className={styles.tgSectionTitle}>💼 B2B (AED)</div>

            <div className={styles.tgRow}>
              <span>День</span>
              <span>{car.car_price_b2b ?? 0} AED</span>
            </div>
            <div className={styles.tgRow}>
              <span>Неделя</span>
              <span>0 AED</span>
            </div>
            <div className={styles.tgRow}>
              <span>Месяц</span>
              <span>0 AED</span>
            </div>
          </div>

          {/* Активный заказ */}
          {car.current_order ? (
            <div className={styles.tgFooter}>
              <div>
                👤 <b>Клиент:</b> {car.current_order.customer_name || '—'}
              </div>
              <div>
                📅 <b>От:</b> {car.current_order.start_date}
                {' — '}
                <b>До:</b> {car.current_order.end_date}
              </div>
              <div className={styles.tgPrice}>
                💰 Цена: {car.current_order.price ?? 0} AED
              </div>
            </div>
          ) : (
            <div className={styles.tgFooterMuted}>
              📭 Сейчас автомобиль без активных заказов
            </div>
          )}

        </div>
      )}

    </AppLayout>
  )
}
