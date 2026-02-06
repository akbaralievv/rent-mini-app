import React from 'react'
import styles from './BackdropModal.module.css'

export default function BackdropModal({ onClick = () => { } }) {
  return (
    <div
      className={styles.backdrop}
      onClick={() => onClick()} />
  )
}
