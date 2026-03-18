import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import CustomButton from '../../components/CustomButton/CustomButton';
import { tgTheme } from '../../common/commonStyle';
import { Plus, Trash2, Image } from 'lucide-react';
import { getErrorMessage, getImageUrl } from '../../utils';
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
} from '../../redux/services/notesApi';
import ImageModal from '../financialReport/operationPage/OperationEditPage/ImageModal/ImageModal';
import './NotesPage.css';

function NotesPage() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: notesData, isLoading, error } = useGetNotesQuery(100);
  const [deleteNote] = useDeleteNoteMutation();

  const notes = notesData?.data || notesData || [];

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Удалить заметку?')) return;

    try {
      setDeletingId(id);
      await deleteNote(id).unwrap();
    } catch (err) {
      alert(`Ошибка при удалении: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout title="Заметки">
      <div className="notes-page">
        <div className="notes-header">
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
          <div className="notes-error">
            Ошибка загрузки: {getErrorMessage(error)}
          </div>
        ) : notes.length === 0 ? (
          <div className="notes-empty">Заметок пока нет</div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => {
              const attachment = note.attachments?.[0];
              console.log(note)
              return (
                <div
                  className="note-card"
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}/edit`)}
                >
                  {attachment ? (
                    <img
                      src={getImageUrl(attachment.url)}
                      alt={note.title}
                      className="note-image"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(getImageUrl(attachment.file_path || attachment.url));
                      }}
                    />
                  ) : (
                    <div className="note-image-placeholder">
                      <Image size={32} color={tgTheme.muted2} />
                    </div>
                  )}
                  <div className="note-info">
                    <span className="note-title">{note.text}</span>
                    {note.created_at && (
                      <span className="note-date">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    className="note-delete-btn"
                    onClick={(e) => handleDelete(e, note.id)}
                    disabled={deletingId === note.id}
                  >
                    <Trash2 size={16} color={tgTheme.danger} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImageModal
        visible={Boolean(previewImage)}
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </AppLayout>
  );
}

export default NotesPage;
