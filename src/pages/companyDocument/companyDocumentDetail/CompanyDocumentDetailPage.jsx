import React, { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './CompanyDocumentDetailPage.module.css'
import { ArrowDown, Calendar, Check, ChevronDown, Eye, Plus, Trash2, X, Upload } from 'lucide-react'
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
import DateFilter from '../../../components/DateFilter/DateFilter'
import { parseUiDateRange } from '../../../common/utils/helpers'

export default function CompanyDocumentDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [date, setDate] = useState(undefined);

  const {
    data: sections = [],
  } = useGetCompanyDocumentSectionsQuery();

  const sectionId = params.id
  const dateParams = useMemo(
    () => parseUiDateRange(date),
    [date]
  )

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useGetCompanySectionDocumentsQuery(
    dateParams.from
      ? { sectionId, ...dateParams }
      : { sectionId }
  )

  const [createDocument, { isLoading: isCreating }] = useCreateCompanySectionDocumentMutation()
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteCompanySectionDocumentMutation()
  const [deleteSection, { isLoading: isDeletingSection }] = useDeleteCompanyDocumentSectionMutation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const longPressTimerRef = useRef(null)
  const longPressTriggeredRef = useRef(false)

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

  const startSelection = (id) => {
    setSelectionMode(true)
    setSelectedIds(new Set([id]))
  }

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      if (next.size === 0) setSelectionMode(false)
      return next
    })
  }

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handlePressStart = (id, e) => {
    if (e?.target?.closest?.('button')) return
    clearLongPress()
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      startSelection(id)
    }, 350)
  }

  const handlePressEnd = () => {
    clearLongPress()
  }
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm('Удалить выбранные документы?')) return
    try {
      const ids = Array.from(selectedIds)
      await Promise.all(ids.map((id) => deleteDocument(id).unwrap()))
      setSelectedIds(new Set())
      setSelectionMode(false)
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось удалить документы'))
    }
  }
  const download = (fileUrl) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = '';
    a.target = '_blank';
    a.click();
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) return
    try {
      const ids = Array.from(selectedIds)
      await Promise.all(ids.map((id) => {
        const doc = documents.find(d => d.id === id)
        if (doc) {
          const docUrl = getImageUrl(doc.url)
          download(docUrl)
        }
      }))
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось скачать документы'))
    }
  }

  return (
    <AppLayout title={sections.find(el => el.id == params.id)?.name || 'Не найдено'} onBack={() => navigate(-1)}>
      <div>
        {selectionMode ? (
          <div className={`${styles.headerFilter} miniBlock ${styles.isSelectionMode}`}>
            <button className={styles.filterBtn} onClick={handleDownloadSelected}>
              <ArrowDown size={16} color={tgTheme.text} strokeWidth={1.5} />
              <span className={'font13w500'}>Скачать</span>
            </button>

            <button onClick={handleDeleteSelected} className={styles.filterBtn}>
              <Trash2 size={16} color={tgTheme.text} strokeWidth={1.5} />
              <span className={'font13w500'}>Удалить</span>
            </button>
          </div>
        ) : (
          <div className={styles.headerFilter + ' miniBlock'}>
            <button className={styles.filterBtn} onClick={() => setIsOpen(true)}>
              <Plus color={tgTheme.textSecondary} size={16} />
              <span className={'font13w500'}>Добавить</span>
            </button>

            <DateFilter date={date} setDate={setDate} listBlockPosition='left' />
          </div>
        )}
      </div>

      <div className={styles.wrapper}>
        {isLoading && <div className={styles.statusWrapper + ' font13w500'}>Загрузка...</div>}
        {isError && <div className={styles.statusWrapper + ' font13w500'}>{getErrorMessage(error, 'Ошибка загрузки')}</div>}
        <div className={styles.list}>
          {documents.map((el) => {
            const docUrl = getImageUrl(el.url)
            const isSelected = selectedIds.has(el.id)
            return (
              <div
                key={el.id}
                className={`${styles.item} ${selectionMode ? styles.itemSelectable : ''} ${isSelected ? styles.itemSelected : ''}`}
                onMouseDown={(e) => handlePressStart(el.id, e)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={(e) => handlePressStart(el.id, e)}
                onTouchEnd={handlePressEnd}
                onClick={(e) => {
                  if (!selectionMode) return
                  if (e?.target?.closest?.('button')) return
                  if (longPressTriggeredRef.current) {
                    longPressTriggeredRef.current = false
                    return
                  }
                  toggleSelection(el.id)
                }}
              >
                <div className={styles.left}>
                  {selectionMode && (
                    <div className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ''}`}>
                      {isSelected && <Check size={12} color="#fff" />}
                    </div>
                  )}
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
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Eye size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => download(docUrl)}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <ArrowDown size={16} color={tgTheme.text} strokeWidth={1.5} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => handleDelete(el.id)}
                    disabled={isDeleting}
                    onMouseDown={(e) => e.stopPropagation()}
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

