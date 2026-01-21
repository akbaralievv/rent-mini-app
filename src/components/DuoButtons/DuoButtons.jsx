import React from 'react'
import styles from './DuoButtons.module.css'

export default function DuoButtons({ buttons = [] }) {
  return (
    <div className={styles.section}>
      {
        buttons.map((el) => {
          return <button className={styles.item} onClick={() => el.onClick()}>
            <div>
              {el.icon}
              <span>
                {el.text}
              </span>
            </div>
          </button>
        })
      }
    </div>
  )
}
