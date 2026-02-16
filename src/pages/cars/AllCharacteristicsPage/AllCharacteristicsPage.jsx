import React, { useEffect, useState } from 'react'
import styles from './AllCharacteristicsPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetCarByNumberQuery, useUpdateCarTechFieldMutation } from '../../../redux/services/carAction'
import { tgTheme } from '../../../common/commonStyle'
import { Calendar, ChevronDown, ChevronUp, ClipboardEditIcon } from 'lucide-react'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import { Check, FileText } from 'phosphor-react'
import ModalComponent from '../../../components/ModalComponent/ModalComponent'
import CalendarCustom from '../../../components/CalendarCustom/CalendarCustom'
import { CHARACTERISTICS, selectCharactericticsItem } from './mockDataCharacteristics'
import BackdropModal from '../../../components/BackdropModal/BackdropModal'
import { cars_class } from '../../../common/mockData'

function toISO(dateStr) {
  if (!dateStr) return ''

  const parts = dateStr.split('.')
  if (parts.length !== 3) return ''

  const [day, month, year] = parts

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export default function AllCharacteristicsPage() {
  const navigate = useNavigate()
  const { id } = useParams();

  const {
    data: car = { car: {} },
    isLoading,
    isError,
  } = useGetCarByNumberQuery(id)
  const [updateTechCar] = useUpdateCarTechFieldMutation();

  const carData = car?.car || {}

  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(CHARACTERISTICS[0].key)
  const [inputValue, setInputValue] = useState('');
  const [booleanValue, setBooleanValue] = useState(true);
  const [dateValue, setDateValue] = useState(new Date().toLocaleDateString('ru-RU'))
  const [itemOptionsVisible, setItemOptionsVisible] = useState(false);
  const [itemOptionData, setItemOptionData] = useState(0);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItemOptionData(0);
  }, [selectedKey])

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '—'

    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет'
    }
    if (key == 'checked' || key == 'to_b2b') {
      return value == 1 ? 'Да' : 'Нет'
    }

    if (value === 'yes') return 'Да'
    if (value === 'no') return 'Нет'

    return value
  }

  const handleSave = () => {
    const type = CHARACTERISTICS.find(el => el.key == selectedKey).type

    const convertToISO = (dateStr) => {
      const [day, month, year] = dateStr.split('.')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    let data = '';
    if (type == 'input') {
      data = inputValue;
    } else if (type == 'select') {
      data = selectCharactericticsItem.find((el) => el.key == selectedKey).options.find((_, i) => i == itemOptionData)?.key;
    } else if (type == 'boolean') {
      if (selectedKey == 'b2c_status') {
        data = booleanValue ? 'yes' : 'no'
      } else {
        data = booleanValue ? 1 : 0
      }
    } else if (type == 'date') {
      data = convertToISO(dateValue)
    }
    setVisibleEditModal(false);

    updateTechCar({ carNumber: id, field: selectedKey, value: data });
    setInputValue('');
    setSelectedKey(CHARACTERISTICS[0].key);
    setBooleanValue(true);
    setDateValue(new Date().toLocaleDateString('ru-RU'));
    setItemOptionData(0);
  }

  return (
    <AppLayout title="Все характеристики" onBack={() => navigate(-1)}>
      {isLoading && (
        <div className="state">
          <span className="font16w500" style={{ color: tgTheme.textSecondary }}>
            Загрузка...
          </span>
        </div>
      )}

      {isError && (
        <div className="stateError">
          <span className="font16w500" style={{ color: tgTheme.textSecondary }}>
            Ошибка загрузки
          </span>
        </div>
      )}

      {!isLoading && !isError && (
        <div className={styles.main}>
          <div className={styles.contentBlock}>
            {CHARACTERISTICS.map(({ key, label }) => (
              <div key={key} className={styles.item}>
                <span className="font14w500">{label}</span>
                <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                  {formatValue(key, key == 'car_class' ? cars_class.find((el) => el.key === carData[key])?.name : carData[key])}
                </span>
              </div>
            ))}
            <div className={styles.btnEdit} onClick={() => setVisibleEditModal(true)}>
              <ClipboardEditIcon size={20} color={tgTheme.white} />
            </div>
          </div>
          <div className='mt30' />
          {/* <ButtonSection
            title='Разделы'
            buttons={[
              {
                icon: <FileText size={20} color={tgTheme.white} />,
                text: 'Документы',
                onClick: () => navigate('/cars/' + id + '/documents/'),
              }
            ]}
          /> */}
        </div>
      )}
      <ModalComponent
        visible={visibleEditModal}
        setVisible={setVisibleEditModal}
        title="Изменить характеристику"
        textButton='Обновить'
        onSave={handleSave}
      >
        {
          (itemOptionsVisible || selectOpen) &&
          <BackdropModal onClick={() => {
            setItemOptionsVisible(false)
            setSelectOpen(false)
          }} />
        }
        {/* SELECT */}
        <div className={styles.modalMain}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Выберите характеристику
          </span>

          <div className={styles.customSelectWrapper}>
            <div
              className={styles.customSelect}
              onClick={() => setSelectOpen((prev) => !prev)}
            >
              <span className="font14w500">
                {selectedKey
                  ? CHARACTERISTICS.find((c) => c.key === selectedKey)?.label
                  : 'Выберите поле'}
              </span>
              {
                !selectOpen ? <ChevronDown size={20} color={tgTheme.white} /> : <ChevronUp size={20} color={tgTheme.white} />
              }
            </div>

            {selectOpen && (
              <div className={styles.dropdown}>
                {CHARACTERISTICS.map((item) => (
                  <div
                    key={item.key}
                    className={styles.dropdownItem + ' ' + styles.item}
                    onClick={() => {
                      setSelectedKey(item.key)
                      setSelectOpen(false)
                    }}
                  >
                    <span className={'font14w500'}>
                      {item.label}
                    </span>
                    {
                      selectedKey == item.key && <Check color={tgTheme.accent} size={18} />
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Текущее значение
          </span>

          <div
            className={styles.answer}
          >
            <span className="font14w500">
              {formatValue(selectedKey, selectedKey == 'car_class' ? cars_class.find((el) => el.key === carData[selectedKey])?.name : carData[selectedKey])}
            </span>
          </div>
        </div>

        {/* INPUT */}
        <div className={styles.field}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Новое значение
          </span>
          {
            CHARACTERISTICS.find((c) => c.key === selectedKey).type == 'input' &&
            <input
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите значение"
            />
          }

          {/* обработка выборочных значений */}
          {
            CHARACTERISTICS.find((c) => c.key === selectedKey).type == 'select' && <div className={styles.customSelectWrapper}>

              <div className={styles.answer}
                onClick={() => {
                  setItemOptionsVisible(prev => !prev)
                }}>
                <span className='font14w500'>
                  {
                    selectCharactericticsItem.find((el) => el.key == selectedKey).options.find((_, i) => i == itemOptionData)?.value || 'выберите значение'
                  }
                </span>
                {
                  !itemOptionsVisible ? <ChevronDown size={20} color={tgTheme.white} /> : <ChevronUp size={20} color={tgTheme.white} />
                }
              </div>
              {itemOptionsVisible && (
                <div className={styles.dropdown}>
                  {selectCharactericticsItem?.find((el) => el.key == selectedKey)?.options?.map((item, index) => (
                    <div
                      key={item.key}
                      className={styles.dropdownItem + ' ' + styles.item}
                      onClick={() => {
                        setItemOptionData(index)
                        setItemOptionsVisible(false)
                      }}
                    >
                      <span className={'font14w500'}>
                        {item.value}
                      </span>
                      {
                        index == itemOptionData && <Check color={tgTheme.accent} size={18} />
                      }
                    </div>
                  ))}
                </div>
              )}

            </div>
          }

          {/* обработка календарных значений */}
          {
            CHARACTERISTICS.find((c) => c.key === selectedKey).type == 'date' && <div className={styles.dateBlock}>

              <div className={styles.answer}
                onClick={() => setDatePickerVisible(true)}>
                <span className='font14w500'>
                  {dateValue}
                </span>
                <Calendar size={20} color={tgTheme.white} />
              </div>
              <CalendarCustom date={toISO(dateValue)} setDate={setDateValue}
                visible={datePickerVisible} setVisible={setDatePickerVisible}
                isUnder listBlockPosition='left'
              />
            </div>
          }

          {/* обработка булеан значений */}
          {
            CHARACTERISTICS.find((c) => c.key === selectedKey).type == 'boolean' && <div className={styles.booleanBlock}>
              <div className={styles.answer} onClick={() => setBooleanValue(true)}>
                <span className='font14w500' style={{ color: booleanValue ? tgTheme.white : tgTheme.textSecondary }}>Да</span>
                {
                  booleanValue && <Check size={20} color={tgTheme.accent} />
                }
              </div>
              <div className={styles.answer} onClick={() => setBooleanValue(false)}>
                <span className='font14w500' style={{ color: !booleanValue ? tgTheme.white : tgTheme.textSecondary }}>Нет</span>
                {
                  !booleanValue && <Check size={20} color={tgTheme.accent} />
                }
              </div>
            </div>
          }
        </div>
      </ModalComponent>

    </AppLayout>
  )
}
