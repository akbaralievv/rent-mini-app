import React from 'react'
import styles from './ButtonSection.module.css'

export default function ButtonSection({ buttons = [] }) {
  return (
    <div className={styles.section}>
      {
        buttons.map((el) => {
          return <button className={styles.item} onClick={() => el.onClick()}>
            {el.icon} {el.text}
          </button>
        })
      }
    </div>
  )
}
