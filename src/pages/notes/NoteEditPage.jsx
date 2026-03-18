import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { getErrorMessage, getImageUrl } from '../../utils';
import { Upload, X } from 'lucide-react';
import {
  useGetNoteByIdQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useGetAttachmentsQuery,
  useCreateAttachmentMutation,
  useDeleteAttachmentMutation,
} from '../../redux/services/notesApi';
import ImageModal from '../financialReport/operationPage/OperationEditPage/ImageModal/ImageModal';
import './NotesPage.css';

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
      alert('Введите название заметки');
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
      <div className="note-edit-page">
        <div>
          <label>Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название"
          />
        </div>

        {
          isEdit && <div className="note-image-section">
            <label>Фото (необязательно)</label>

            {preview ? (
              <div className="note-image-preview">
                <img src={preview} alt="preview" onClick={() => setPreviewModal(preview)} />
                <button className="note-image-remove" onClick={handleRemoveImage}>
                  <X size={14} />
                </button>
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
              className="note-upload-btn"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} />
              {preview ? 'Заменить фото' : 'Загрузить фото'}
            </button>
          </div>
        }

        <div className="note-edit-actions">
          <button
            className="note-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button
            className="note-cancel-btn"
            onClick={() => navigate('/notes')}
          >
            Отмена
          </button>
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
