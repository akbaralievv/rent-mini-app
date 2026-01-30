import React, { useMemo, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import styles from './ClientsDocumentsPage.module.css'
import { clientsDocumentMockData } from '../../common/clientsDocumentData'
import { ArrowDown, Calendar, ChevronDown, Eye, File, Plus, Trash2, X, Upload } from 'lucide-react'
import { tgTheme } from '../../common/commonStyle'
import FileItem from '../../components/FileItem/FileItem'

export default function ClientsDocumentsPage() {
  const navigate = useNavigate()

  const [documents, setDocuments] = useState(clientsDocumentMockData)
  const [isOpen, setIsOpen] = useState(false)

  const [form, setForm] = useState({
    name: '',
    date: '',
    client: '',
    file: null,
  })

  const fileMeta = useMemo(() => {
    if (!form.file) return null
    return {
      name: form.file.name,
      size: formatBytes(form.file.size),
      type: form.file.type || 'file',
    }
  }, [form.file])

  const closeModal = () => {
    setIsOpen(false)
    setForm({ name: '', date: '', client: '', file: null })
  }

  const handleSave = () => {
    // Простая валидация
    if (!form.name?.trim()) return alert('Введите название документа')
    if (!form.date) return alert('Выберите дату')
    if (!form.file) return alert('Выберите файл')

    // ⚠️ Тут вместо mock — обычно отправка на сервер (FormData)
    const newDoc = {
      id: Date.now(),
      name: form.name.trim(),
      date: form.date,
      size: formatBytes(form.file.size),
      url: URL.createObjectURL(form.file), // временно для просмотра
      client: form.client?.trim() || '',
    }

    setDocuments((prev) => [newDoc, ...prev])
    closeModal()
  }

  return (
    <AppLayout title={'Документы клиентов'} onBack={() => navigate(-1)}>
      <div>
        <div className={styles.headerFilter + ' miniBlock'}>
          <button className={styles.filterBtn} onClick={() => setIsOpen(true)}>
            <Plus color={tgTheme.textSecondary} size={16} />
            <span className={'font13w500'}>Добавить</span>
          </button>

          <button onClick={() => { }} className={styles.filterBtn}>
            <Calendar color={tgTheme.textSecondary} size={16} />
            <span className={'font13w500'}>01.02-01.02</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
        </div>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.list}>
          {documents.map((el) => {
            return (
              <div key={el.id} className={styles.item}>
                <div className={styles.left}>
                  <div className={styles.icon}>
                    <FileItem name={el.name} />
                  </div>

                  <div className={styles.info}>
                    <div className={`${styles.name} font12w500`}>
                      {el.name}
                    </div>
                    <div className={styles.meta}>
                      <span>{formatDate(el.date)}</span>
                      <span className={styles.dot}>•</span>
                      <span>{el.size}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.right}>
                  <button
                    className={styles.btn}
                    onClick={() => window.open(el.url, '_blank')}
                  >
                    <Eye size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => window.open(el.url, '_blank')}
                  >
                    <ArrowDown size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => alert('Тут будет удаление')}
                  >
                    <Trash2 size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ✅ MODAL */}
      {isOpen && (
        <div className={styles.modalOverlay} onMouseDown={closeModal}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={'font18w600'}>Добавить документ</span>
              <button className={styles.modalClose} onClick={closeModal}>
                <X size={18} color={tgTheme.textSecondary} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <span className={'font16w500'}>Название</span>
                <input
                  className={`${styles.input} font14w500`}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Например: Паспорт клиента"
                />
              </div>

              <div className={styles.field}>
                <span className={'font16w500'}>Клиент (опционально)</span>
                <input
                  className={`${styles.input} font14w500`}
                  value={form.client}
                  onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
                  placeholder="Имя клиента"
                />
              </div>

              {/* ✅ custom file input */}
              <div className={styles.field}>
                <span className={'font16w500'}>Файл</span>

                <label className={styles.filePick}>
                  <input
                    type="file"
                    className={styles.fileInputHidden}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setForm((p) => ({ ...p, file: f }))
                    }}
                  />

                  <div className={styles.filePickLeft}>
                    <Upload size={16} color={tgTheme.textSecondary} />
                    <span className="font13w500">
                      {form.file ? 'Файл выбран' : 'Выбрать файл'}
                    </span>
                  </div>

                  <div className={styles.filePickRight}>
                    <span className={styles.fileHint}>
                      {fileMeta ? `${fileMeta.name} • ${fileMeta.size}` : 'pdf, jpg, docx...'}
                    </span>
                  </div>
                </label>

                {form.file && (
                  <button
                    className={styles.removeFileBtn}
                    onClick={() => setForm((p) => ({ ...p, file: null }))}
                  >
                    Убрать файл
                  </button>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={closeModal}>
                <span className='font14w600'>Отмена</span>
              </button>
              <button className={styles.primaryBtn} onClick={handleSave}>
                <span className='font14w600'>Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(' г.', '')
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < sizes.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}
