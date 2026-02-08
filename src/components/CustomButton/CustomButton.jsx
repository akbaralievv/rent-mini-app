import React from 'react'
import styles from './CustomButton.module.css'

export default function CustomButton({ icon = null, text = '', onClick = () => { } }) {
  return (
    <div>
      <button
        className={styles.filterBtn}
        onClick={onClick}
      >
        {icon}
        <span className="font13w500">{text}</span>
      </button>
    </div>
  )
}
