import React, { useMemo, useState, useEffect } from 'react'
import styles from './CarOrdersPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateOrderMutation, useDeleteOrderMutation, useGetCarByNumberQuery } from '../../../redux/services/carAction'
import { STATUS_MAPPING, tgTheme } from '../../../common/commonStyle'
import { ClipboardEditIcon, Trash2, ChevronLeft, ChevronRight, Plus, UserRound, Calendar, Check } from 'lucide-react'
import CustomButton from '../../../components/CustomButton/CustomButton'
import ModalComponent from '../../../components/ModalComponent/ModalComponent'
import CalendarCustom from '../../../components/CalendarCustom/CalendarCustom'
import InfoModal from '../../../components/InfoModal/InfoModal'

const PAGE_SIZE = 5
function toISO(dateStr) {
  if (!dateStr) return ''

  const convertOne = (d) => {
    const parts = d.trim().split('.')
    if (parts.length !== 3) return ''

    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // если период
  if (dateStr.includes('/')) {
    const [from, to] = dateStr.split('/')
    const fromISO = convertOne(from)
    const toISO = convertOne(to)

    if (!fromISO) return ''
    return toISO ? `${fromISO}/${toISO}` : fromISO
  }

  // если одна дата
  return convertOne(dateStr)
}


export default function CarOrdersPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const {
    data: car = { car: {} },
    isLoading,
    isError,
  } = useGetCarByNumberQuery(id)

  const [createOrder] = useCreateOrderMutation()
  const [deleteOrder] = useDeleteOrderMutation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const orders = car?.car?.orders || []

  const [page, setPage] = useState(1)
  const [orderId, setOrderId] = useState(null);
  const [createOrderModalVisible, setCreateOrderModalVisible] = useState(false);
  const [deleteOrderModalVisible, setDeleteOrderModalVisible] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    date: undefined,
    contact_method: 'whatsapp',
    customer_contact: '',
    location: '',
    selectedCurrency: 'AED',
    price: ''
  });
  const [errors, setErrors] = useState({});
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return orders.slice(start, start + PAGE_SIZE)
  }, [orders, page])

  const canPrev = page > 1
  const canNext = page < totalPages

  const handleSave = async () => {
    const newErrors = {}

    if (!form.customer_name.trim()) newErrors.customer_name = 'Введите имя клиента'
    if (!form.date) newErrors.date = 'Выберите дату аренды'
    if (!form.customer_contact.trim()) newErrors.customer_contact = 'Введите контакт клиента'
    if (!form.selectedCurrency.trim()) newErrors.selectedCurrency = 'Введите валюту'
    if (!form.location.trim()) newErrors.location = 'Введите локацию'
    if (!String(form.price).trim()) newErrors.price = 'Введите цену'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // 🔹 Разбиваем период
    const [startRaw, endRaw] = form.date.split('/')

    const convertToISO = (dateStr) => {
      const [day, month, year] = dateStr.split('.')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    const bodyData = {
      customer_name: form.customer_name.trim(),
      contact_method: form.contact_method.toLowerCase(), // whatsapp
      customer_contact: form.customer_contact.trim(),
      start_date: convertToISO(startRaw),
      end_date: convertToISO(endRaw),
      delivery_location: form.location.trim(),
      selectedCurrency: form.selectedCurrency,
      price: Number(form.price),
      is_paid: false,
    }

    try {
      await createOrder({
        carNumber: id,
        data: bodyData,
      }).unwrap()

      alert('Заказ успешно создан')
    } catch (err) {
      console.log(err)
      alert('Ошибка при создании заказа')
    } finally {
      setCreateOrderModalVisible(false);
      setForm({
        customer_name: '',
        date: undefined,
        contact_method: 'whatsapp',
        customer_contact: '',
        location: '',
        selectedCurrency: 'AED',
        price: ''
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteOrder(orderId).unwrap();
      alert('Заказ успешно удален.')
    } catch (error) {
      console.log(error)
    }
    setDeleteOrderModalVisible(false);
  }

  return (
    <AppLayout title="Заказы" onBack={() => navigate(-1)}>
      {isLoading && (
        <div className={styles.state}>Загрузка заказов...</div>
      )}

      {isError && (
        <div className={styles.stateError}>Ошибка загрузки</div>
      )}

      {!isLoading && !isError && (
        <div>
          <div className={'miniBlock ' + styles.headerFilter}>
            <CustomButton
              icon={<Plus size={16} color={tgTheme.textSecondary} />}
              text='Создать заказ'
              onClick={() => setCreateOrderModalVisible(true)}
            />
          </div>
          <div className={styles.main}>
            {orders.length === 0 && (
              <div className={styles.empty}>
                <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
                  Заказов пока нет
                </span>
              </div>
            )}

            {pageData.map((order) => (
              <div
                key={order.id}
                className={styles.orderCard}
              >
                <div>
                  <div className={styles.orderHeader}>
                    <div className={styles.clientBlock}>
                      <UserRound size={20} color={tgTheme.white} />
                      <span className="font14w600">
                        {order.customer_name}
                      </span>
                    </div>

                    <div className={styles.tagNeutralDot}>
                      <span className="font12w500">
                        {STATUS_MAPPING[order.status]}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderDates}>
                    <span
                      className="font12w500"
                      style={{ color: tgTheme.textSecondary }}
                    >
                      {order.start_date} — {order.end_date}
                    </span>
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <span className="font14w500">
                    {order.price} {order.selectedCurrency}
                  </span>

                  <span
                    className={`font12w500 ${order.is_paid ? styles.paid : styles.notPaid
                      }`}
                  >
                    {order.is_paid ? 'Оплачено' : 'Не оплачено'}
                  </span>
                </div>

                <div className={styles.right}>
                  <button
                    className={styles.btn}
                    onClick={(e) => {
                      e.stopPropagation()
                      // navigate(`/cars/${id}/orders/${order.id}/edit`)
                      setInfoVisible(true)
                    }}
                  >
                    <ClipboardEditIcon
                      size={16}
                      color={tgTheme.text}
                      strokeWidth={1.5}
                    />
                  </button>

                  <button
                    className={styles.btn}
                    onClick={(e) => {
                      e.stopPropagation()
                      setOrderId(order.id)
                      setDeleteOrderModalVisible(true)
                    }}
                  >
                    <Trash2
                      size={16}
                      color={tgTheme.text}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>
            ))}

            {orders.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                >
                  <ChevronLeft size={18} color={tgTheme.btnActive} />
                </button>

                <div className={styles.pageInfo}>
                  {page} / {totalPages}
                </div>

                <button
                  className={styles.pageBtn}
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                >
                  <ChevronRight size={18} color={tgTheme.btnActive} />
                </button>
              </div>
            )}
          </div>
        </div>

      )}
      <ModalComponent visible={createOrderModalVisible} setVisible={setCreateOrderModalVisible}
        title='Создать новый заказ' children={<div className={styles.modalForm}>

          {/* Имя клиента */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Имя клиента
            </span>
            <input
              className={styles.input}
              value={form.customer_name}
              onChange={(e) => {
                setErrors((p) => ({ ...p, customer_name: null }))
                setForm((p) => ({ ...p, customer_name: e.target.value }))
              }
              }
              placeholder="Введите имя"
            />
            {
              errors.customer_name && <span className='font12w400' style={{ color: tgTheme.danger }}>
                {errors.customer_name}</span>
            }
          </div>

          {/* Дата */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Дата аренды
            </span>

            <div className={styles.answer}
              onClick={() => setCalendarVisible(true)}>
              <span className='font14w500'>
                {form.date || 'Выберите дату'}
              </span>
              <Calendar size={16} color={tgTheme.white} />
            </div>
            <div className={styles.dateBlock}>
              <CalendarCustom
                visible={calendarVisible}
                setVisible={setCalendarVisible}
                date={toISO(form.data)}
                setDate={(val) => {
                  setErrors((p) => ({ ...p, date: null }))
                  setForm((p) => ({ ...p, date: val }))
                }}
                mode='range'
                listBlockPosition={'right'}
              />
            </div>
            {
              errors.date && <span className='font12w400' style={{ color: tgTheme.danger }}>
                {errors.date}</span>
            }
          </div>

          {/* Способ связи */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Способ связи
            </span>

            <div className={styles.statusSwitch}>
              {['whatsapp', 'telegram', 'phone'].map((type) => (
                <div
                  key={type}
                  className={styles.statusBtn}
                  onClick={() =>
                    setForm((p) => ({ ...p, contact_method: type }))
                  }
                >
                  <span
                    className="font14w500"
                    style={{
                      color:
                        form.contact_method === type
                          ? tgTheme.white
                          : tgTheme.textSecondary,
                    }}
                  >
                    {type}
                  </span>

                  {form.contact_method === type && (
                    <Check size={16} color={tgTheme.accent} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Контакт */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Контакт для {form.contact_method}
            </span>
            <input
              className={styles.input}
              value={form.customer_contact}
              onChange={(e) => {
                setErrors((p) => ({ ...p, customer_contact: null }))
                setForm((p) => ({ ...p, customer_contact: e.target.value }))
              }
              }
              placeholder={"Телефон"}
            />
            {
              errors.customer_contact && <span className='font12w400' style={{ color: tgTheme.danger }}>
                {errors.customer_contact}</span>
            }
          </div>

          {/* Локация */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Локация доставки/возврата
            </span>
            <input
              className={styles.input}
              value={form.location}
              onChange={(e) => {
                setErrors((p) => ({ ...p, location: null }))
                setForm((p) => ({ ...p, location: e.target.value }))
              }
              }
              placeholder="Город / адрес"
            />
            {
              errors.location && <span className='font12w400' style={{ color: tgTheme.danger }}>
                {errors.location}</span>
            }
          </div>

          {/* Валюта */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Введите валюту
            </span>
            <input
              className={styles.input}
              value={form.selectedCurrency}
              onChange={(e) => {
                setErrors((p) => ({ ...p, selectedCurrency: null }))
                setForm((p) => ({ ...p, selectedCurrency: e.target.value }))
              }
              }
              placeholder="Введите валюту"
            />
            {
              errors.selectedCurrency && <span className='font12w400' style={{ color: tgTheme.danger }}>
                {errors.selectedCurrency}</span>
            }
          </div>

          {/* Цена */}
          <div className={styles.field}>
            <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
              Цена
            </span>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={form.price}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '')
                setErrors((p) => ({ ...p, price: null }))
                setForm((p) => ({ ...p, price: onlyNumbers }))
              }}
              placeholder="Введите цену"
            />

            {
              errors.price && <span className='font12w400' style={{ color: tgTheme.danger }}>
                {errors.price}</span>
            }
          </div>

        </div>} textButton='Создать' onSave={handleSave}>

      </ModalComponent>
      <ModalComponent title={'Вы точно хотите удалить заказ?'}
        visible={deleteOrderModalVisible} setVisible={setDeleteOrderModalVisible}
        textButton='Удалить' onSave={handleDelete} children={<div>
          <span className='font14w500' style={{ color: tgTheme.textSecondary }}>Это действие невозможно отменить.
            Все данные по заказу будут безвозвратно удалены.</span>
        </div>}>

      </ModalComponent>
      <InfoModal
        visible={infoVisible}
        setVisible={setInfoVisible}
      />
    </AppLayout>
  )
}
