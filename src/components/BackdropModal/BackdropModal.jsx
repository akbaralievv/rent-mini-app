import React from 'react'
import styles from './BackdropModal.module.css'
import LoaderCustom from '../LoaderCustom/LoaderCustom'

export default function BackdropModal({
  onClick = () => { },
  loading = false
}) {
  return (
    <div
      className={styles.backdrop}
      onClick={() => onClick()}
    >
      {loading && (
        <div className={styles.loaderWrapper}>
          <LoaderCustom />
        </div>
      )}
    </div>
  )
}
