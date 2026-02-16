import React, { useState } from 'react'
import styles from './CarDetailPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteCarMutation, useGetCarByNumberQuery } from '../../../redux/services/carAction'
import {
  Car,
  Calendar,
  Users,
  Fuel,
  Settings,
  Gauge,
  Palette,
  User,
  Trash,
  Edit,
  Wrench,
  List,
  Images,
  DollarSign,
  Eye,
  ListOrdered,
  X,
  EyeOff
} from 'lucide-react'
import { STATUS_MAPPING, tgTheme } from '../../../common/commonStyle'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import CalendarCustom from '../../../components/CalendarCustom/CalendarCustom'
import ItemStatus from '../FormItems/ItemStatus/ItemStatus'
import ItemShowcase from '../FormItems/ItemShowcase/ItemShowcase'
import ModalComponent from '../../../components/ModalComponent/ModalComponent'
import ItemB2C from '../FormItems/ItemB2C/ItemB2C'
import ItemB2B from '../FormItems/ItemB2B/ItemB2B'
import ItemDesc from '../FormItems/ItemDesc/ItemDesc'

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
  } = useGetCarByNumberQuery(id);

  const [deleteCar] = useDeleteCarMutation();

  const data = car?.car || {}
  const [modalStatusVisible, setModalStatusVisible] = useState(false);
  const [modalShowcaseVisible, setModalShowcaseVisible] = useState(false);
  const [modalDescVisible, setModalDescVisible] = useState(false);
  const [modalB2CVisible, setModalB2CVisible] = useState(false);
  const [modalB2BVisible, setModalB2BVisible] = useState(false);

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);

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
          title={'Разделы'}
          buttons={[
            {
              icon: <ListOrdered size={20} color={tgTheme.white} />,
              text: 'Заказы',
              onClick: () => navigate(`/cars/${car.car.car_number}/orders`),
            },
            {
              icon: <Wrench size={20} color={tgTheme.white} />,
              text: 'ТО авто',
              onClick: () => navigate(`/cars/${car.car.car_number}/services`),
            },
            {
              icon: <List size={20} color={tgTheme.white} />,
              text: 'Все характеристики',
              onClick: () => navigate(`/cars/${car.car.car_number}/characteristics`),
            },
            {
              icon: <Images size={20} color={tgTheme.white} />,
              text: 'Картинки',
              onClick: () => navigate(`/cars/${car.car.car_number}/images`),
            },
          ]}
        />
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
              onClick: () => setModalStatusVisible(true),
              arrowHide: true
            },
            {
              icon: <Edit size={20} color={tgTheme.white} />,
              text: 'Ред. описание',
              onClick: () => setModalDescVisible(true),
              arrowHide: true
            },
            {
              icon: <User size={20} color={tgTheme.white} />,
              text: 'Изменить клиента',
              onClick: () => { },
              arrowHide: true
            },
            {
              icon: car.car.b2c_status == 'yes' ? <Eye size={20} color={tgTheme.white} />
                : <EyeOff size={20} color={tgTheme.white} />,
              text: `Показан на витрине (${car.car.b2c_status == 'yes' ? 'да' : 'нет'})`,
              onClick: () => setModalShowcaseVisible(true),
              arrowHide: true
            },
            {
              icon: <DollarSign size={20} color={tgTheme.white} />,
              text: 'Ред. B2C цену',
              onClick: () => setModalB2CVisible(true),
              arrowHide: true
            },
            {
              icon: <DollarSign size={20} color={tgTheme.white} />,
              text: 'Ред. B2B цену',
              onClick: () => setModalB2BVisible(true),
              arrowHide: true
            },
            {
              icon: <Trash size={20} color={tgTheme.danger} />,
              text: 'Удалить авто',
              onClick: () => setModalDeleteVisible(true),
              arrowHide: true,
              color: tgTheme.danger
            },
          ]}
        />
      </div>
      <ItemStatus visible={modalStatusVisible} setVisible={setModalStatusVisible}
        status={car.car.status} car_number={car.car.car_number} />
      <ItemShowcase visible={modalShowcaseVisible} setVisible={setModalShowcaseVisible}
        showcase={car.car.b2c_status} car_number={car.car.car_number} />
      <ItemDesc visible={modalDescVisible} setVisible={setModalDescVisible}
        descRu={car.car.car_description} descEn={car.car.car_description_eng} car_number={car.car.car_number} />
      <ItemB2C visible={modalB2CVisible} setVisible={setModalB2CVisible}
        periods={[
          {
            text: 'День',
            key: 'b2c_price_3_aed',
            value: car.car.car_price_3,
          },
          {
            text: 'Неделя',
            key: 'b2c_price_7_aed',
            value: car.car.car_price_7,
          },
          {
            text: 'Месяц',
            key: 'b2c_price_30_aed',
            value: car.car.car_price_30,
          },
        ]} car_number={car.car.car_number} />
      <ItemB2B visible={modalB2BVisible} setVisible={setModalB2BVisible}
        periods={[
          {
            text: 'День',
            key: 'b2b_price_1_aed',
            value: car.car.car_price_b2b_1,
          },
          {
            text: 'Неделя',
            key: 'b2b_price_7_aed',
            value: car.car.car_price_b2b_7,
          },
          {
            text: 'Месяц',
            key: 'b2b_price_30_aed',
            value: car.car.car_price_b2b_30,
          },
        ]} car_number={car.car.car_number} />

      <ModalComponent visible={modalDeleteVisible} setVisible={setModalDeleteVisible}
        textButton='Удалить' title={'Удалить авто?'} onSave={() => {
          deleteCar(car.car.car_number)
          navigate(-1);
        }}
        children={<div>
          <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
            авто "{car.car.car_name}" будет удален без возвратно.
          </span>
        </div>}
      />
    </AppLayout>
  )
}
