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
          buttons.map((el, index) => {
            return <button className={styles.item} onClick={() => el.onClick()} key={index}>
              <div className={styles.itemLeft}>
                {el.icon}
                <span className='font14w500'>
                  {el.text}
                </span>
              </div>
              <div className={styles.itemRight}>
                {Array.isArray(el.actions) && el.actions.length > 0 && (
                  <div className={styles.actions}>
                    {el.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          action.onClick?.()
                        }}
                        type="button"
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                )}
                {!el.arrowHide && <ChevronRight color={tgTheme.btnActive} size={20} />}
              </div>
            </button>
          })
        }
      </div>
    </div>
  )
}
