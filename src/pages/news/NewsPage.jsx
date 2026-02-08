import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsPage.css';
import { getErrorMessage, getImageUrl } from '../../utils';
import RichEditor from '../../components/RichEditor';
import AppLayout from '../../layouts/AppLayout';
import {
  useGetNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
} from '../../redux/services/news';
import CustomButton from '../../components/CustomButton/CustomButton';
import { tgTheme } from '../../common/commonStyle';
import { Plus } from 'lucide-react';

function NewsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const { data: news = [], isLoading: loading, error } = useGetNewsQuery();
  const [createNews, { isLoading: creating }] = useCreateNewsMutation();
  const [updateNews, { isLoading: updating }] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();

  const saving = creating || updating;

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить статью?')) return;

    try {
      setDeletingId(id);
      await deleteNews(id).unwrap();
    } catch (e) {
      alert(`Ошибка при удалении: ${getErrorMessage(e)}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleSave = async (data, file) => {
    try {
      const formData = new FormData();
      formData.append('title_ru', data.title_ru);
      formData.append('title_en', data.title_en);
      formData.append('content_ru', data.content_ru);
      formData.append('content_en', data.content_en);
      formData.append('status', data.status || 'published');
      if (file) formData.append('image', file);

      if (editItem) {
        formData.append('_method', 'PUT');
        await updateNews({ id: editItem.id, formData }).unwrap();
      } else {
        await createNews(formData).unwrap();
      }

      setModalOpen(false);
    } catch (e) {
      alert(`Ошибка при сохранении: ${getErrorMessage(e)}`);
    }
  };

  useEffect(() => {
    if (error) {
      alert(`Ошибка загрузки статей: ${getErrorMessage(error)}`);
    }
  }, [error]);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  return (
    <AppLayout title="Статьи">
      <div className="news-page">
        <div className="news-header">
          <div />
          <CustomButton
            icon={<Plus color={tgTheme.textSecondary} size={16} />}
            text='Создать статью' onClick={() => handleCreate()} />
        </div>
        {loading ? (
          <div className="loader-wrap">
            <div className="loader" />
          </div>
        ) : (
          <div className="news-list">
            {news.map((item) => (
              <div
                className="news-card"
                key={item.id}
                onClick={(e) => {
                  if (e.target.closest('.news-actions')) return;
                  navigate(`/news/${item.id}`);
                }}>
                <img src={getImageUrl(item.image)} alt={item.title_ru} className="news-image" />
                <div className="news-content">
                  <h2>{item.title_ru}</h2>
                  <p className="news-date">{new Date(item.created_at).toLocaleDateString()}</p>
                  <div
                    className="news-desc"
                    dangerouslySetInnerHTML={{
                      __html: item.content_ru.replace(/<[^>]+>/g, '').slice(0, 200) + '…',
                    }}
                  />
                  <div className="news-actions">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>
                      Редактировать
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}>
                      {deletingId === item.id ? 'Удаление…' : 'Удалить'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <NewsModal
            item={editItem}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </AppLayout>
  );
}

function NewsModal({ item, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    item
      ? {
        ...item,
        content_ru: item.content_ru || '',
        content_en: item.content_en || '',
      }
      : {
        title_ru: '',
        title_en: '',
        content_ru: '',
        content_en: '',
        image: '',
        status: 'published',
      },
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item && item.image ? getImageUrl(item.image) : '');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>{item ? 'Редактировать статью' : 'Создать статью'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Заголовок (RU)</label>
          <input name="title_ru" value={form.title_ru} onChange={handleChange} required />
          <label>Title (EN)</label>
          <input name="title_en" value={form.title_en} onChange={handleChange} required />
          <label>Контент (RU)</label>
          <RichEditor
            value={form.content_ru}
            onChange={(html) => setForm({ ...form, content_ru: html })}
          />

          <label>Content (EN)</label>
          <RichEditor
            value={form.content_en}
            onChange={(html) => setForm({ ...form, content_en: html })}
          />
          <div className="image-upload">
            <label className="image-label">Картинка статьи</label>

            <input type="file" accept="image/*" onChange={handleFile} key={preview} />

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="preview" />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewsPage;
