import React, { useState } from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import {
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from '../../../redux/services/tagsAction'
import { tgTheme } from '../../../common/commonStyle'
import {
  Edit,
  Plus,
  Tag,
  Trash,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import styles from './TagsPage.module.css'
import { getErrorMessage } from '../../../utils'

export default function TagsPage() {
  const navigate = useNavigate()

  const { data: tags = [] } = useGetTagsQuery()
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation()
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation()
  const [deleteTag, { isLoading: isDelating }] = useDeleteTagMutation()

  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [tagName, setTagName] = useState('')
  const [tagType, setTagType] = useState('expense') // expense | income
  const [editingTag, setEditingTag] = useState(null)
  const [deletingTag, setDeletingTag] = useState(null)

  /* ---------- helpers ---------- */

  const closeModal = () => {
    setIsOpen(false)
    setTagName('')
    setTagType('expense')
    setEditingTag(null)
  }

  const closeDeleteModal = () => {
    setIsDeleteOpen(false)
    setDeletingTag(null)
  }

  const handleEdit = (tag) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setTagType(tag.type) // income / expense
    setIsOpen(true)
  }

  const handleSave = async () => {
    const name = tagName.trim()
    if (!name) {
      alert('Введите название тега')
      return
    }

    try {
      if (editingTag?.id) {
        await updateTag({
          id: editingTag.id,
          name,
          type: tagType,
        }).unwrap()
      } else {
        await createTag({
          name,
          type: tagType,
        }).unwrap()
      }
      closeModal()
    } catch (err) {
      alert(getErrorMessage(err, 'Не удалось сохранить тег'))
    }
  }

  const handleDeleteClick = (tag) => {
    setDeletingTag(tag)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      deleteTag(deletingTag.id)
      closeDeleteModal()
    } catch (err) {
      alert('Не удалось удалить тег');
      console.log(err)
    }
  }

  const toggleType = () => {
    setTagType(prev => (prev === 'expense' ? 'income' : 'expense'))
  }

  return (
    <AppLayout title={'Теги'} onBack={() => navigate(-1)}>
      <ButtonSection
        title='Список тегов'
        buttons={[
          ...tags.map(tag => ({
            ...tag,
            arrowHide: true,
            icon: <Tag size={18} />,
            text: tag.name,
            actions: [
              {
                icon: <Trash size={16} color={tgTheme.btnActive} />,
                onClick: () => handleDeleteClick(tag),
              },
              {
                icon: <Edit size={16} color={tgTheme.btnActive} />,
                onClick: () => handleEdit(tag),
              },
            ],
          })),
          {
            id: 0,
            text: 'Добавить',
            arrowHide: true,
            icon: <Plus />,
            onClick: () => setIsOpen(true),
          },
        ]}
      />
      <div className={'miniBlock'}>
        <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
          Помечайте операции тегами, чтобы легче находить и анализировать доходы и расходы.</span>
      </div>

      {/* ================= MODAL CREATE / EDIT ================= */}
      {isOpen && (
        <div className={styles.modalOverlay} onMouseDown={closeModal}>
          <div
            className={styles.modal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className="font18w600">
                {editingTag ? 'Редактировать тег' : 'Добавить тег'}
              </span>

              <button className={styles.modalClose} onClick={closeModal}>
                <X size={18} color={tgTheme.textSecondary} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Название */}
              <div className={styles.field}>
                <span className="font16w500">Название</span>
                <input
                  className={`${styles.input} font14w500`}
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Например: Еда"
                  autoFocus
                />
              </div>

              {/* Тип */}
              <div className={styles.field}>
                <span className="font16w500">Тип</span>

                <button
                  className={styles.typeInput}
                  onClick={toggleType}
                >
                  <span className="font14w500">
                    {tagType === 'expense' ? 'Расход' : 'Доход'}
                  </span>

                  {tagType === 'income' ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronUp size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryBtn}
                onClick={closeModal}
              >
                <span className="font14w600">Отмена</span>
              </button>

              <button
                className={styles.primaryBtn}
                onClick={handleSave}
                disabled={isCreating || isUpdating || isDelating}
              >
                <span className="font14w600">Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {isDeleteOpen && (
        <div className={styles.modalOverlay} onMouseDown={closeDeleteModal}>
          <div
            className={styles.modal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className="font18w600">Удалить тег?</span>

              <button
                className={styles.modalClose}
                onClick={closeDeleteModal}
              >
                <X size={18} color={tgTheme.textSecondary} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <span className="font14w500">
                Тег «{deletingTag?.name}» будет удалён безвозвратно
              </span>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryBtn}
                onClick={closeDeleteModal}
              >
                <span className="font14w600">Отмена</span>
              </button>

              <button
                className={styles.primaryBtn}
                onClick={handleConfirmDelete}
              >
                <span className="font14w600">Удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
