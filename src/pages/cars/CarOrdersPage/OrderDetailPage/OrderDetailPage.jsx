import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../../layouts/AppLayout'
import { tgTheme, STATUS_MAPPING } from '../../../../common/commonStyle'
import { getErrorMessage } from '../../../../utils'
import {
  useGetCarByNumberQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from '../../../../redux/services/carAction'
import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
} from '../../../../redux/services/financeApi'
import {
  Check,
  ChevronDown,
  Calendar,
  Trash2,
  UserRound,
  Phone,
  MapPin,
  DollarSign,
  PackageCheck,
  CreditCard,
  Wallet,
  FileText,
  FileCheck,
  Receipt,
  CarFront,
  RefreshCw,
} from 'lucide-react'
import BackdropModal from '../../../../components/BackdropModal/BackdropModal'
import CalendarCustom from '../../../../components/CalendarCustom/CalendarCustom'
import ModalComponent from '../../../../components/ModalComponent/ModalComponent'
import styles from './OrderDetailPage.module.css'

const ORDER_STATUS_OPTIONS = [
  { key: 'Booked', label: 'Забронирован' },
  { key: 'Delivery', label: 'Доставка' },
  { key: 'Rented', label: 'Арендован' },
  { key: 'ended', label: 'Завершен' },
]

const CONTACT_METHODS = ['whatsapp', 'telegram', 'phone']

function toDisplayDate(dateStr) {
  if (!dateStr) return ''

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-')
    return `${d}.${m}.${y}`
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/')
    return `${d}.${m}.${y}`
  }
  return dateStr
}

function toIsoDate(dateStr) {
  if (!dateStr) return ''

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10)

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('.')
    return `${y}-${m}-${d}`
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/')
    return `${y}-${m}-${d}`
  }
  return dateStr
}

export default function OrderDetailPage() {
  const navigate = useNavigate()
  const { id: carNumber, orderId } = useParams()
  const isCreate = !orderId

  const { data: carData, isLoading: carLoading } = useGetCarByNumberQuery(carNumber)
  const [createOrder, { isLoading: creating }] = useCreateOrderMutation()
  const [updateOrder, { isLoading: updating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: deleting }] = useDeleteOrderMutation()

  const { data: depositData } = useGetTransactionsQuery(
    { order_id: orderId, type: 'deposit_add,deposit_return', per_page: 1, order: 'desc' },
    { skip: isCreate }
  )
  const [createTransaction] = useCreateTransactionMutation()
  const [deleteTransaction] = useDeleteTransactionMutation()

  const car = carData?.car || {}
  const orders = car?.orders || []
  const order = isCreate ? null : orders.find((o) => String(o.id) === String(orderId))

  const depositTransaction = depositData?.data?.[0] || null
  const depositAmount = depositTransaction?.amount || null

  const saving = creating || updating

  const [form, setForm] = useState({
    customer_name: '',
    start_date: '',
    end_date: '',
    contact_method: 'whatsapp',
    customer_contact: '',
    delivery_location: '',
    selectedCurrency: 'AED',
    price: '',
    status: 'Booked',
    is_paid: false,
  })

  const [errors, setErrors] = useState({})
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [closeModalVisible, setCloseModalVisible] = useState(false)
  const [extendModalVisible, setExtendModalVisible] = useState(false)
  const [depositModalVisible, setDepositModalVisible] = useState(false)
  const [deleteDepositModalVisible, setDeleteDepositModalVisible] = useState(false)
  const [depositForm, setDepositForm] = useState({ amount: '', description: '' })
  const [depositErrors, setDepositErrors] = useState({})
  const [initialized, setInitialized] = useState(false)

  if (!initialized && order && !isCreate) {
    setForm({
      customer_name: order.customer_name || '',
      start_date: order.start_date || '',
      end_date: order.end_date || '',
      contact_method: order.contact_method || 'whatsapp',
      customer_contact: order.customer_contact || '',
      delivery_location: order.delivery_location || '',
      selectedCurrency: order.selectedCurrency || 'AED',
      price: order.price ? String(order.price) : '',
      status: order.status || 'Booked',
      is_paid: Boolean(order.is_paid),
    })
    setInitialized(true)
  }

  const onChange = (key, value) => {
    setErrors((p) => ({ ...p, [key]: null }))
    setForm((p) => ({ ...p, [key]: value }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.customer_name.trim()) newErrors.customer_name = 'Введите имя клиента'
    if (!form.start_date) newErrors.date = 'Выберите дату аренды'
    if (!form.customer_contact.trim()) newErrors.customer_contact = 'Введите контакт'
    if (!form.delivery_location.trim()) newErrors.delivery_location = 'Введите локацию'
    if (!form.selectedCurrency.trim()) newErrors.selectedCurrency = 'Введите валюту'
    if (!String(form.price).trim()) newErrors.price = 'Введите цену'
    return newErrors
  }

  const handleSave = async () => {
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      const bodyData = {
        customer_name: form.customer_name.trim(),
        contact_method: form.contact_method,
        customer_contact: form.customer_contact.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        delivery_location: form.delivery_location.trim(),
        selectedCurrency: form.selectedCurrency,
        price: Number(form.price),
        is_paid: form.is_paid,
      }

      if (isCreate) {
        await createOrder({ carNumber, data: bodyData }).unwrap()
      } else {
        await updateOrder({
          orderId,
          data: { ...bodyData, status: form.status },
        }).unwrap()
      }

      navigate(-1)
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось сохранить заказ')}`)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteOrder(orderId).unwrap()
      setDeleteModalVisible(false)
      navigate(-1)
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось удалить заказ')}`)
    }
  }

  const handleCloseRental = async () => {
    try {
      await updateOrder({
        orderId,
        data: { status: 'ended' },
      }).unwrap()
      setCloseModalVisible(false)
      onChange('status', 'ended')
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось завершить аренду')}`)
    }
  }

  const handleExtendOrder = async () => {
    try {
      await updateOrder({
        orderId,
        data: { status: 'ended' },
      }).unwrap()
      setExtendModalVisible(false)

      navigate(`/cars/${carNumber}/orders/create?extend=${orderId}&customer_name=${encodeURIComponent(form.customer_name)}&contact_method=${form.contact_method}&customer_contact=${encodeURIComponent(form.customer_contact)}&delivery_location=${encodeURIComponent(form.delivery_location)}&selectedCurrency=${form.selectedCurrency}&price=${form.price}`)
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось продлить заказ')}`)
    }
  }

  const handleCreateDeposit = async () => {
    const newErrors = {}
    if (!depositForm.amount) newErrors.amount = 'Введите сумму'
    setDepositErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      await createTransaction({
        type: 'deposit_add',
        amount: Number(depositForm.amount),
        description: depositForm.description || `Депозит по заказу #${orderId}`,
        order_id: Number(orderId),
        currency: form.selectedCurrency,
        customer_name: form.customer_name,
        car_number: carNumber,
        car_name: car.car_name || '',
      }).unwrap()
      setDepositModalVisible(false)
      setDepositForm({ amount: '', description: '' })
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось создать депозит')}`)
    }
  }

  const handleDeleteDeposit = async () => {
    if (!depositTransaction) return
    try {
      await deleteTransaction(depositTransaction.id).unwrap()
      setDeleteDepositModalVisible(false)
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось удалить депозит')}`)
    }
  }

  const handleDownloadInvoice = () => {
    const apiUrl = import.meta.env.VITE_API_URL
    window.open(`${apiUrl}/api/ordersDocs/${orderId}/invoice/pdf`, '_blank')
  }

  if (!initialized && isCreate) {
    const params = new URLSearchParams(window.location.search)
    if (params.get('extend')) {
      setForm({
        customer_name: params.get('customer_name') || '',
        start_date: '',
        end_date: '',
        contact_method: params.get('contact_method') || 'whatsapp',
        customer_contact: params.get('customer_contact') || '',
        delivery_location: params.get('delivery_location') || '',
        selectedCurrency: params.get('selectedCurrency') || 'AED',
        price: params.get('price') || '',
        status: 'Booked',
        is_paid: false,
      })
      setInitialized(true)
    }
  }

  if (carLoading) {
    return (
      <AppLayout title="Заказ" onBack={() => navigate(-1)}>
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      </AppLayout>
    )
  }

  if (!isCreate && !order && !carLoading) {
    return (
      <AppLayout title="Заказ" onBack={() => navigate(-1)}>
        <div className={styles.state}>Заказ не найден</div>
      </AppLayout>
    )
  }

  const dateDisplay = form.start_date
    ? `${toDisplayDate(form.start_date)} — ${toDisplayDate(form.end_date || form.start_date)}`
    : 'Выберите период'

  const isEnded = form.status === 'ended'

  return (
    <AppLayout
      title={isCreate ? 'Новый заказ' : 'Заказ'}
      onBack={() => navigate(-1)}
    >
      <div className={styles.pageWrapper}>
        {car.car_name && (
          <div className={styles.carHeader}>
            <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
              {car.car_name} • {car.car_number}
            </span>
          </div>
        )}

        <div className={styles.modalLike}>
          <div className={styles.modalBody}>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <UserRound size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Клиент
                </span>
              </div>
              <input
                className={`${styles.input} ${errors.customer_name ? styles.inputError : ''}`}
                value={form.customer_name}
                onChange={(e) => onChange('customer_name', e.target.value)}
                placeholder="Введите имя"
              />
              {errors.customer_name && (
                <span className={styles.errorText}>{errors.customer_name}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <Calendar size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Период аренды
                </span>
              </div>
              <div className={styles.selectWrapper}>
                <button
                  className={styles.selectLike}
                  onClick={() => setCalendarVisible(true)}
                >
                  <span className="font14w500">{dateDisplay}</span>
                  <Calendar size={16} color={tgTheme.textSecondary} />
                </button>

                <CalendarCustom
                  visible={calendarVisible}
                  setVisible={setCalendarVisible}
                  date={form.start_date || ''}
                  setDate={(value) => {
                    const [startRaw, endRaw] = value.split('/')
                    onChange('start_date', toIsoDate(startRaw))
                    setForm((p) => ({
                      ...p,
                      end_date: toIsoDate(endRaw || startRaw),
                    }))
                    setErrors((p) => ({ ...p, date: null }))
                  }}
                  mode="range"
                  listBlockPosition="left"
                />
              </div>
              {errors.date && (
                <span className={styles.errorText}>{errors.date}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <Phone size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Способ связи
                </span>
              </div>
              <div className={styles.contactSwitch}>
                {CONTACT_METHODS.map((type) => (
                  <div
                    key={type}
                    className={`${styles.contactBtn} ${form.contact_method === type ? styles.contactBtnActive : ''}`}
                    onClick={() => onChange('contact_method', type)}
                  >
                    <span className="font13w500">{type}</span>
                    {form.contact_method === type && (
                      <Check size={14} color={tgTheme.accent} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <Phone size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Контакт ({form.contact_method})
                </span>
              </div>
              <input
                className={`${styles.input} ${errors.customer_contact ? styles.inputError : ''}`}
                value={form.customer_contact}
                onChange={(e) => onChange('customer_contact', e.target.value)}
                placeholder="Телефон или имя пользователя"
              />
              {errors.customer_contact && (
                <span className={styles.errorText}>{errors.customer_contact}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <MapPin size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Локация
                </span>
              </div>
              <input
                className={`${styles.input} ${errors.delivery_location ? styles.inputError : ''}`}
                value={form.delivery_location}
                onChange={(e) => onChange('delivery_location', e.target.value)}
                placeholder="Город / адрес"
              />
              {errors.delivery_location && (
                <span className={styles.errorText}>{errors.delivery_location}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <DollarSign size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Валюта
                </span>
              </div>
              <input
                className={`${styles.input} ${errors.selectedCurrency ? styles.inputError : ''}`}
                value={form.selectedCurrency}
                onChange={(e) => onChange('selectedCurrency', e.target.value)}
                placeholder="AED"
              />
              {errors.selectedCurrency && (
                <span className={styles.errorText}>{errors.selectedCurrency}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <DollarSign size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Цена
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                value={form.price}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, '')
                  onChange('price', onlyNumbers)
                }}
                placeholder="Введите цену"
              />
              {errors.price && (
                <span className={styles.errorText}>{errors.price}</span>
              )}
            </div>

            {!isCreate && (
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <PackageCheck size={16} color={tgTheme.textSecondary} />
                  <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                    Статус
                  </span>
                </div>
                <div className={styles.selectWrapper}>
                  <button
                    className={styles.selectLike}
                    onClick={() => setStatusOpen((p) => !p)}
                  >
                    <span className="font14w500">
                      {STATUS_MAPPING[form.status] || form.status}
                    </span>
                    <ChevronDown size={16} color={tgTheme.textSecondary} />
                  </button>

                  {statusOpen && (
                    <>
                      <BackdropModal onClick={() => setStatusOpen(false)} />
                      <div className={styles.dropdown}>
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              onChange('status', opt.key)
                              setStatusOpen(false)
                            }}
                          >
                            <span className="font14w500">{opt.label}</span>
                            {opt.key === form.status && (
                              <Check color={tgTheme.accent} size={18} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className={styles.field}>
              <div className={styles.fieldLabel}>
                <CreditCard size={16} color={tgTheme.textSecondary} />
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  Статус оплаты
                </span>
              </div>
              <div
                className={styles.paymentToggle}
                onClick={() => onChange('is_paid', !form.is_paid)}
              >
                <div
                  className={`${styles.toggleTrack} ${form.is_paid ? styles.toggleActive : ''}`}
                >
                  <div className={styles.toggleThumb} />
                </div>
                <span
                  className="font14w500"
                  style={{ color: form.is_paid ? tgTheme.success : tgTheme.danger }}
                >
                  {form.is_paid ? 'Оплачено' : 'Не оплачено'}
                </span>
              </div>
            </div>

            {!isCreate && (
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <Wallet size={16} color={tgTheme.textSecondary} />
                  <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                    Депозит
                  </span>
                </div>
                {depositAmount ? (
                  <div className={styles.depositInfo}>
                    <span className="font14w600">
                      {depositAmount} {form.selectedCurrency}
                    </span>
                    {depositTransaction?.description && (
                      <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
                        {depositTransaction.description}
                      </span>
                    )}
                    <button
                      className={styles.depositDeleteBtn}
                      onClick={() => setDeleteDepositModalVisible(true)}
                    >
                      <Trash2 size={14} color={tgTheme.danger} />
                      <span className="font12w500" style={{ color: tgTheme.danger }}>
                        Удалить депозит
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.actionBtn}
                    onClick={() => setDepositModalVisible(true)}
                  >
                    <Wallet size={16} color={tgTheme.accent} />
                    <span className="font14w500" style={{ color: tgTheme.accent }}>
                      Создать депозит
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {!isCreate && (
            <div className={styles.actionsSection}>
              <div className={styles.actionsDivider} />

              <button
                className={styles.actionRow}
                onClick={() => navigate(`/cars/${carNumber}/orders/${orderId}/documents`)}
              >
                <FileText size={18} color={tgTheme.textSecondary} />
                <span className="font14w500">Документы водителя</span>
              </button>

              <button
                className={styles.actionRow}
                onClick={() => navigate(`/cars/${carNumber}/orders/${orderId}/contracts`)}
              >
                <FileCheck size={18} color={tgTheme.textSecondary} />
                <span className="font14w500">Договор</span>
              </button>

              <button
                className={styles.actionRow}
                onClick={handleDownloadInvoice}
              >
                <Receipt size={18} color={tgTheme.textSecondary} />
                <span className="font14w500">Инвойс</span>
              </button>

              <div className={styles.actionsDivider} />

              {!isEnded && (
                <button
                  className={styles.actionRow}
                  onClick={() => setCloseModalVisible(true)}
                >
                  <CarFront size={18} color={tgTheme.warning} />
                  <span className="font14w500" style={{ color: tgTheme.warning }}>
                    Завершить аренду
                  </span>
                </button>
              )}

              {!isEnded && (
                <button
                  className={styles.actionRow}
                  onClick={() => setExtendModalVisible(true)}
                >
                  <RefreshCw size={18} color={tgTheme.success} />
                  <span className="font14w500" style={{ color: tgTheme.success }}>
                    Продлить заказ
                  </span>
                </button>
              )}
            </div>
          )}

          <div className={styles.modalFooter}>
            {!isCreate && (
              <button
                className={styles.deleteBtn}
                onClick={() => setDeleteModalVisible(true)}
                disabled={deleting}
              >
                <Trash2 size={16} color={tgTheme.danger} />
                <span className="font14w600" style={{ color: tgTheme.danger }}>
                  Удалить
                </span>
              </button>
            )}

            <div className={styles.footerRight}>
              <button
                className={styles.secondaryBtn}
                onClick={() => navigate(-1)}
              >
                <span className="font14w600">Отмена</span>
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleSave}
                disabled={saving}
              >
                <span className="font14w600">
                  {saving
                    ? 'Сохранение…'
                    : isCreate
                      ? 'Создать'
                      : 'Сохранить'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalComponent
        title="Удалить заказ?"
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        textButton="Удалить"
        onSave={handleDelete}
      >
        <div>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Это действие невозможно отменить. Все данные по заказу будут безвозвратно удалены.
          </span>
        </div>
      </ModalComponent>

      <ModalComponent
        title="Завершить аренду?"
        visible={closeModalVisible}
        setVisible={setCloseModalVisible}
        textButton="Завершить"
        onSave={handleCloseRental}
      >
        <div className={styles.confirmContent}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Заказ #{orderId}
          </span>
          <span className="font14w500">
            {car.car_name} {car.car_number}
          </span>
          <span className="font14w500">
            {form.customer_name}
          </span>
          <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
            {toDisplayDate(form.start_date)} — {toDisplayDate(form.end_date)}
          </span>
        </div>
      </ModalComponent>

      <ModalComponent
        title="Продлить заказ?"
        visible={extendModalVisible}
        setVisible={setExtendModalVisible}
        textButton="Завершить и продлить"
        onSave={handleExtendOrder}
      >
        <div className={styles.confirmContent}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Текущий заказ будет завершён и создан новый с теми же данными клиента.
          </span>
          <span className="font14w500">
            {form.customer_name} • {car.car_name}
          </span>
          <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
            Текущий период: {toDisplayDate(form.start_date)} — {toDisplayDate(form.end_date)}
          </span>
        </div>
      </ModalComponent>

      <ModalComponent
        title="Создать депозит"
        visible={depositModalVisible}
        setVisible={setDepositModalVisible}
        textButton="Создать"
        onSave={handleCreateDeposit}
      >
        <div className={styles.depositForm}>
          <div className={styles.field}>
            <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
              Сумма
            </span>
            <input
              type="text"
              inputMode="numeric"
              className={`${styles.input} ${depositErrors.amount ? styles.inputError : ''}`}
              value={depositForm.amount}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setDepositErrors({})
                setDepositForm((p) => ({ ...p, amount: val }))
              }}
              placeholder="Введите сумму депозита"
            />
            {depositErrors.amount && (
              <span className={styles.errorText}>{depositErrors.amount}</span>
            )}
          </div>
          <div className={styles.field}>
            <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
              Описание
            </span>
            <input
              className={styles.input}
              value={depositForm.description}
              onChange={(e) =>
                setDepositForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Описание (опционально)"
            />
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        title="Удалить депозит?"
        visible={deleteDepositModalVisible}
        setVisible={setDeleteDepositModalVisible}
        textButton="Удалить"
        onSave={handleDeleteDeposit}
      >
        <div>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Депозит {depositAmount} {form.selectedCurrency} будет удалён.
          </span>
        </div>
      </ModalComponent>
    </AppLayout>
  )
}
