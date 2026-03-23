import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { getErrorMessage, getImageUrl } from '../../utils';
import { tgTheme } from '../../common/commonStyle';
import { Maximize2, Plus, Trash2 } from 'lucide-react';
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
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [imgFullModal, setImgFullModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  const note = noteData?.data || noteData;
  const attachments = attachmentsData?.data || attachmentsData || [];
  const saving = creating || updating;

  useEffect(() => {
    if (note) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(note.text || '');
      setDescription(note.description || '');
    }
  }, [note]);

  useEffect(() => {
    if (attachments.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingPhotos(attachments.map((att) => ({
        id: att.id,
        url: getImageUrl(att.file_path || att.url),
      })));
    }
  }, [attachments]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const valid = files.filter((f) => {
      if (!allowedTypes.includes(f.type)) {
        alert(`Файл "${f.name}" — недопустимый формат`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert(`Файл "${f.name}" — максимум 10 МБ`);
        return false;
      }
      return true;
    });

    setNewFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId).unwrap();
      setExistingPhotos((prev) => prev.filter((p) => p.id !== attachmentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setNameError('Введите название');
      return;
    }

    try {
      let noteId = id;

      if (isEdit) {
        await updateNote({ id, text: title.trim(), description: description.trim() }).unwrap();
      } else {
        const result = await createNote({ text: title.trim(), description: description.trim() }).unwrap();
        noteId = result?.data?.id || result?.id;
      }

      if (newFiles.length > 0 && noteId) {
        await createAttachment({ noteId, files: newFiles }).unwrap();
        setNewFiles([]);
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

            {/* DESCRIPTION */}
            <div className={styles.field}>
              <span className="font16w500">Описание</span>
              <textarea
                className={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание"
                rows={3}
              />
            </div>

            {/* ФОТО */}
            <div className={styles.field}>
              <span className="font16w500">Фото</span>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />

              <div className={styles.photosList}>
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className={styles.displayPhoto}>
                    <img
                      src={photo.url}
                      alt="photo"
                      className={styles.img}
                      style={{ width: 200, height: 100, objectFit: 'contain', borderRadius: 8 }}
                    />
                    <div className={styles.imageBtnsBlock}>
                      <button type="button" onClick={() => {
                        setPhotoPreview(photo.url);
                        setImgFullModal(true);
                      }}><Maximize2 color={tgTheme.white} size={20} /></button>
                      <button type="button" onClick={() => removeExistingPhoto(photo.id)}>
                        <Trash2 color={tgTheme.white} size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                {newFiles.map((file, index) => (
                  <div key={index} className={styles.displayPhoto}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="new photo"
                      className={styles.img}
                      style={{ width: 200, height: 100, objectFit: 'contain', borderRadius: 8 }}
                    />
                    <div className={styles.imageBtnsBlock}>
                      <button type="button" onClick={() => {
                        setPhotoPreview(URL.createObjectURL(file));
                        setImgFullModal(true);
                      }}><Maximize2 color={tgTheme.white} size={20} /></button>
                      <button type="button" onClick={() => removeNewFile(index)}>
                        <Trash2 color={tgTheme.white} size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className={styles.addBtn}
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="font12w400">добавить фото</span>
                  <Plus size={16} color={tgTheme.textSecondary} />
                </button>
              </div>
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
        visible={imgFullModal}
        image={photoPreview}
        onClose={() => setImgFullModal(false)}
      />
    </AppLayout>
  );
}

export default NoteEditPage;
