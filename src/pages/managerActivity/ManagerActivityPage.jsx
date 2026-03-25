import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useGetManagerActivitiesQuery, useGetManagersQuery } from '../../redux/services/managersApi'
import { tgTheme } from '../../common/commonStyle'
import { Check, ChevronDown, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react'
import LoaderCustom from '../../components/LoaderCustom/LoaderCustom'
import BackdropModal from '../../components/BackdropModal/BackdropModal'
import DateFilter from '../../components/DateFilter/DateFilter'
import { parseUiDateRange } from '../../common/utils/helpers'
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
  const [typeFilterVisible, setTypeFilterVisible] = useState(false)
  const [actionFilterVisible, setActionFilterVisible] = useState(false)
  const [dateFilter, setDateFilter] = useState(undefined)

  const handleDateChange = (newDate) => {
    setDateFilter(newDate)
    setPage(1)
  }

  const { data: managersData } = useGetManagersQuery({ per_page: 50, page: 1 })
  const manager = managersData?.data?.find((m) => String(m.user_id) === String(userId))

  const dateParams = parseUiDateRange(dateFilter)
  const queryParams = { userId, per_page: 10, page }
  if (modelType) queryParams.model_type = modelType
  if (action) queryParams.action = action
  if (dateParams.from) queryParams.date_from = dateParams.from
  if (dateParams.to) queryParams.date_to = dateParams.to

  const { data, isLoading, isError, isFetching } = useGetManagerActivitiesQuery(queryParams)

  const activities = data?.data || []
  const meta = data?.meta || {}
  const totalPages = meta.last_page || 1

  const canPrev = page > 1
  const canNext = page < totalPages

  const chooseType = (key) => {
    setModelType(key)
    setTypeFilterVisible(false)
    setPage(1)
  }

  const chooseAction = (key) => {
    setAction(key)
    setActionFilterVisible(false)
    setPage(1)
  }

  return (
    <AppLayout
      title={manager?.name || `Менеджер ${userId}`}
      onBack={() => navigate(-1)}
    >
      <div className={styles.header}>
        <div className={styles.headerFilter + ' miniBlock'}>
          <span className="font16w600">Тип</span>
          <button
            onClick={() => { setActionFilterVisible(false); setTypeFilterVisible(true) }}
            className={styles.filterBtn}
          >
            <ListFilter color={tgTheme.textSecondary} size={16} />
            <span className="font14w500">{modelType ? MODEL_TYPE_MAP[modelType] : 'Все типы'}</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
          {typeFilterVisible && <>
            <BackdropModal onClick={() => setTypeFilterVisible(false)} />
            <div className={styles.filterBlock}>
              <button onClick={() => chooseType('')}>
                <span className="font14w600">Все типы</span>
                {modelType === '' && <Check color={tgTheme.accent} size={20} />}
              </button>
              {Object.entries(MODEL_TYPE_MAP).map(([key, label]) => (
                <button key={key} onClick={() => chooseType(key)}>
                  <span className="font14w600">{label}</span>
                  {modelType === key && <Check color={tgTheme.accent} size={20} />}
                </button>
              ))}
            </div>
          </>}
        </div>

        <div className={styles.headerFilter + ' miniBlock'}>
          <button
            onClick={() => { setTypeFilterVisible(false); setActionFilterVisible((p) => !p) }}
            className={styles.filterBtn}
          >
            <span className="font14w500">{action ? ACTION_MAP[action] : 'Все действия'}</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
          {actionFilterVisible && <>
            <BackdropModal onClick={() => setActionFilterVisible(false)} />
            <div className={styles.filterBlock} style={{ right: 0 }}>
              <button onClick={() => chooseAction('')}>
                <span className="font14w600">Все действия</span>
                {action === '' && <Check color={tgTheme.accent} size={20} />}
              </button>
              {Object.entries(ACTION_MAP).map(([key, label]) => (
                <button key={key} onClick={() => chooseAction(key)}>
                  <span className="font14w600">{label}</span>
                  {action === key && <Check color={tgTheme.accent} size={20} />}
                </button>
              ))}
            </div>
          </>}
        </div>
      </div>
      <div className={styles.header}>
        <div className={styles.headerFilter + ' miniBlock'}>
          <DateFilter date={dateFilter} setDate={handleDateChange} />
        </div>
      </div>

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
        <div className={styles.section}>
          {isFetching && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <LoaderCustom />
            </div>
          )}
          {!isFetching && activities.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}

          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
            >
              <ChevronLeft color={tgTheme.btnActive} />
            </button>
            <div className={styles.pageInfo}>
              {page} / {totalPages}
            </div>
            <button
              className={styles.pageBtn}
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
            >
              <ChevronRight color={tgTheme.btnActive} />
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function ActivityCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const actionLabel = ACTION_MAP[item.action] || item.action
  const modelLabel = MODEL_TYPE_MAP[item.model_type] || item.model_type

  const values = item.action === 'deleted' ? item.old_values
    : item.action === 'created' ? item.new_values
      : null

  const hasChanges = item.action === 'updated' && item.old_values && item.new_values

  return (
    <div className={styles.row} onClick={() => setExpanded((p) => !p)}>
      <div className={styles.topLine}>
        <div className={styles.left}>
          <span className="font16w500">#{item.model_id}</span>
          <span className="font16w500">{formatDateTime(item.created_at)}</span>
        </div>
        <ChevronDown
          size={14}
          color={tgTheme.textSecondary}
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </div>

      <div className={styles.actionTag}>
        <span className="font12w500">{actionLabel}</span>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.bottomLine}>
          <span className="font14w500">{modelLabel}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.cardBody}>
          {hasChanges ? (
            <div className={styles.changes}>
              {Object.keys(item.new_values).map((key) => (
                <div key={key} className={styles.changeRow}>
                  <span className={`${styles.changeKey} font14w500`}>{key}</span>
                  <div className={styles.changeValues}>
                    <span className={`${styles.oldVal} font14w400`}>
                      {formatValue(item.old_values?.[key])}
                    </span>
                    <span className="font14w400" style={{ color: tgTheme.textSecondary }}>&rarr;</span>
                    <span className={`${styles.newVal} font14w400`}>
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
                  <span className={`${styles.changeKey} font14w500`}>{key}</span>
                  <span className="font14w400" style={{ color: tgTheme.text }}>
                    {formatValue(val)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="font14w400" style={{ color: tgTheme.textSecondary }}>
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
