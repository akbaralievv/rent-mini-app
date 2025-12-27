import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./NewsPage.css";
import { getImageUrl } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/${id}`)
      .then(res => {
        setItem(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  }

  if (!item) return <div className="news-detail-error">Статья не найдена</div>;

  return (
    <div className="news-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>Назад</button>
      <div className="news-detail-card">
        <p className="news-date">{item.status}: {new Date(item.created_at).toLocaleDateString()}</p>
        <img src={getImageUrl(item.image)} alt={item.title_ru} className="news-detail-image" />
        <h1>{item.title_ru}</h1>
        <div className="news-detail-content" dangerouslySetInnerHTML={{ __html: item.content_ru }} />
      </div>
    </div>
  );
}
