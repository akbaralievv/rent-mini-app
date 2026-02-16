import React, { useState } from 'react'
import styles from './CarImagesPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteCarImagesMutation, useGetCarByNumberQuery, useUploadCarImagesMutation } from '../../../redux/services/carAction'
import { ChevronLeft, ChevronRight, ArrowDownToLine, Plus, Trash2 } from 'lucide-react'
import { tgTheme } from '../../../common/commonStyle'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import ModalComponent from '../../../components/ModalComponent/ModalComponent'
import { Upload } from 'phosphor-react'

export default function CarImagesPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const {
    data: car = { car: {} },
    isLoading,
    isError,
  } = useGetCarByNumberQuery(id);
  const [deleteImages] = useDeleteCarImagesMutation();
  const [uploadCarImages] = useUploadCarImagesMutation()

  const images = car?.car?.car_images || []

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [form, setForm] = useState({})

  const hasImages = images.length > 0

  const prevImage = () => {
    setImageLoading(true)
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const nextImage = () => {
    setImageLoading(true)
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const downloadAllImages = () => {
    window.open(
      `http://127.0.0.1:8000/api/car/${id}/download-images`,
      '_blank'
    )
  }

  const handleDeleteImage = () => {
    deleteImages(id);
    setModalDeleteVisible(false);
  }

  const handleUploadImage = async () => {
    if (!form.file) return

    if (form.file.size > 5 * 1024 * 1024) {
      return
    }

    const formData = new FormData()
    formData.append('images', form.file)

    try {
      await uploadCarImages({
        carNumber: id,
        formData
      })

      setForm((p) => ({ ...p, file: null }))
      setModalAddVisible(false)
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки')
    }
  }

  return (
    <AppLayout title="Картинки" onBack={() => navigate(-1)}>
      {isLoading && (
        <div className={styles.state}>Загрузка картинок...</div>
      )}

      {isError && (
        <div className={styles.stateError}>Ошибка загрузки</div>
      )}

      {!isLoading && !isError && (
        <div className={styles.main}>
          <div className={styles.carousel}>
            {hasImages ? (
              <>
                <img
                  key={images[currentIndex]}
                  src={images[currentIndex]}
                  alt="car"
                  className={`${styles.image} ${imageLoading ? styles.hidden : styles.visible
                    }`}
                  onLoad={() => setImageLoading(false)}
                />

                {imageLoading && (
                  <div className={styles.loaderBlock}>
                    <span className={styles.loader}></span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyImage}>
                <span className='font16w500' style={{ color: tgTheme.textSecondary }}>
                  Нет изображений
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.arrowBlock}>
              <button
                className={styles.arrow}
                onClick={prevImage}
              >
                <ChevronLeft size={20} color="#fff" />
              </button>

              <div className={styles.counter}>
                <span className="font12w400">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              <button
                className={styles.arrow}
                onClick={nextImage}
              >
                <ChevronRight size={20} color="#fff" />
              </button>
            </div>
          )}

          <div className="miniBlock">
            <span
              className="font13w400"
              style={{ color: tgTheme.textSecondary }}
            >
              Добавьте качественные фотографии автомобиля. Это повысит доверие клиентов и увеличит количество бронирований.
            </span>
          </div>
          <div className='mt30' />
          <ButtonSection
            title="Изменить"
            buttons={[
              {
                icon: <Plus size={20} color={tgTheme.white} />,
                text: 'Добавить картинку',
                onClick: () => setModalAddVisible(true),
                arrowHide: true,
              },
              {
                icon: <ArrowDownToLine size={20} color={images.length > 0 ? tgTheme.white : tgTheme.muted2} />,
                text: 'Скачать все картинки',
                onClick: () => downloadAllImages(),
                arrowHide: true,
                disabled: images.length == 0 && true,
              },
              {
                icon: <Trash2 size={20} color={images.length > 0 ? tgTheme.danger : tgTheme.muted2} />,
                text: 'Удалить все картинки',
                onClick: () => setModalDeleteVisible(true),
                arrowHide: true,
                color: tgTheme.danger,
                disabled: images.length == 0 && true,
              },
            ]}
          />
        </div>
      )}
      <ModalComponent
        title={'Удалить все картинки?'}
        visible={modalDeleteVisible}
        setVisible={setModalDeleteVisible}
        textButton='Удалить'
        onSave={handleDeleteImage}
        children={<div>
          <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
            Это действие необратимо — восстановить изображения будет невозможно.
            Убедитесь, что они больше не нужны.
          </span>
        </div>}
      />
      <ModalComponent
        title={'Добавить новое изображение'}
        visible={modalAddVisible}
        setVisible={setModalAddVisible}
        textButton='Загрузить'
        onSave={handleUploadImage}
      >
        <div className={styles.field}>
          <span className={'font16w500'}>Изображение</span>

          <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
            Допустимые форматы: JPG, JPEG, PNG. <br />Максимальный размер: 5MB.
          </span>

          <label className={styles.filePick}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className={styles.fileInputHidden}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return

                // Проверка размера
                if (f.size > 5 * 1024 * 1024) {
                  alert('Файл превышает 5MB')
                  return
                }

                // Проверка типа
                const allowedTypes = [
                  'image/jpeg',
                  'image/png',
                  'image/jpg',
                ]

                if (!allowedTypes.includes(f.type)) {
                  alert('Недопустимый формат файла')
                  return
                }

                setForm((p) => ({ ...p, file: f }))
              }}
            />

            <div className={styles.filePickLeft}>
              <Upload size={16} color={tgTheme.textSecondary} />
              <span className="font13w500">
                {form.file ? 'Выбрано' : 'Выбрать изображение'}
              </span>
            </div>

            <div className={styles.filePickRight}>
              <span className={styles.fileHint}>
                {form.file
                  ? `${form.file.name} • ${(form.file.size / 1024 / 1024).toFixed(2)} MB`
                  : 'jpg, png'}
              </span>
            </div>
          </label>

          {form.file && (
            <button
              type="button"
              className={styles.removeFileBtn}
              onClick={() => setForm((p) => ({ ...p, file: null }))}
            >
              Убрать изображение
            </button>
          )}
        </div>

      </ModalComponent>
    </AppLayout>
  )
}
