import React, { useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import styles from './CompanyDocumentPage.module.css'
import ButtonSection from '../../components/ButtonSection/ButtonSection'
import { FolderClosed, Plus, X } from 'lucide-react'
import { tgTheme } from '../../common/commonStyle'
import { useCreateCompanyDocumentSectionMutation, useGetCompanyDocumentSectionsQuery } from '../../redux/services/getCompanySectionsAction'

export default function CompanyDocumentPage() {
  const navigate = useNavigate()
  const {
    data: sections = [],
  } = useGetCompanyDocumentSectionsQuery();

  const [createSection] =
    useCreateCompanyDocumentSectionMutation();

  const [isOpen, setIsOpen] = useState(false)
  const [folderName, setFolderName] = useState('')

  const closeModal = () => {
    setIsOpen(false)
    setFolderName('')
  }

  const handleClick = (id) => {
    navigate('/company-document/' + id)
  }

  const handleSave = async () => {
    const name = folderName.trim()
    if (!name) return alert('Введите название папки')
    try {
      await createSection({ name: name }).unwrap();
    } catch (err) {
      console.error(err);
    }
    closeModal()
  }

  return (
    <AppLayout title={'Документы компании'} onBack={() => navigate(-1)}>
      <div>
        <ButtonSection
          title="Разделы"
          buttons={[
            ...sections.map(section => ({
              ...section,
              icon: <FolderClosed />,
              onClick: () => handleClick(section.id),
              text: section.name,
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
      </div>

      {/* ✅ MODAL как у ClientsDocumentsPage */}
      {isOpen && (
        <div className={styles.modalOverlay} onMouseDown={closeModal}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={'font18w600'}>Добавить папку</span>

              <button className={styles.modalClose} onClick={closeModal}>
                <X size={18} color={tgTheme.textSecondary} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <span className={'font16w500'}>Название</span>
                <input
                  className={`${styles.input} font14w500`}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Например: Договоры"
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={closeModal}>
                <span className="font14w600">Отмена</span>
              </button>

              <button className={styles.primaryBtn} onClick={handleSave}>
                <span className="font14w600">Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
