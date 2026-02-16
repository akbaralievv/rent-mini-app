import React, { useState, useMemo } from 'react'
import styles from './CalendarCustom.module.css'
import { tgTheme } from '../../common/commonStyle'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BackdropModal from '../BackdropModal/BackdropModal'

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const pad = (n) => String(n).padStart(2, '0')
function formatDate(str) {
  const [y, m, d] = str.split('-')
  return `${d}.${m}.${y}`
}


function isBetween(date, from, to) {
  if (!from || !to) return false

  const current = new Date(date)
  const start = new Date(from)
  const end = new Date(to)

  return current > start && current < end
}

export default function CalendarCustom({
  date = '',
  setDate = () => { },
  setVisible = () => { },
  visible = false,
  mode = 'single', // single | range
  listBlockPosition = 'right', // left, right
  isUnder = false,
}) {
  const initial = date ? new Date(date) : new Date()

  const [year, setYear] = useState(initial.getFullYear())
  const [month, setMonth] = useState(initial.getMonth())

  const [selected, setSelected] = useState(date)

  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)

  const handleConfirm = () => {
    if (mode === 'single') {
      if (!selected) return
      setDate(formatDate(selected))
    }

    if (mode === 'range') {
      if (!from) return
      console.log(from)
      setDate(
        `${formatDate(from)}/${formatDate(to || from)}`
      )
    }

    setVisible(false)
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]

  const days = useMemo(() => {
    const result = []

    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: daysInPrevMonth - i, offset: -1 })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, offset: 0 })
    }

    const rest = result.length % 7
    if (rest !== 0) {
      let nextDay = 1
      for (let i = 0; i < 7 - rest; i++) {
        result.push({ day: nextDay++, offset: 1 })
      }
    }

    return result
  }, [year, month])

  const changeMonth = (delta) => {
    let m = month + delta
    let y = year

    if (m < 0) {
      m = 11
      y -= 1
    }
    if (m > 11) {
      m = 0
      y += 1
    }

    setMonth(m)
    setYear(y)
  }

  const handleSelect = (day, offset) => {
    let y = year
    let m = month + offset

    if (m < 0) {
      m = 11
      y -= 1
    }
    if (m > 11) {
      m = 0
      y += 1
    }

    const dateStr = `${y}-${pad(m + 1)}-${pad(day)}`

    if (mode === 'single') {
      setSelected(dateStr)
    }

    if (mode === 'range') {
      if (!from || (from && to)) {
        setFrom(dateStr)
        setTo(null)
      } else {
        if (new Date(dateStr) < new Date(from)) {
          setTo(from)
          setFrom(dateStr)
        } else {
          setTo(dateStr)
        }
      }
    }

    if (offset !== 0) {
      setMonth(m)
      setYear(y)
    }
  }

  if (!visible) return null

  return (
    <div>
      <BackdropModal onClick={() => setVisible(false)} />

      <div className={`${styles.calendar} ${listBlockPosition == 'left' && styles.calendarLeft} ${isUnder && styles.isUnder}`}>
        {/* HEADER */}
        <div className={styles.calendarHeader}>
          <span className="font16w600">
            {monthNames[month]} {year}
          </span>
          <div>
            <button onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} color={tgTheme.white} />
            </button>
            <button onClick={() => changeMonth(1)}>
              <ChevronRight size={16} color={tgTheme.white} />
            </button>
          </div>
        </div>

        {/* WEEK DAYS */}
        <div className={styles.weekDays}>
          {WEEK_DAYS.map((d) => (
            <span key={d} className="font12w500">{d}</span>
          ))}
        </div>

        {/* GRID */}
        <div className={styles.calendarGrid}>
          {days.map((d, i) => {
            const cellDate = new Date(year, month + d.offset, d.day)
            const dateStr = `${cellDate.getFullYear()}-${pad(cellDate.getMonth() + 1)}-${pad(cellDate.getDate())}`

            const isActive =
              mode === 'single'
                ? selected === dateStr
                : dateStr === from || dateStr === to

            const inRange = isBetween(dateStr, from, to)

            return (
              <button
                key={i}
                className={[
                  styles.calendarDay,
                  isActive && styles.active,
                  inRange && styles.range
                ].join(' ')}
                onClick={() => handleSelect(d.day, d.offset)}
              >
                <span className="font10w400" style={d.offset !== 0 ? { color: isActive ? tgTheme.text : tgTheme.textSecondary, } : {}}>
                  {d.day}</span>
              </button>
            )
          })}
        </div>

        <button className={styles.chooseBtn} onClick={handleConfirm}>
          <span className="font12w500">Выбрать</span>
        </button>
      </div>
    </div>
  )
}
