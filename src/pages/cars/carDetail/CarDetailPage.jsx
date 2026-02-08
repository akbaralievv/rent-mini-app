import React, { useState } from 'react'
import styles from './CarDetailPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetCarByNumberQuery } from '../../../redux/services/carAction'
import {
  Car,
  Calendar,
  Users,
  Fuel,
  Settings,
  BadgeDollarSign,
  Repeat,
  Gauge,
  Palette,
  User,
  Plus,
  Trash,
  ClipboardEditIcon,
  Edit2,
  Edit3,
  Edit,
  Wrench,
  List,
  Images,
  DollarSign,
  Eye,
  ListOrdered
} from 'lucide-react'
import { STATUS_MAPPING, tgTheme } from '../../../common/commonStyle'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU")
}

export default function CarDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [priceType, setPriceType] = useState('b2c') // b2c | b2b

  const {
    data: car = { car: {} },
    isLoading,
    isError,
  } = useGetCarByNumberQuery(id)

  const data = car?.car || {}

  return (
    <AppLayout title={`Детализация (${data.car_number})`} onBack={() => navigate(-1)}>
      <div>
        {isLoading && (
          <div className={styles.state}>Загрузка автомобиля...</div>
        )}

        {isError && (
          <div className={styles.stateError}>Ошибка загрузки</div>
        )}

        {!isLoading && !isError && data && (
          <div className={styles.tgCard}>

            <div className={styles.header}>
              <div className={styles.tgTitle}>
                <Car size={24} color={tgTheme.white} />
                <span className='font16w600'>
                  {data.car_name}
                </span>
              </div>
              <div className={styles.tagNeutralDot}>
                <span className="font12w500">
                  {STATUS_MAPPING[car.car.status]}
                </span>
              </div>
            </div>

            <div className={styles.infoBlock}>

              <div className={styles.infoBlockItem}>
                <div className={styles.infoRow}>
                  <Calendar size={16} color={tgTheme.textSecondary} />
                  <span style={{ color: tgTheme.textSecondary }}>{data.car_year}</span>
                </div>

                <div className={styles.infoRow}>
                  <Users size={16} color={tgTheme.textSecondary} />
                  <span style={{ color: tgTheme.textSecondary }} color={tgTheme.textSecondary}>{data.car_people} мест</span>
                </div>
              </div>

              <div className={styles.infoBlockItem}>
                <div className={styles.infoRow}>
                  <Fuel size={16} color={tgTheme.textSecondary} />
                  <span style={{ color: tgTheme.textSecondary }} color={tgTheme.textSecondary}>{data.car_power}</span>
                </div>

                <div className={styles.infoRow}>
                  <Settings size={16} color={tgTheme.textSecondary} />
                  <span style={{ color: tgTheme.textSecondary }} color={tgTheme.textSecondary}>{data.car_transmission}</span>
                </div>
              </div>

              <div className={styles.infoBlockItem}>
                <div className={styles.infoRow}>
                  <Gauge size={16} color={tgTheme.textSecondary} />
                  <span style={{ color: tgTheme.textSecondary }}>
                    {data.car_engine}L
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <Palette size={16} color={tgTheme.textSecondary} />
                  <span style={{ color: tgTheme.textSecondary }}>
                    {data.car_color_s}
                  </span>
                </div>
              </div>

            </div>

            <div className={styles.priceCard}>
              <div className={styles.priceContent}>
                {priceType === 'b2c' ? (
                  <>
                    <div className={styles.priceRow}>
                      <span className='font12w500'>1 день</span>
                      <b className='font14w500'>{formatMoney(data.car_price_3)} AED</b>
                    </div>
                    <div className={styles.priceRow}>
                      <span className='font12w500'>7 дней</span>
                      <b className='font14w500'>{formatMoney(data.car_price_7)} AED</b>
                    </div>
                    <div className={styles.priceRow}>
                      <span className='font12w500'>30 дней</span>
                      <b className='font14w500'>{formatMoney(data.car_price_30)} AED</b>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.priceRow}>
                      <span className='font12w500'>1 день</span>
                      <b className='font14w500'>{formatMoney(data.car_price_b2b_1)} AED</b>
                    </div>
                    <div className={styles.priceRow}>
                      <span className='font12w500'>7 дней</span>
                      <b className='font14w500'>{formatMoney(data.car_price_b2b_7)} AED</b>
                    </div>
                    <div className={styles.priceRow}>
                      <span className='font12w500'>30 дней</span>
                      <b className='font14w500'>{formatMoney(data.car_price_b2b_30)} AED</b>
                    </div>
                  </>
                )}
                <div className={styles.switcherWrapper}>
                  <div className={styles.switcher}>
                    <button
                      className={`${styles.switchBtn} ${priceType === 'b2c' ? styles.active : ''}`}
                      onClick={() => setPriceType('b2c')}
                    >
                      <span className='font12w500'>
                        B2C
                      </span>
                    </button>

                    <button
                      className={`${styles.switchBtn} ${priceType === 'b2b' ? styles.active : ''}`}
                      onClick={() => setPriceType('b2b')}
                    >
                      <span className='font12w500'>
                        B2B
                      </span>
                    </button>

                    <div
                      className={`${styles.slider} ${priceType === 'b2b' ? styles.right : ''}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Заказы */}
            {data.orders && data.orders.length > 0 ? (
              <div className={styles.ordersBlock}>
                <div className={styles.ordersTitle}>
                  <User size={22} color={tgTheme.white} />
                  <span className={`font16w600 ${styles.clientName}`}>Клиент: {data.orders[0].customer_name}</span>
                </div>

                {data.orders?.slice(0, 1).map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span className={'font14w500'} style={{ color: tgTheme.textSecondary }}>
                        {order.start_date} — {order.end_date}
                      </span>
                      <div className={'font14w500'} style={{ color: tgTheme.success }}>
                        {formatMoney(order.price)} AED
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.ordersEmpty}>
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Нет активных заказов
                </span>
              </div>
            )}
          </div>
        )}
        <div className={styles.topIndent} />
        <ButtonSection
          title={'Редактировать'}
          buttons={[
            {
              icon: <Car size={20} color={tgTheme.white} />,
              text: 'Изменить модель',
              onClick: () => { },
              arrowHide: true,
            },
            {
              icon: <Calendar size={20} color={tgTheme.white} />,
              text: 'дата аренды: 02.02.2026-09.09.2027',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <Settings size={20} color={tgTheme.white} />,
              text: 'Изменить статус',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <Edit size={20} color={tgTheme.white} />,
              text: 'Ред. описание',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <User size={20} color={tgTheme.white} />,
              text: 'Изменить клиента',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <Eye size={20} color={tgTheme.white} />,
              text: 'Показан на витрине (да)',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <DollarSign size={20} color={tgTheme.white} />,
              text: 'Ред. B2C цену',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <DollarSign size={20} color={tgTheme.white} />,
              text: 'Ред. B2B цену',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: <Trash size={20} color={tgTheme.white} />,
              text: 'Удалить авто',
              onClick: () => { },
              arrowHide: true
            },
          ]}
        />
        <div className={styles.topIndent} />
        <ButtonSection
          title={'Разделы'}
          buttons={[
            {
              icon: <ListOrdered size={20} color={tgTheme.white} />,
              text: 'Заказы',
              onClick: () => { },
            },
            {
              icon: <Wrench size={20} color={tgTheme.white} />,
              text: 'ТО авто',
              onClick: () => { },
            },
            {
              icon: <List size={20} color={tgTheme.white} />,
              text: 'Все характеристики',
              onClick: () => { },
            },
            {
              icon: <Images size={20} color={tgTheme.white} />,
              text: 'Картинки',
              onClick: () => { },
            },
          ]}
        />
      </div>
    </AppLayout>
  )
}
