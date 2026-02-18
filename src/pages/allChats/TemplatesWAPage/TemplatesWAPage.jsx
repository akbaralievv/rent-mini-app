import React, { useState, useEffect } from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import ButtonSection from '../../../components/ButtonSection/ButtonSection'
import { Edit2, Plus, Star, Trash2 } from 'lucide-react'
import ModalComponent from '../../../components/ModalComponent/ModalComponent'
import styles from './TemplatesWAPage.module.css'

import {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useSetAutoTemplateMutation,
} from '../../../redux/services/waTemplatesApi'
import { tgTheme } from '../../../common/commonStyle'

export default function TemplatesWAPage() {
  const navigate = useNavigate()

  const { data } = useGetTemplatesQuery();
  const templates = data?.data || [];

  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [setAutoTemplate] = useSetAutoTemplateMutation();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTemplate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(editingTemplate.title);
      setBody(editingTemplate.body);
    } else {
      setTitle('');
      setBody('');
    }
  }, [editingTemplate])

  const handleSave = async () => {
    if (!title.trim()) {
      setErrors(p => ({ ...p, title: 'Введите название' }));
      return
    }
    if (!body.trim()) {
      setErrors(p => ({ ...p, body: 'Введите название' }));
      return
    }

    if (editingTemplate) {
      await updateTemplate({
        id: editingTemplate.id,
        title,
        body,
      })
    } else {
      await createTemplate({
        title,
        body,
        is_auto: false,
      })
    }

    setModalVisible(false)
    setEditingTemplate(null)
  }

  return (
    <AppLayout title={'WA шаблоны'} onBack={() => navigate(-1)}>

      <ButtonSection
        title='Быстрые ответы'
        buttons={[
          ...templates.map((tpl) => ({
            icon: (
              <Star
                size={20}
                color={tpl.is_auto ? tgTheme.warning : tgTheme.white}
              />
            ),
            text: tpl.title + '',
            arrowHide: true,
            onClick: () => setAutoTemplate(tpl.id),
            actions: [
              {
                icon: <Edit2 size={16} color={tgTheme.textSecondary} />,
                onClick: () => {
                  setEditingTemplate(tpl);
                  setModalVisible(true);
                }
              },
              {
                icon: <Trash2 size={16} color={tgTheme.textSecondary} />,
                onClick: () => {
                  setTemplateToDelete(tpl);
                  setDeleteModalVisible(true);
                }
              }
            ]
          })),
          {
            icon: <Plus size={20} />,
            text: 'Добавить',
            onClick: () => {
              setEditingTemplate(null);
              setModalVisible(true);
            },
            arrowHide: true,
          }
        ]}
      />
      <div className={'miniBlock ' + styles.desc}>
        <Star
          size={20}
          color={tgTheme.warning}
        />
        <span className='font12w500' style={{ color: tgTheme.textSecondary }}>
          - означает автоответ. Нажмите на шаблон, чтобы изменить его.
        </span>
      </div>

      <ModalComponent
        visible={modalVisible}
        setVisible={setModalVisible}
        title={editingTemplate ? 'Редактировать шаблон' : 'Создать шаблон'}
        onSave={handleSave}
        textButton={editingTemplate ? 'Обновить' : 'Создать'}
      >
        <div>
          <div className={styles.field}>
            <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
              Название шаблона
            </span>
            <input
              className={styles.input}
              placeholder="Название"
              value={title}
              onChange={(e) => {
                setErrors((p) => ({ ...p, title: '' }))
                setTitle(e.target.value)
              }}
            />
            {
              errors.title && <div className={styles.errorBlock}>
                <span className="font12w400" style={{ color: tgTheme.danger }}>
                  {errors.title}
                </span>
              </div>
            }
          </div>
          <div className={styles.field}>
            <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
              Описание шаблона
            </span>
            <textarea
              className={styles.textarea}
              placeholder="Описание"
              value={body}
              onChange={(e) => {
                setErrors((p) => ({ ...p, body: '' }))
                setBody(e.target.value)
              }}
              rows={5}
            />
            {
              errors.body && <div className={styles.errorBlock}>
                <span className="font12w400" style={{ color: tgTheme.danger }}>
                  {errors.body}
                </span>
              </div>
            }
          </div>
        </div>
      </ModalComponent>
      <ModalComponent
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        title="Удалить шаблон?"
        onSave={async () => {
          if (!templateToDelete) return
          await deleteTemplate(templateToDelete.id)
          setDeleteModalVisible(false)
          setTemplateToDelete(null)
        }}
        textButton="Удалить"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Это действие нельзя отменить. Шаблон нельзя будет восстановить.
            Вы уверены, что хотите удалить шаблон
            {templateToDelete?.title && ` "${templateToDelete.title}"`}?
          </span>
        </div>
      </ModalComponent>

    </AppLayout>
  )
}
