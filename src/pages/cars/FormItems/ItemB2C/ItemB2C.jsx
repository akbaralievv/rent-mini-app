import React, { useEffect, useState } from 'react'
import styles from './ItemB2C.module.css';
import ModalComponent from '../../../../components/ModalComponent/ModalComponent'
import { Check } from 'lucide-react';
import { tgTheme } from '../../../../common/commonStyle';
import { useSetCarPriceMutation } from '../../../../redux/services/carAction';

export default function ItemB2C({
  visible = false, setVisible = () => { },
  car_number = '', periods = [],
}) {
  const [currentPeriod, setCurrentPeriod] = useState(periods[0]);
  const [valueInput, setValueInput] = useState('');
  const [error, setError] = useState('');

  const [changePrice] = useSetCarPriceMutation()

  useEffect(() => {
    setCurrentPeriod(periods[0])
  }, [periods])

  const handleSave = () => {
    if (!valueInput) {
      setError('Введите значение')
      return
    }

    if (isNaN(valueInput)) {
      setError('Должно быть число')
      return
    }

    if (Number(valueInput) <= 0) {
      setError('Число должно быть больше 0')
      return
    }

    changePrice({ carNumber: car_number, [currentPeriod.key]: valueInput })
    setValueInput('');
    setVisible(false);
  }

  return (
    <ModalComponent visible={visible} setVisible={setVisible}
      title={'Редактировать цену B2C'} onSave={handleSave}>
      <div>
        <span className="font14w500">
          Текущие цена: {`${currentPeriod.text} ${currentPeriod.value} AED`}
        </span>
        <div className={styles.priceItemsBlock}>
          {
            periods?.map((el) => <div key={el.key} className={styles.priceItem} onClick={() => setCurrentPeriod(el)}>
              <span className='font12w500'>
                {el.text}
              </span>
              {
                currentPeriod.key == el.key && <Check size={16} color={tgTheme.accent} />
              }
            </div>)
          }
        </div>

        <div className={styles.inputBlock}>
          <span className='font14w500'>
            Введите новую цену ({currentPeriod.text}):
          </span>
          <input
            className={`${styles.input} font14w500`}
            value={valueInput}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/\D/g, '');
              setError('');
              setValueInput(onlyNumbers)
            }}
            placeholder="0"
            autoFocus
          />
          {
            error && <span className='font12w400' style={{ color: tgTheme.danger }}>
              {error}
            </span>
          }
        </div>
      </div>
    </ModalComponent>
  )
}
