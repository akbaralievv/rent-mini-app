import React, { useEffect } from 'react'
import styles from './ModalComponent.module.css'
import { X } from 'lucide-react'
import { tgTheme } from '../../common/commonStyle'

const ModalComponent = ({
  visible,
  setVisible,
  handleClose = () => { },
  title,
  children,
  onSave,
  textButton = 'Сохранить'
}) => {

  const close = () => {
    if (handleClose) handleClose()
    setVisible?.(false)
  }

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={styles.modalOverlay} onMouseDown={close}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className="font18w600">{title}</span>

          <button className={styles.modalClose} onClick={close}>
            <X size={18} color={tgTheme.textSecondary} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {children}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.secondaryBtn}
            onClick={close}
          >
            <span className="font14w600">Отмена</span>
          </button>

          <button
            className={styles.primaryBtn}
            onClick={onSave}
          >
            <span className="font14w600">{textButton}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalComponent
