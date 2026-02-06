import React, { useEffect, useState } from 'react'
import { tgTheme } from '../../common/commonStyle'
import styles from './DateFilter.module.css'
import { Calendar, Check, ChevronDown } from 'lucide-react'
import CalendarCustom from '../CalendarCustom/CalendarCustom'
import BackdropModal from '../BackdropModal/BackdropModal'

const dateRangeFilters = [
  { id: 0, text: 'Текущий месяц', key: 'current_month' },
  { id: 1, text: 'Прошлый месяц', key: 'previous_month' },
  { id: 2, text: 'За 3 месяца', key: 'last_3_months' },
  { id: 3, text: 'За 6 месяцев', key: 'last_6_months' },
  { id: 4, text: 'За текущий год', key: 'current_year' },
  { id: 5, text: 'За прошлый год', key: 'previous_year' },
  { id: 6, text: 'За все время', key: 'all_time' },
  { id: 7, text: 'По календарю', key: 'custom_range' },
]

const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}.${m}.${y}`
}

const formatRange = (from, to) => {
  return `${formatDate(from)}-${formatDate(to)}`
}

const getDateRangeByKey = (key) => {
  const now = new Date()

  switch (key) {
    case 'current_month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return formatRange(from, to)
    }

    case 'previous_month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return formatRange(from, to)
    }

    case 'last_3_months': {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return formatRange(from, to)
    }

    case 'last_6_months': {
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return formatRange(from, to)
    }

    case 'current_year': {
      const from = new Date(now.getFullYear(), 0, 1)
      const to = new Date(now.getFullYear(), 11, 31)
      return formatRange(from, to)
    }

    case 'previous_year': {
      const from = new Date(now.getFullYear() - 1, 0, 1)
      const to = new Date(now.getFullYear() - 1, 11, 31)
      return formatRange(from, to)
    }

    case 'all_time': {
      const from = new Date(2000, 0, 1)
      const to = now
      return formatRange(from, to)
    }

    default:
      return ''
  }
}

export default function DateFilter({
  date = '', setDate = () => { },
  listBlockPosition = 'right', // left, right
}) {
  const [rangeFiltersBlockVisible, setRangeFiltersBlockVisible] = useState(false)
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [tagId, setTagId] = useState(undefined);

  useEffect(() => {
    document.body.style.overflow = rangeFiltersBlockVisible ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [rangeFiltersBlockVisible])

  const handleClick = (data) => {
    const { key, id } = data;
    if (key === 'custom_range') {
      setCalendarVisible(true);
      setRangeFiltersBlockVisible(false)
      return
    }
    setTagId(id)

    const range = getDateRangeByKey(key)
    setDate(range)
    setRangeFiltersBlockVisible(false)
  }

  const handleSelectedCustomDate = (data) => {
    setTagId(7)
    const newDate = data.split('/').join('-');
    setDate(newDate)
  }

  return (
    <div className={styles.wrapper}>
      <button
        onClick={() => setRangeFiltersBlockVisible(v => !v)}
        className={styles.filterBtn}
      >
        <Calendar color={tgTheme.textSecondary} size={16} />
        <span className="font13w500">
          {date || 'Выберите период'}
        </span>
        <ChevronDown color={tgTheme.textSecondary} size={16} />
      </button>

      {rangeFiltersBlockVisible && (
        <>
          <BackdropModal onClick={() => setRangeFiltersBlockVisible(false)} />
          <div className={`${styles.listBlock} ${listBlockPosition == 'left' && styles.listBlockLeft}`}>
            {dateRangeFilters.map(el => (
              <button
                key={el.id}
                className={styles.listItem}
                onClick={() => handleClick(el)}
              >
                <span className="font14w600">{el.text}</span>
                {
                  el.id == tagId &&
                  <Check color={tgTheme.accent} size={20} />
                }
              </button>
            ))}
          </div>
        </>
      )}
      <CalendarCustom
        visible={calendarVisible}
        setVisible={setCalendarVisible}
        date={date}
        setDate={handleSelectedCustomDate}
        mode='range'
        listBlockPosition={listBlockPosition}
      />
    </div>
  )
}
