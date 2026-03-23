import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../../layouts/AppLayout'
import { tgTheme } from '../../../../common/commonStyle'
import { getErrorMessage } from '../../../../utils'
import {
  useGetOrderDocumentsQuery,
  useUploadOrderDocumentMutation,
  useDeleteOrderDocumentMutation,
} from '../../../../redux/services/orders'
import {
  Plus,
  Trash2,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react'
import ModalComponent from '../../../../components/ModalComponent/ModalComponent'
import styles from './OrderDocumentsPage.module.css'

export default function OrderDocumentsPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()

  const { data, isLoading, isError } = useGetOrderDocumentsQuery(orderId)
  const [uploadDoc, { isLoading: uploading }] = useUploadOrderDocumentMutation()
  const [deleteDoc] = useDeleteOrderDocumentMutation()

  const documents = data?.documents || []

  const fileRef = useRef(null)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [docType, setDocType] = useState('')
  const [docTypeError, setDocTypeError] = useState('')
  const [newFiles, setNewFiles] = useState([])

  const [viewDoc, setViewDoc] = useState(null)

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteDocId, setDeleteDocId] = useState(null)

  const [previewImage, setPreviewImage] = useState(null)

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || [])
    const valid = files.filter((f) => {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(f.type)) {
        alert('Допустимые форматы: JPG, PNG, GIF')
        return false
      }
      if (f.size > 5 * 1024 * 1024) {
        alert('Максимальный размер: 5 МБ')
        return false
      }
      return true
    })
    setNewFiles((prev) => [...prev, ...valid])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!docType.trim()) {
      setDocTypeError('Введите название документа')
      return
    }
    if (newFiles.length === 0) {
      alert('Добавьте хотя бы одно фото')
      return
    }

    const formData = new FormData()
    formData.append('type_doc', docType.trim())
    newFiles.forEach((f) => formData.append('images[]', f))

    try {
      await uploadDoc({ orderId, formData }).unwrap()
      setAddModalVisible(false)
      setDocType('')
      setNewFiles([])
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось загрузить документ')}`)
    }
  }

  const handleDelete = async () => {
    if (!deleteDocId) return
    try {
      await deleteDoc(deleteDocId).unwrap()
      setDeleteModalVisible(false)
      setDeleteDocId(null)
      setViewDoc(null)
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось удалить документ')}`)
    }
  }

  const openAddModal = () => {
    setDocType('')
    setDocTypeError('')
    setNewFiles([])
    setAddModalVisible(true)
  }

  return (
    <AppLayout title="Документы водителя" onBack={() => navigate(-1)}>
      {isLoading && (
        <div className={styles.state}>Загрузка...</div>
      )}

      {isError && (
        <div className={styles.stateError}>Ошибка загрузки</div>
      )}

      {!isLoading && !isError && (
        <div className={styles.pageWrapper}>
          <button className={styles.addButton} onClick={openAddModal}>
            <Plus size={18} color={tgTheme.accent} />
            <span className="font14w500" style={{ color: tgTheme.accent }}>
              Добавить документ
            </span>
          </button>

          {documents.length === 0 && (
            <div className={styles.empty}>
              <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                Документов пока нет
              </span>
            </div>
          )}

          {documents.map((doc) => (
            <button
              key={doc.id}
              className={styles.docCard}
              onClick={() => setViewDoc(doc)}
            >
              <div className={styles.docCardLeft}>
                <FileText size={20} color={tgTheme.textSecondary} />
                <div className={styles.docCardInfo}>
                  <span className="font14w600">{doc.type || 'Документ'}</span>
                  <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
                    {doc.photos?.length || 0} фото
                  </span>
                </div>
              </div>
              <ChevronRight size={18} color={tgTheme.textSecondary} />
            </button>
          ))}
        </div>
      )}

      {viewDoc && (
        <div className={styles.modalOverlay} onMouseDown={() => setViewDoc(null)}>
          <div className={styles.viewModal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.viewHeader}>
              <span className="font16w600">{viewDoc.type || 'Документ'}</span>
              <button onClick={() => setViewDoc(null)}>
                <X size={18} color={tgTheme.textSecondary} />
              </button>
            </div>

            <div className={styles.photosGrid}>
              {(viewDoc.photos || []).map((photo, i) => (
                <div key={i} className={styles.photoThumb} onClick={() => setPreviewImage(photo)}>
                  <img src={photo} alt="" />
                </div>
              ))}
            </div>

            <div className={styles.viewActions}>
              <button
                className={styles.deleteDocBtn}
                onClick={() => {
                  setDeleteDocId(viewDoc.id)
                  setDeleteModalVisible(true)
                }}
              >
                <Trash2 size={16} color={tgTheme.danger} />
                <span className="font14w500" style={{ color: tgTheme.danger }}>
                  Удалить документ
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="" className={styles.previewImage} />
        </div>
      )}

      <ModalComponent
        title="Добавить документ"
        visible={addModalVisible}
        setVisible={setAddModalVisible}
        textButton={uploading ? 'Загрузка…' : 'Сохранить'}
        onSave={handleUpload}
      >
        <div className={styles.addForm}>
          <div className={styles.field}>
            <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
              Название документа
            </span>
            <input
              className={`${styles.input} ${docTypeError ? styles.inputError : ''}`}
              value={docType}
              onChange={(e) => {
                setDocTypeError('')
                setDocType(e.target.value)
              }}
              placeholder="Паспорт, ВУ, и т.д."
            />
            {docTypeError && (
              <span className={styles.errorText}>{docTypeError}</span>
            )}
          </div>

          <div className={styles.field}>
            <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
              Фотографии
            </span>

            <div className={styles.filesGrid}>
              {newFiles.map((file, i) => (
                <div key={i} className={styles.fileThumb}>
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button className={styles.fileRemove} onClick={() => removeFile(i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              style={{ display: 'none' }}
              onChange={handleAddFiles}
            />
            <button
              className={styles.addPhotoBtn}
              onClick={() => fileRef.current?.click()}
            >
              <Plus size={16} color={tgTheme.textSecondary} />
              <span className="font12w400">Добавить фото</span>
            </button>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        title="Удалить документ?"
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        textButton="Удалить"
        onSave={handleDelete}
      >
        <div>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Документ и все его фотографии будут удалены.
          </span>
        </div>
      </ModalComponent>
    </AppLayout>
  )
}
