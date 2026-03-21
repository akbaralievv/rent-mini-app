import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import CustomButton from '../../components/CustomButton/CustomButton';
import ModalComponent from '../../components/ModalComponent/ModalComponent';
import { tgTheme } from '../../common/commonStyle';
import { Plus, Trash2, Pencil, Image } from 'lucide-react';
import { getErrorMessage, getImageUrl } from '../../utils';
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
} from '../../redux/services/notesApi';
import ImageModal from '../financialReport/operationPage/OperationEditPage/ImageModal/ImageModal';
import styles from './NotesPage.module.css';

function NotesPage() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: notesData, isLoading, error } = useGetNotesQuery(100);
  const [deleteNote] = useDeleteNoteMutation();

  const notes = notesData?.data || notesData || [];

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      setDeletingId(deleteModalId);
      await deleteNote(deleteModalId).unwrap();
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
      setDeleteModalId(null);
    }
  };

  return (
    <AppLayout title="Заметки">
      <div className={styles.main}>
        <div className={styles.header}>
          <div />
          <CustomButton
            icon={<Plus color={tgTheme.textSecondary} size={16} />}
            text="Создать заметку"
            onClick={() => navigate('/notes/create')}
          />
        </div>

        {isLoading ? (
          <div className="loader-wrap">
            <div className="loader" />
          </div>
        ) : error ? (
          <div className={styles.empty} style={{ color: tgTheme.danger }}>
            Ошибка: {getErrorMessage(error)}
          </div>
        ) : notes.length === 0 ? (
          <div className={styles.empty}>Заметок пока нет</div>
        ) : (
          <div className={styles.list}>
            {notes.map((note) => {
              const attachment = note.attachments?.[0];
              return (
                <div className={styles.card} key={note.id}>
                  {attachment ? (
                    <img
                      src={getImageUrl(attachment.file_path || attachment.url)}
                      alt={note.text}
                      className={styles.cardImage}
                      onClick={() => setPreviewImage(getImageUrl(attachment.file_path || attachment.url))}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <Image size={24} color={tgTheme.textSecondary} />
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{note.text}</span>
                    {note.description && (
                      <span className={styles.cardDesc}>{note.description}</span>
                    )}
                    {note.created_at && (
                      <span className={styles.cardDate}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => navigate(`/notes/${note.id}/edit`)}
                    >
                      <Pencil size={16} color={tgTheme.white} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteModalId(note.id)}
                      disabled={deletingId === note.id}
                    >
                      <Trash2 size={16} color={tgTheme.white} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModalComponent
        visible={Boolean(deleteModalId)}
        setVisible={() => setDeleteModalId(null)}
        title="Удаление"
        onSave={handleDelete}
        textButton="Удалить"
      >
        <span className="font14w400" style={{ color: tgTheme.textSecondary }}>
          Вы уверены, что хотите удалить эту заметку?
        </span>
      </ModalComponent>

      <ImageModal
        visible={Boolean(previewImage)}
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </AppLayout>
  );
}

export default NotesPage;
