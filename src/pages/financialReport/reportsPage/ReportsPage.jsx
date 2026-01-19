import React, { useMemo } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import styles from './ReportsPage.module.css'
import { deposit, transactions } from '../../../common/mockData'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import DuoButtons from '../../../components/DuoButtons/DuoButtons'

function formatDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function createReportRows(transactionsArr, depositArr) {
  const allRows = []

  for (const t of transactionsArr) {
    allRows.push({
      date: t.created_at,
      'Дата': formatDate(t.created_at),
      'Доходы': t.increse ? t.sum : 0,
      'Расходы': !t.increse ? t.sum : 0,
      'Депозиты': 0,
      'Клиент': t.payer,
      'Авто': t.car_name,
      'Описание': t.description,
    })
  }

  for (const d of depositArr) {
    allRows.push({
      date: d.created_at,
      'Дата': formatDate(d.created_at),
      'Доходы': 0,
      'Расходы': 0,
      'Депозиты': d.increse ? d.sum : -d.sum,
      'Клиент': d.payer,
      'Авто': d.car_name,
      'Описание': d.description,
    })
  }

  allRows.sort((a, b) => new Date(b.date) - new Date(a.date))

  return allRows.map(({ ...rest }) => rest)
}

function autoSizeColumns(worksheet, data) {
  if (!data?.length) return worksheet

  const keys = Object.keys(data[0])
  const widths = keys.map((key) => {
    const headerLen = String(key).length
    const maxCellLen = Math.max(
      ...data.map((row) => String(row[key] ?? '').length),
      headerLen
    )
    return { wch: Math.min(Math.max(maxCellLen + 2, 10), 45) }
  })

  worksheet['!cols'] = widths
  return worksheet
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const rows = useMemo(() => createReportRows(transactions, deposit), [])

  const handleDownload = () => {
    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.json_to_sheet(rows)

    autoSizeColumns(ws, rows)

    XLSX.utils.book_append_sheet(wb, ws, 'Отчет')

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const file = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    saveAs(file, `finance_report_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <AppLayout onBack={() => navigate(-1)} title={'Отчет'}>
      <div className={styles.card}>
        {/* Верхний блок */}
        <div className={styles.fileBlock}>
          <div className={styles.fileIcon}>⬇️</div>

          <div className={styles.fileInfo}>
            <div className={styles.fileName}>finance_report.xlsx</div>
            <div className={styles.fileMeta}>
              <span>{rows.length} строк</span>
              <span className={styles.dot}>•</span>
              <button
                className={styles.downloadBtn}
                type="button"
                onClick={handleDownload}
              >
                Загрузить
              </button>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.title}>Отчет сформирован.</div>
          <div className={styles.subtitle}>
            Сформировано на основе транзакций и депозитов по датам.
          </div>
        </div>
        <DuoButtons
          buttons={[
            {
              text: 'Заказы',
              onClick: () => alert('фильтра по заказам нету')
            },
            {
              text: 'Машины',
              onClick: () => alert('фильтра по машинам нету')
            },
          ]}
        />
        {}
        <div className={styles.section}>
          <button type="button" className={styles.itemBack} onClick={() => navigate(-1)}>
            ⬅ В меню
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
