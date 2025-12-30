import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NewsPage.css";
import { getImageUrl } from "../../utils";
import AppLayout from "../../layouts/AppLayout";
import { useGetNewsByIdQuery } from "../../redux/services/news";

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: item, isLoading: loading, isError } = useGetNewsByIdQuery(id);

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  }

  if (isError || !item) return <div className="news-detail-error">Статья не найдена</div>;

  return (
    <AppLayout onBack={() => navigate(-1)}>
    <div className="news-detail-page">
      <div className="news-detail-card">
        <p className="news-date">{item.status}: {new Date(item.created_at).toLocaleDateString()}</p>
        <img src={getImageUrl(item.image)} alt={item.title_ru} className="news-detail-image" />
        <h1>{item.title_ru}</h1>
        <div className="news-detail-content" dangerouslySetInnerHTML={{ __html: item.content_ru }} />
      </div>
    </div>
    </AppLayout>
  );
}
