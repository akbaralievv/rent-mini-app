import React, { useState } from 'react'
import styles from './ItemDesc.module.css'
import ModalComponent from '../../../../components/ModalComponent/ModalComponent'
import { Check } from 'lucide-react';
import { tgTheme } from '../../../../common/commonStyle';
import { useSetCarDescMutation } from '../../../../redux/services/carAction';

export default function ItemDesc({
  visible = false, setVisible = () => { },
  descRu = '', descEn = '', car_number = '',
}) {

  const [currentLng, setCurrentLng] = useState('ru');
  const [valueInput, setValueInput] = useState('');
  const [error, setError] = useState('')

  const [changeDesc] = useSetCarDescMutation();

  const handleSave = () => {
    if (valueInput == '') {
      setError('Заполните поле');
      return
    }
    if (valueInput.length < 10) {
      setError('Минимум 10 символов');
      return
    }

    changeDesc({ carNumber: car_number, lang: currentLng, desc: valueInput });
    setValueInput('')
    setVisible(false);
  }
  return (
    <ModalComponent title={'Редактировать описание'} visible={visible} setVisible={setVisible} onSave={handleSave}>
      <div>
        <span className='font14w500'>
          Текущее описание: ({currentLng == 'ru' ? 'RU' : 'EN'})
        </span>
        <div className={styles.content}>
          <div className={styles.descBlock}>
            <span className='font12w500'>
              {
                currentLng == 'ru' ? descRu : descEn
              }
            </span>
          </div>
        </div>
        <div className={styles.switcherWrapper}>
          <div className={styles.switcher}>
            <button
              className={`${styles.switchBtn} ${currentLng === 'ru' ? styles.active : ''}`}
              onClick={() => setCurrentLng('ru')}
            >
              <span className='font12w500'>
                Ru
              </span>
            </button>

            <button
              className={`${styles.switchBtn} ${currentLng === 'en' ? styles.active : ''}`}
              onClick={() => setCurrentLng('en')}
            >
              <span className='font12w500'>
                En
              </span>
            </button>

            <div
              className={`${styles.slider} ${currentLng === 'en' ? styles.right : ''}`}
            />
          </div>
        </div>
        <div className={styles.inputBlock}>
          <span className='font14w500'>
            Введите описание ({currentLng == 'ru' ? 'RU' : 'EN'}):
          </span>
          <textarea
            className={`${styles.input} ${styles.textarea} font14w500`}
            value={valueInput}
            onChange={(e) => {
              setError('')
              setValueInput(e.target.value)
            }}
            placeholder="Описание"
            autoFocus
            rows={4}
          />

          {error && (
            <span
              className="font12w400"
              style={{ color: tgTheme.danger }}
            >
              {error}
            </span>
          )}
        </div>

      </div>
    </ModalComponent>
  )
}
