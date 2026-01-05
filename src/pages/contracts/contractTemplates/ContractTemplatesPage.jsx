import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContractTemplates.css';
import { useGetContractTemplatesQuery } from '../../../redux/services/contractTemplates';
import AppLayout from '../../../layouts/AppLayout';
import { getErrorMessage } from '../../../utils';

export default function ContractTemplatesPage() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useGetContractTemplatesQuery();

  useEffect(() => {
    if (error) {
      alert(`Ошибка загрузки шаблонов: ${getErrorMessage(error)}`);
    }
  }, [error]);

  const templates = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <AppLayout title="Шаблоны договоров" onBack={() => navigate(-1)}>
      <div className="contractTemplates-page">
        <div className="contractTemplates-header">
          <div />
          <button className="create-btn" onClick={() => navigate('/contracts/templates/new')}>
            Создать шаблон
          </button>
        </div>

        {loading ? (
          <div className="loader-wrap">
            <div className="loader" />
          </div>
        ) : templates.length === 0 ? (
          <div className="contractTemplates-empty">
            <p style={{ color: 'var(--tg-muted)' }}>Шаблонов пока нет</p>
          </div>
        ) : (
          <div className="contractTemplates-list">
            {templates?.map((temp) => (
              <div
                key={temp.id}
                className="contractTemplate-card"
                onClick={() => navigate(`/contracts/templates/${temp.id}/edit`)}>
                <div className="contractTemplate-main">
                  <h3>{temp.name}</h3>
                  <div className="contractTemplate-desc">
                    <p className="contractTemplate-meta">Компания: {temp.company_name}</p>
                    <p className="contractTemplate-meta">Телефон: {temp.company_phone}</p>
                    <p className="contractTemplate-meta">E-mail: {temp.company_email}</p>
                    <p className="contractTemplate-meta">Слоган: {temp.company_slogan}</p>
                  </div>
                </div>
                <div className="contractTemplate-footer">
                  <span className="contractTemplate-date">
                    {new Date(temp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
