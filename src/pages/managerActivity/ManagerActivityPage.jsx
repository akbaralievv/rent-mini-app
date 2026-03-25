import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useGetManagerActivitiesQuery, useGetManagersQuery } from '../../redux/services/managersApi'
import { tgTheme } from '../../common/commonStyle'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import LoaderCustom from '../../components/LoaderCustom/LoaderCustom'
import styles from './ManagerActivityPage.module.css'

const MODEL_TYPE_MAP = {
  Car: 'Машина',
  Order: 'Заказ',
  Note: 'Заметка',
  FinanceTransaction: 'Транзакция',
  Contract: 'Контракт',
  OrderDocument: 'Документ заказа',
  MaintenanceItem: 'ТО работа',
  MaintenanceItemImage: 'ТО фото',
  CarServiceNote: 'Сервисная заметка',
  CarServiceNotePhoto: 'Сервисное фото',
  FinanceTag: 'Финансовый тег',
  ContractTemplate: 'Шаблон контракта',
  CustomerDocument: 'Документ клиента',
  CompanySectionDocument: 'Документ компании',
  InvoiceTemplate: 'Шаблон инвойса',
  CarDocument: 'Документ авто',
  CarDocumentFile: 'Файл документа авто',
}

const ACTION_MAP = {
  created: 'Создание',
  updated: 'Изменение',
  deleted: 'Удаление',
}

const ACTION_COLORS = {
  created: tgTheme.success,
  updated: tgTheme.warning,
  deleted: tgTheme.danger,
}

export default function ManagerActivityPage() {
  const navigate = useNavigate()
  const { userId } = useParams()

  const [page, setPage] = useState(1)
  const [modelType, setModelType] = useState('')
  const [action, setAction] = useState('')

  const { data: managersData } = useGetManagersQuery({ per_page: 50, page: 1 })
  const manager = managersData?.data?.find((m) => String(m.user_id) === String(userId))

  const queryParams = { userId, per_page: 20, page }
  if (modelType) queryParams.model_type = modelType
  if (action) queryParams.action = action

  const { data, isLoading, isError, isFetching } = useGetManagerActivitiesQuery(queryParams)

  const activities = data?.data || []
  const meta = data?.meta || {}

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (meta.last_page || 1)) return
    setPage(newPage)
  }

  const resetFilters = () => {
    setModelType('')
    setAction('')
    setPage(1)
  }

  return (
    <AppLayout
      title={manager?.name || `Менеджер ${userId}`}
      onBack={() => navigate(-1)}
    >
      <div className={styles.filters}>
        <div className={styles.selectWrap}>
          <select
            className={`${styles.select} font13w500`}
            value={modelType}
            onChange={(e) => { setModelType(e.target.value); setPage(1) }}
          >
            <option value="">Все типы</option>
            {Object.entries(MODEL_TYPE_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown size={14} color={tgTheme.textSecondary} className={styles.selectIcon} />
        </div>

        <div className={styles.selectWrap}>
          <select
            className={`${styles.select} font13w500`}
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1) }}
          >
            <option value="">Все действия</option>
            {Object.entries(ACTION_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown size={14} color={tgTheme.textSecondary} className={styles.selectIcon} />
        </div>
      </div>

      {(modelType || action) && (
        <button className={`${styles.resetBtn} font12w400`} onClick={resetFilters}>
          Сбросить фильтры
        </button>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoaderCustom />
        </div>
      ) : isError ? (
        <div className={styles.empty}>
          <span className="font14w500" style={{ color: tgTheme.danger }}>Ошибка загрузки</span>
        </div>
      ) : activities.length === 0 ? (
        <div className={styles.empty}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>Действий не найдено</span>
        </div>
      ) : (
        <>
          <div className={styles.list} style={isFetching ? { opacity: 0.5 } : undefined}>
            {activities.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>

          {meta.last_page > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} color={tgTheme.text} />
              </button>
              <span className="font13w500">
                {page} / {meta.last_page}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= meta.last_page}
              >
                <ChevronRight size={16} color={tgTheme.text} />
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}

function ActivityCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const actionColor = ACTION_COLORS[item.action] || tgTheme.text
  const actionLabel = ACTION_MAP[item.action] || item.action
  const modelLabel = MODEL_TYPE_MAP[item.model_type] || item.model_type

  const values = item.action === 'deleted' ? item.old_values
    : item.action === 'created' ? item.new_values
    : null

  const hasChanges = item.action === 'updated' && item.old_values && item.new_values

  return (
    <div className={styles.card} onClick={() => setExpanded((p) => !p)}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span
            className={`${styles.actionBadge} font11w600`}
            style={{ background: actionColor + '22', color: actionColor }}
          >
            {actionLabel}
          </span>
          <span className="font13w600">{modelLabel}</span>
          <span className="font11w400" style={{ color: tgTheme.textSecondary }}>
            #{item.model_id}
          </span>
        </div>
        <ChevronDown
          size={14}
          color={tgTheme.textSecondary}
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </div>

      <span className="font11w400" style={{ color: tgTheme.textSecondary }}>
        {formatDateTime(item.created_at)}
      </span>

      {expanded && (
        <div className={styles.cardBody}>
          {hasChanges ? (
            <div className={styles.changes}>
              {Object.keys(item.new_values).map((key) => (
                <div key={key} className={styles.changeRow}>
                  <span className={`${styles.changeKey} font12w500`}>{key}</span>
                  <div className={styles.changeValues}>
                    <span className={`${styles.oldVal} font12w400`}>
                      {formatValue(item.old_values?.[key])}
                    </span>
                    <span className="font12w400" style={{ color: tgTheme.textSecondary }}>&rarr;</span>
                    <span className={`${styles.newVal} font12w400`}>
                      {formatValue(item.new_values[key])}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : values ? (
            <div className={styles.changes}>
              {Object.entries(values).map(([key, val]) => (
                <div key={key} className={styles.changeRow}>
                  <span className={`${styles.changeKey} font12w500`}>{key}</span>
                  <span className="font12w400" style={{ color: tgTheme.text }}>
                    {formatValue(val)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
              Нет данных
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(' г.', '')
}

function formatValue(val) {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
