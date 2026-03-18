import React, { useMemo } from 'react'
import styles from './Dashboard.module.css'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Car, ChevronRight, Wallet } from 'lucide-react'
import { useGetFinanceSummaryQuery } from '../../redux/services/financeApi'
import { useGetCarsQuery } from '../../redux/services/carAction'

const RENTED_STATUSES = ['rented', 'booked', 'delivery', 'fence', 'wait confirm']

function formatSplit(value) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

  const [main, cents] = formatted.split('.')
  return { main, cents }
}

function DonutChart({ income = 0, expense = 0, deposit = 0 }) {
  const total = income + expense + deposit
  const radius = 48
  const stroke = 14
  const center = 60
  const circumference = 2 * Math.PI * radius

  if (total === 0) {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="var(--tg-border)" strokeWidth={stroke}
        />
      </svg>
    )
  }

  const incomeAngle = (income / total) * circumference
  const expenseAngle = (expense / total) * circumference
  const depositAngle = (deposit / total) * circumference

  const gap = 3
  const segments = [
    { length: incomeAngle, color: 'var(--tg-success)' },
    { length: expenseAngle, color: 'var(--tg-danger)' },
    { length: depositAngle, color: 'var(--tg-warning)' },
  ].filter(s => s.length > 0)

  let offset = 0
  const arcs = segments.map((seg, i) => {
    const dashLen = Math.max(0, seg.length - gap)
    const el = (
      <circle
        key={i}
        cx={center} cy={center} r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth={stroke}
        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s, stroke-dashoffset 0.5s' }}
      />
    )
    offset += seg.length
    return el
  })

  return (
    <svg width="120" height="120" viewBox="0 0 120 120"
      style={{ transform: 'rotate(-90deg)' }}>
      {arcs}
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: financeSummary } = useGetFinanceSummaryQuery({ period: 'all_time' })
  const { data: carsData } = useGetCarsQuery({})

  const balance = financeSummary?.balance ?? 0
  const income = financeSummary?.income ?? 0
  const expense = financeSummary?.expense ?? 0
  const totalDeposit = financeSummary?.total_deposit ?? 0

  const balanceFmt = formatSplit(balance)
  const incomeFmt = formatSplit(income)
  const expenseFmt = formatSplit(expense)
  const depositFmt = formatSplit(totalDeposit)

  const carStats = useMemo(() => {
    const cars = carsData?.cars || []
    const total = cars.length
    const rented = cars.filter(c =>
      RENTED_STATUSES.includes((c.status || '').toLowerCase())
    ).length
    const free = total - rented
    return { total, rented, free }
  }, [carsData])

  return (
    <div className={styles.dashboard}>
      {/* Finance Card */}
      <div className={styles.financeCard} onClick={() => navigate('/financial-main')}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <BarChart3 size={22} color={'white'} strokeWidth={1.5} />
            <span className="font16w600">Финансы</span>
          </div>
          <ChevronRight size={18} color="var(--tg-text-secondary)" />
        </div>

        <div className={styles.chartRow}>
          <div className={styles.chartWrap}>
            <DonutChart income={income} expense={expense} deposit={totalDeposit} />
            <div className={styles.chartCenter}>
              <div className={styles.chartCenterLabel}>Баланс</div>
              <span className="font14w600">{balanceFmt.main}</span>
            </div>
          </div>

          <div className={styles.financeInfo}>
            <div className={styles.balanceBlock}>
              <div className={styles.balanceLabel}>
                <Wallet size={14} />
                <span className="font12w400">В кассе</span>
              </div>
              <div className={styles.balanceAmount}>
                <span className="font20w700">{balanceFmt.main}</span>
                <span className="font14w500" style={{ opacity: 0.7 }}>.{balanceFmt.cents}</span>
                <span className="font12w500" style={{ opacity: 0.6, marginLeft: 4 }}>AED</span>
              </div>
            </div>

            <div className={styles.legendList}>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.dotIncome}`} />
                <div>
                  <div className="font12w400" style={{ color: 'var(--tg-text-secondary)' }}>Доходы</div>
                  <div className={styles.legendValue}>
                    <span className="font13w500">{incomeFmt.main}</span>
                    <span className="font10w400" style={{ opacity: 0.6 }}>.{incomeFmt.cents}</span>
                  </div>
                </div>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.dotExpense}`} />
                <div>
                  <div className="font12w400" style={{ color: 'var(--tg-text-secondary)' }}>Расходы</div>
                  <div className={styles.legendValue}>
                    <span className="font13w500">{expenseFmt.main}</span>
                    <span className="font10w400" style={{ opacity: 0.6 }}>.{expenseFmt.cents}</span>
                  </div>
                </div>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.dot} ${styles.dotDeposit}`} />
                <div>
                  <div className="font12w400" style={{ color: 'var(--tg-text-secondary)' }}>Депозиты</div>
                  <div className={styles.legendValue}>
                    <span className="font13w500">{depositFmt.main}</span>
                    <span className="font10w400" style={{ opacity: 0.6 }}>.{depositFmt.cents}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Card */}
      <div className={styles.carsCard} onClick={() => navigate('/cars')}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <Car size={22} color='white' strokeWidth={1.5} />
            <span className="font16w600">Автопарк</span>
          </div>
          <ChevronRight size={18} color="var(--tg-text-secondary)" />
        </div>

        <div className={styles.carsStats}>
          <div className={styles.carsStat}>
            <span className="font24w700">{carStats.total}</span>
            <span className="font12w400" style={{ color: 'var(--tg-text-secondary)' }}>Всего</span>
          </div>
          <div className={styles.carsStat}>
            <div className={styles.carsStatNumber}>
              <span className={`${styles.statusDot} ${styles.statusRented}`} />
              <span className="font24w700">{carStats.rented}</span>
            </div>
            <span className="font12w400" style={{ color: 'var(--tg-text-secondary)' }}>В аренде</span>
          </div>
          <div className={styles.carsStat}>
            <div className={styles.carsStatNumber}>
              <span className={`${styles.statusDot} ${styles.statusFree}`} />
              <span className="font24w700">{carStats.free}</span>
            </div>
            <span className="font12w400" style={{ color: 'var(--tg-text-secondary)' }}>Свободно</span>
          </div>
        </div>
      </div>
    </div>
  )
}
