import React, { useMemo, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import styles from './ClientsDocumentsPage.module.css'
import { ArrowDown, Calendar, ChevronDown, Eye, Plus, Trash2, X, Upload } from 'lucide-react'
import { tgTheme } from '../../common/commonStyle'
import FileItem from '../../components/FileItem/FileItem'
import { getErrorMessage, getImageUrl } from '../../utils'
import {
  useCreateClientDocumentMutation,
  useDeleteClientDocumentMutation,
  useGetClientDocumentsQuery,
} from '../../redux/services/getClientsDocumentsAction'

export default function ClientsDocumentsPage() {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)

  const [form, setForm] = useState({
    client: '',
    file: null,
  })

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useGetClientDocumentsQuery()

  const [createClientDocument, { isLoading: isCreating }] = useCreateClientDocumentMutation()
  const [deleteClientDocument, { isLoading: isDeleting }] = useDeleteClientDocumentMutation()

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
    setForm({ client: '', file: null })
  }

  const handleSave = async () => {
    if (!form.file) return alert('Выберите файл')

    const formData = new FormData()
    formData.append('file', form.file)
    if (form.client?.trim()) formData.append('client', form.client.trim())

    try {
      await createClientDocument(formData).unwrap()
      closeModal()
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось загрузить документ'))
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!confirm('Удалить документ?')) return
    try {
      await deleteClientDocument(id).unwrap()
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось удалить документ'))
    }
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
        {isLoading && <div className={styles.statusWrapper + ' font13w500'}>Загрузка...</div>}
        {isError && <div className={styles.statusWrapper + ' font13w500'}>{getErrorMessage(error, 'Ошибка загрузки')}</div>}
        <div className={styles.list}>
          {documents.map((el) => {
            const docUrl = getImageUrl(el.url)
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
                      <span>{formatDate(el.created_at || el.date)}</span>
                      <span className={styles.dot}>•</span>
                      <span>{formatBytes(el.size) || el.size}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.right}>
                  <button
                    className={styles.btn}
                    onClick={() => window.open(docUrl, '_blank')}
                  >
                    <Eye size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => window.open(docUrl, '_blank')}
                  >
                    <ArrowDown size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => handleDelete(el.id)}
                    disabled={isDeleting}
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
              <button className={styles.primaryBtn} onClick={handleSave} disabled={isCreating}>
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
