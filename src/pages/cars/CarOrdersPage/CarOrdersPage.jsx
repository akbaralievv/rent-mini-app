import React, { useMemo, useState, useEffect } from 'react'
import styles from './CarOrdersPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteOrderMutation, useGetCarByNumberQuery } from '../../../redux/services/carAction'
import { STATUS_MAPPING, tgTheme } from '../../../common/commonStyle'
import { ClipboardEditIcon, Trash2, ChevronLeft, ChevronRight, Plus, UserRound } from 'lucide-react'
import CustomButton from '../../../components/CustomButton/CustomButton'
import ModalComponent from '../../../components/ModalComponent/ModalComponent'

const PAGE_SIZE = 5

function formatDate(dateStr) {
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

export default function CarOrdersPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const {
    data: car = { car: {} },
    isLoading,
    isError,
  } = useGetCarByNumberQuery(id)

  const [deleteOrder] = useDeleteOrderMutation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const orders = car?.car?.orders || []

  const [page, setPage] = useState(1)
  const [orderId, setOrderId] = useState(null);
  const [deleteOrderModalVisible, setDeleteOrderModalVisible] = useState(false);

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
              onClick={() => navigate(`/cars/${id}/orders/create`)}
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
                      {formatDate(order.start_date)} — {formatDate(order.end_date)}
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
                      navigate(`/cars/${id}/orders/${order.id}`)
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
      <ModalComponent title={'Вы точно хотите удалить заказ?'}
        visible={deleteOrderModalVisible} setVisible={setDeleteOrderModalVisible}
        textButton='Удалить' onSave={handleDelete} children={<div>
          <span className='font14w500' style={{ color: tgTheme.textSecondary }}>Это действие невозможно отменить.
            Все данные по заказу будут безвозвратно удалены.</span>
        </div>}>

      </ModalComponent>
    </AppLayout>
  )
}
