import React, { useState } from 'react'
import styles from './CarCreatePage.module.css'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../../layouts/AppLayout'
import { tgTheme } from '../../../common/commonStyle'
import { Upload } from 'lucide-react'
import { Check } from 'phosphor-react'
import { useCreateCarMutation } from '../../../redux/services/carAction'

const shortenFileName = (name) => {
  if (!name) return ''

  if (name.length <= 28) return name

  const start = name.slice(0, 15)
  const end = name.slice(-7)

  return `${start}...${end}`
}

export default function CarCreatePage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    car_number: '',
    car_name: '',
    description: '',
    status: true,
    file: null,
  })

  const [createCar] = useCreateCarMutation()

  const handleSubmit = async () => {
    const newErrors = {}

    if (!form.car_number.trim()) {
      newErrors.car_number = 'Введите номер машины'
    }

    if (!form.car_name.trim()) {
      newErrors.car_name = 'Введите модель'
    }

    if (!form.description.trim()) {
      newErrors.description = 'Введите описание'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      let base64Image = null

      if (form.file) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(form.file)
          reader.onload = () => resolve(reader.result)
          reader.onerror = (error) => reject(error)
        })
      }

      const payload = {
        car: {
          car_number: form.car_number,
          car_name: form.car_name,
          car_description: form.description,
          car_price_b2b: 0,
          car_price_b2c: 0,
          status: form.status ? 'free' : 'rented',
          car_images: base64Image ? [base64Image] : [],
        },
      }

      await createCar(payload).unwrap()

      alert('Машина успешно добавлена')
      // navigate(-1)

    } catch (err) {
      if (err?.data?.errors?.car_number) {
        alert('Номер машины уже занят. Введите уникальный номер.')
      } else {
        alert('Ошибка при создании авто')
      }
    }
  }


  return (
    <AppLayout title={'Добавить машину'} onBack={() => navigate(-1)}>
      <div className={styles.main}>

        <div className={styles.field}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Номер машины
          </span>
          <input
            className={styles.input}
            placeholder="Например: CC77165"
            value={form.car_number}
            onChange={(e) => {
              setErrors((p) => ({ ...p, car_number: null }))
              setForm((p) => ({ ...p, car_number: e.target.value }))
            }}
          />

          <div className={styles.errorBlock}>
            {errors.car_number && (
              <span className="font12w400" style={{ color: tgTheme.danger }}>
                {errors.car_number}
              </span>
            )}
          </div>

        </div>

        <div className={styles.field}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Модель
          </span>
          <input
            className={styles.input}
            placeholder="Например: Toyota Camry"
            value={form.car_name}
            onChange={(e) => {
              setErrors((p) => ({ ...p, car_name: null }))
              setForm((p) => ({ ...p, car_name: e.target.value }))
            }}
          />
          <div className={styles.errorBlock}>
            {errors.car_name && (
              <span className="font12w400" style={{ color: tgTheme.danger }}>
                {errors.car_name}
              </span>
            )}
          </div>

        </div>

        <div className={styles.fieldImg}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>Изображение</span>
          <div>
            <label className={styles.filePick}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className={styles.fileInputHidden}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return

                  if (f.size > 5 * 1024 * 1024) {
                    alert('Файл превышает 5MB')
                    return
                  }

                  const allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                  ]

                  if (!allowedTypes.includes(f.type)) {
                    alert('Недопустимый формат файла')
                    return
                  }

                  setForm((p) => ({
                    ...p,
                    file: f,
                    preview: URL.createObjectURL(f),
                  }))
                }}
              />

              <div className={styles.filePickLeft}>
                <Upload size={16} color={tgTheme.textSecondary} />
                <span className="font13w500">
                  {form.file ? 'Выбрано' : 'Выбрать изображение'}
                </span>
              </div>

              <div className={styles.filePickRight}>
                <span className={'font12w400'} style={{ color: tgTheme.textSecondary }}>
                  {form.file
                    ? `${shortenFileName(form.file.name)} • ${(form.file.size / 1024 / 1024).toFixed(2)} MB`
                    : 'jpg, png'}
                </span>
              </div>
            </label>
            <div className={styles.miniBlock}>
              <span
                className="font12w400"
                style={{ color: tgTheme.textSecondary }}
              >
                Допустимые форматы: JPG, JPEG, PNG.
                Максимальный размер: 5MB
              </span>
            </div>
          </div>

          {form.file && (
            <button
              type="button"
              className={styles.removeFileBtn}
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  file: null,
                  preview: null,
                }))
              }
            >
              <span className='font12w500' style={{ color: tgTheme.danger }}>
                Удалить изображение
              </span>
            </button>
          )}
        </div>


        <div className={styles.field}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Описание
          </span>
          <textarea
            className={styles.textarea}
            placeholder="Введите описание автомобиля..."
            value={form.description}
            onChange={(e) => {
              setErrors((p) => ({ ...p, description: null }))
              setForm((p) => ({ ...p, description: e.target.value }))
            }}
          />
          <div className={styles.errorBlock}></div>
          {errors.description && (
            <span className="font12w400" style={{ color: tgTheme.danger }}>
              {errors.description}
            </span>
          )}

        </div>

        <div className={styles.field}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
            Статус машины
          </span>

          <div className={styles.statusSwitch}>
            <div
              className={`${styles.statusBtn}`}
              onClick={() =>
                setForm((p) => ({ ...p, status: true }))
              }
            >
              <span className='font14w500' style={{ color: !form.status ? tgTheme.textSecondary : tgTheme.white }}>
                Свободна
              </span>
              {
                form.status && <Check size={18} color={tgTheme.accent} />
              }
            </div>

            <div
              className={`${styles.statusBtn}`}
              onClick={() =>
                setForm((p) => ({ ...p, status: false }))
              }
            >
              <span className='font14w500' style={{ color: form.status ? tgTheme.textSecondary : tgTheme.white }}>
                в аренде
              </span>
              {
                !form.status && <Check size={18} color={tgTheme.accent} />
              }
            </div>
          </div>
        </div>

        <button className={styles.primaryBtn} onClick={handleSubmit}>
          <span className='font14w500'>
            Добавить
          </span>
        </button>

      </div>
    </AppLayout>
  )
}
