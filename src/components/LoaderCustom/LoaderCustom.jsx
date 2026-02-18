import React from 'react'
import styles from './LoaderCustom.module.css'

export default function LoaderCustom({ size = 40 }) {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.loader}
        style={{ width: size, height: size }}
      />
    </div>
  )
}
