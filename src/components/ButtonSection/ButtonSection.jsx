import React from 'react'
import styles from './ButtonSection.module.css'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { tgTheme } from '../../common/commonStyle'

export default function ButtonSection({ buttons = [], title = '' }) {
  return (
    <div>
      {
        title &&
        <div className={styles.titleBlock}>
          <span className={'font18w600'}>{title}</span>
        </div>
      }
      <div className={styles.section}>
        {
          buttons.map((el) => {
            return <button className={styles.item} onClick={() => el.onClick()}>
              <div className={styles.itemLeft}>
                {el.icon}
                <span className='font14w500'>
                  {el.text}
                </span>
              </div>
              <ChevronRight color={tgTheme.btnActive} size={20} />
            </button>
          })
        }
      </div>
    </div>
  )
}
