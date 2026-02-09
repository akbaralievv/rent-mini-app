import React, { useEffect, useState } from 'react'
import styles from './ItemShowcase.module.css'
import ModalComponent from '../../../../components/ModalComponent/ModalComponent';
import { tgTheme } from '../../../../common/commonStyle';
import { Check } from 'lucide-react';
import { useToggleB2CStatusMutation } from '../../../../redux/services/carAction';

export default function ItemShowcase({
  car_number = '',
  visible = false,
  setVisible = () => { },
  showcase = 'no',
}) {
  const [isShow, setIsShow] = useState(showcase == 'yes');

  const [
    changeShowCase,
  ] = useToggleB2CStatusMutation();

  const changeShowcaseStatus = (carNumber) => {
    changeShowCase(carNumber).unwrap();
  }
  useEffect(() => {
    setIsShow(showcase)
  }, [showcase])

  return (
    <ModalComponent
      visible={visible}
      setVisible={setVisible}
      title={'Изменить статус на витрине'}
      onSave={() => {
        if (showcase != isShow) {
          changeShowcaseStatus(car_number)
        }
        setVisible(false);
      }}
    >
      <span
        className="font14w500"
      >
        Текущий статус: {showcase == 'yes' ? 'Активна на витрине' : 'Скрыта с витрины'}
      </span>
      <div className={styles.itemsBlock}>
        <div className={styles.item} onClick={() => setIsShow('yes')}>
          <span className='font14w500' style={{ color: isShow != 'yes' ? tgTheme.textSecondary : tgTheme.white }}>
            Показать
          </span>
          {
            isShow == 'yes' && <Check size={18} color={tgTheme.accent} />
          }
        </div>
        <div className={styles.item} onClick={() => setIsShow('no')}>
          <span className='font14w500' style={{ color: isShow == 'yes' ? tgTheme.textSecondary : tgTheme.white }}>
            Скрыть
          </span>
          {
            isShow != 'yes' && <Check size={18} color={tgTheme.accent} />
          }
        </div>
      </div>

    </ModalComponent>
  )
}
