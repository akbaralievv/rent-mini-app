import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './SearchSelect.module.css'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { tgTheme } from '../../common/commonStyle'
import BackdropModal from '../BackdropModal/BackdropModal'

/**
 * SearchSelect — инпут с поиском и выпадающим списком.
 *
 * Props:
 *   options     — [{ id, label, sub? }]  массив вариантов
 *   value       — текущий выбранный id (или null)
 *   onChange    — (id) => void
 *   placeholder — placeholder инпута
 *   emptyLabel  — текст «ничего», например «Без заказа»
 */
export default function SearchSelect({
  options = [],
  value = null,
  onChange,
  placeholder = 'Поиск...',
  emptyLabel = null,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const selected = options.find(o => o.id === value)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('')
    }
  }, [open])

  const filtered = options.filter(o => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      o.label.toLowerCase().includes(q) ||
      (o.sub && o.sub.toLowerCase().includes(q))
    )
  })

  const handleSelect = useCallback((id) => {
    onChange(id)
    setOpen(false)
    setQuery('')
  }, [onChange])

  function highlightMatch(text) {
    if (!query.trim() || !text) return text

    const q = query.toLowerCase()
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return text

    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + query.length)
    const after = text.slice(idx + query.length)

    return (
      <>
        {before}
        <span style={{ color: tgTheme.accent, fontWeight: 600 }}>{match}</span>
        {after}
      </>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.inputRow} ${open ? styles.focused : ''}`}
        onClick={() => { if (!open) setOpen(true) }}
      >
        <Search
          size={16}
          className={`${styles.searchIcon} ${open ? styles.active : ''}`}
        />

        {open ? (
          <input
            ref={inputRef}
            className={`${styles.input} font14w500`}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <span className={`${styles.input} font14w600`} style={{ cursor: 'pointer' }}>
            {selected ? selected.label : (emptyLabel || placeholder)}
          </span>
        )}

        {open && query && (
          <button
            className={styles.clearBtn}
            onClick={(e) => { e.stopPropagation(); setQuery('') }}
          >
            <X size={12} color={tgTheme.text} />
          </button>
        )}

        <ChevronDown
          size={16}
          className={`${styles.chevron} ${open ? styles.open : ''}`}
        />
      </div>

      {open && (
        <>
          <BackdropModal onClick={() => setOpen(false)} />
          <div className={styles.dropdown}>
            {emptyLabel && (
              <div
                className={styles.option}
                onClick={() => handleSelect(null)}
              >
                <span className="font14w600">{emptyLabel}</span>
                {value === null && <Check color={tgTheme.accent} size={18} />}
              </div>
            )}

            {filtered.length === 0 && (
              <div className={styles.empty}>
                <span className="font13w400">Ничего не найдено</span>
              </div>
            )}

            {filtered.map(opt => (
              <div
                key={opt.id}
                className={styles.option}
                onClick={() => handleSelect(opt.id)}
              >
                <div className={styles.optionText}>
                  <span className="font14w600">
                    {highlightMatch(opt.label)}
                  </span>
                  {opt.sub && (
                    <div className={styles.optionSub}>
                      <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
                        {highlightMatch(opt.sub)}
                      </span>
                    </div>
                  )}
                </div>
                {opt.id === value && <Check color={tgTheme.accent} size={18} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
