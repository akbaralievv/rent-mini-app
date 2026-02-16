import React from 'react'
import styles from './PreviewContract.module.css'
import { tgTheme } from '../../../../common/commonStyle'

export default function PreviewContract({
  list = [],
  visible = false,
}) {
  if (!visible) return null
  return (
    <div>
      <span className='font18w600'>Обзор на договор</span>
      <div className={styles.block}>
        {
          list.map((el) => <div className={styles.item}>
            <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
              {el.key}: <span style={{ color: tgTheme.white }}>{el.value}</span>
            </span>
          </div>)
        }
      </div>
    </div>
  )
}
