import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { getErrorMessage, getImageUrl } from '../../utils';
import { Images, X } from 'lucide-react';
import {
  useGetNoteByIdQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useGetAttachmentsQuery,
  useCreateAttachmentMutation,
  useDeleteAttachmentMutation,
} from '../../redux/services/notesApi';
import ImageModal from '../financialReport/operationPage/OperationEditPage/ImageModal/ImageModal';
import styles from './NoteEditPage.module.css';

function NoteEditPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const { data: noteData, isLoading: loadingNote } = useGetNoteByIdQuery(id, { skip: !isEdit });
  const { data: attachmentsData } = useGetAttachmentsQuery(id, { skip: !isEdit });

  const [createNote, { isLoading: creating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: updating }] = useUpdateNoteMutation();
  const [createAttachment] = useCreateAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  const [title, setTitle] = useState('');
  const [nameError, setNameError] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

  const note = noteData?.data || noteData;
  const attachments = attachmentsData?.data || attachmentsData || [];
  const saving = creating || updating;

  useEffect(() => {
    if (note) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(note.text || '');
    }
  }, [note]);

  useEffect(() => {
    if (attachments.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingAttachment(attachments[0]);
      setPreview(getImageUrl(attachments[0].file_path || attachments[0].url));
    }
  }, [attachments]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(f.type)) {
      alert('Допустимые форматы: JPG, PNG, WEBP');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('Максимальный размер файла: 5 МБ');
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExistingAttachment(null);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview('');
    setExistingAttachment(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setNameError('Введите название');
      return;
    }

    try {
      let noteId = id;

      if (isEdit) {
        await updateNote({ id, text: title.trim() }).unwrap();
      } else {
        const result = await createNote({ text: title.trim() }).unwrap();
        noteId = result?.data?.id || result?.id;
      }

      if (file && noteId) {
        if (existingAttachment) {
          await deleteAttachment(existingAttachment.id).unwrap();
        }

        const formData = new FormData();
        formData.append('file', file);

        await createAttachment({ noteId, formData }).unwrap();
      }

      if (!file && !existingAttachment && isEdit && attachments.length > 0) {
        await deleteAttachment(attachments[0].id).unwrap();
      }

      navigate('/notes');
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err)}`);
    }
  };

  if (isEdit && loadingNote) {
    return (
      <AppLayout title="Заметка">
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEdit ? 'Редактировать заметку' : 'Новая заметка'} onBack={() => navigate(-1)}>
      <div className={styles.pageWrapper}>
        <div className={styles.modalLike}>
          <div className={styles.modalBody}>

            {/* NAME */}
            <div className={styles.field}>
              <span className="font16w500">Название</span>
              <input
                className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Введите название"
              />
              {nameError && (
                <span className={styles.errorText}>{nameError}</span>
              )}
            </div>

            {/* IMAGE */}
            <div className={styles.field}>
              <span className="font16w500">Фото (необязательно)</span>

              {preview ? (
                <div className={styles.imagesGrid}>
                  <div className={styles.imageThumb}>
                    <img
                      src={preview}
                      alt="preview"
                      onClick={() => setPreviewModal(preview)}
                    />
                    <button
                      className={styles.imageRemove}
                      onClick={handleRemoveImage}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : null}

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                className={styles.addBtn}
                onClick={() => fileRef.current?.click()}
              >
                <Images size={16} color="var(--tg-text-secondary)" />
                <span className="font12w400">
                  {preview ? 'Заменить фото' : 'Загрузить фото'}
                </span>
              </button>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate('/notes')}
            >
              <span className="font14w600">Отмена</span>
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleSave}
              disabled={saving}
            >
              <span className="font14w600">
                {saving ? 'Сохранение…' : 'Сохранить'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <ImageModal
        visible={Boolean(previewModal)}
        image={previewModal}
        onClose={() => setPreviewModal(null)}
      />
    </AppLayout>
  );
}

export default NoteEditPage;
