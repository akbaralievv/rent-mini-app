import React from 'react'
import styles from './InfoModal.module.css'

export default function InfoModal({
  visible = false,
  setVisible = () => {},
  text = 'Раздел в разработке'
}) {
  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={() => setVisible(false)}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.text}>
          <span className="font14w500">
            {text}
          </span>
        </div>

        <button
          className={styles.button}
          onClick={() => setVisible(false)}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
