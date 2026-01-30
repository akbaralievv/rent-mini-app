import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './CompanyDocumentDetailPage.module.css'
import { ArrowDown, Calendar, ChevronDown, Eye, Plus, Trash2, X, Upload } from 'lucide-react'
import AppLayout from '../../../layouts/AppLayout'
import { tgTheme } from '../../../common/commonStyle'
import FileItem from '../../../components/FileItem/FileItem'
import {
  useDeleteCompanyDocumentSectionMutation,
  useGetCompanyDocumentSectionsQuery,
} from '../../../redux/services/getCompanySectionsAction'
import { getErrorMessage, getImageUrl } from '../../../utils'
import {
  useCreateCompanySectionDocumentMutation,
  useDeleteCompanySectionDocumentMutation,
  useGetCompanySectionDocumentsQuery,
} from '../../../redux/services/companySectionDocuments'

export default function CompanyDocumentDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const {
      data: sections = [],
    } = useGetCompanyDocumentSectionsQuery();

  const sectionId = params.id
  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useGetCompanySectionDocumentsQuery(sectionId)

  const [createDocument, { isLoading: isCreating }] = useCreateCompanySectionDocumentMutation()
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteCompanySectionDocumentMutation()
  const [deleteSection, { isLoading: isDeletingSection }] = useDeleteCompanyDocumentSectionMutation()
  const [isOpen, setIsOpen] = useState(false)

  const [form, setForm] = useState({
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
    setForm({ file: null })
  }

  const handleSave = async () => {
    if (!form.file) return alert('Выберите файл')

    const formData = new FormData()
    formData.append('file', form.file)

    try {
      await createDocument({ sectionId, formData }).unwrap()
      closeModal()
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось загрузить документ'))
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!confirm('Удалить документ?')) return
    try {
      await deleteDocument(id).unwrap()
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось удалить документ'))
    }
  }

  const handleDeleteSection = async () => {
    if (!sectionId) return
    if (documents.length > 0) {
      alert('Сначала удалите все документы раздела')
      return
    }
    if (!confirm('Удалить раздел?')) return
    try {
      await deleteSection(sectionId).unwrap()
      navigate(-1)
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось удалить раздел'))
    }
  }

  return (
    <AppLayout title={sections.find(el => el.id == params.id)?.name || 'Не найдено'} onBack={() => navigate(-1)}>
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
        {isLoading && <div className={'font13w500'}>Загрузка...</div>}
        {isError && <div className={'font13w500'}>{getErrorMessage(error, 'Ошибка загрузки')}</div>}
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
      <div className={'miniBlock'}>
        <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
          Чтобы удалить раздел, удалите все документы в нем</span>
      </div>
      <div className={styles.footerActions}>
        <button
          className={styles.deleteSectionBtn}
          onClick={handleDeleteSection}
          disabled={isDeletingSection || documents.length > 0}
        >
          <span className='font16w500'>

          Удалить раздел
          </span>
        </button>
      </div>
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
