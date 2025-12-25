
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NewsPage.css";
import { getImageUrl } from "../utils";
import RichEditor from "../components/RichEditor";

const API_URL = "http://127.0.0.1:8000/api/news";

function NewsPage() {
  const [news, setNews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      const res = await axios.get(API_URL);
      setNews(res.data);
    } catch (e) {
      alert(`Ошибка загрузки статей: ${e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить статью?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchNews();
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
    const formData = new FormData();
    formData.append("title_ru", data.title_ru);
    formData.append("title_en", data.title_en);
    formData.append("content_ru", data.content_ru);
    formData.append("content_en", data.content_en);
    formData.append("status", data.status || "published");
    if (file) formData.append("image", file);

    if (editItem) {
        formData.append("_method", "PUT");
      await axios.post(`${API_URL}/${editItem.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    setModalOpen(false);
    fetchNews();
  };

    useEffect(() => {
        const load = async () => {
            await fetchNews();
        };
        load();
    }, []);

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [modalOpen]);

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>Статьи</h1>
        <button className="create-btn" onClick={handleCreate}>Создать статью</button>
      </div>
      <div className="news-list">
        {news.map((item) => (
          <div
            className="news-card"
            key={item.id}
            onClick={e => {
              if (e.target.closest(".news-actions")) return;
              navigate(`/news/${item.id}`);
            }}
            style={{ cursor: "pointer" }}
          >
            <img src={getImageUrl(item.image)} alt={item.title_ru} className="news-image" />
            <div className="news-content">
              <h2>{item.title_ru}</h2>
              <p className="news-date">{new Date(item.created_at).toLocaleDateString()}</p>
              <div
                className="news-desc"
                dangerouslySetInnerHTML={{ __html: item.content_ru.replace(/<[^>]+>/g, "").slice(0, 200) + "..." }}
              />
              <div className="news-actions">
                <button className="edit-btn" onClick={() => handleEdit(item)}>Редактировать</button>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <NewsModal
          item={editItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function NewsModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item
      ? {
          ...item,
            content_ru: item.content_ru || "",
            content_en: item.content_en || "",
        }
      : {
          title_ru: "",
          title_en: "",
          content_ru: "",
          content_en: "",
          image: "",
          status: "published",
        }
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item && item.image ? getImageUrl(item.image) : "");

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
      setPreview("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, file);
  };

  return (
      <div className="modal-backdrop" onClick={onClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{item ? "Редактировать статью" : "Создать статью"}</h2>
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

                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleFile}
                          key={preview}
                      />

                      {preview && (
                          <div className="image-preview">
                              <img src={preview} alt="preview" />
                          </div>
                      )}
                  </div>

            <div className="modal-actions">
                <button type="submit" className="save-btn">Сохранить</button>
                <button type="button" className="cancel-btn" onClick={onClose}>Отмена</button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default NewsPage;
