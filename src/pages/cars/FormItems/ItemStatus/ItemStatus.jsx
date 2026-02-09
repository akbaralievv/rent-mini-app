import React, { useEffect, useState } from 'react'
import styles from './ItemStatus.module.css'
import { STATUS_MAPPING, tgTheme } from '../../../../common/commonStyle';
import ModalComponent from '../../../../components/ModalComponent/ModalComponent';
import { useChangeCarStatusMutation } from '../../../../redux/services/carAction';
import ButtonSection from '../../../../components/ButtonSection/ButtonSection';
import { Check } from 'lucide-react';

export default function ItemStatus({
  car_number = '',
  status = '',
  visible = false,
  setVisible = () => { }
}) {

  const [
    changeStatusCar,
  ] = useChangeCarStatusMutation();

  const changeStatus = async (status) => {
    try {
      await changeStatusCar({
        carNumber: car_number,
        status: status
      }).unwrap()
    } catch (error) {
      console.log(error)
    }
  }
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(()=>{
    setCurrentStatus(status)
  },[status])

  return (
    <ModalComponent
      visible={visible}
      setVisible={setVisible}
      title="Изменить статус"
      onSave={() => {
        changeStatus(currentStatus)
        setVisible(false);
      }}
    >
      <div className={styles.field}>
        <span
          className="font14w500"
        >
          Текущий статус: {STATUS_MAPPING[status]}
        </span>

        <div className={styles.itemsBlock}>
          {Object.entries(STATUS_MAPPING).map(([key, value]) => (
            <div key={key} className={styles.item} onClick={() => setCurrentStatus(key)}>
              <span className='font14w500' style={{ color: currentStatus != key ? tgTheme.textSecondary : tgTheme.white }}>
                {value}
              </span>
              {
                currentStatus == key && <Check size={18} color={tgTheme.accent} />
              }
            </div>
          ))}
          { }
        </div>
      </div>
    </ModalComponent>
  )
}
