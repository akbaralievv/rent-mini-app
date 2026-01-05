import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import './ContractsPage.css';
import { useGetContractsQuery } from '../../redux/services/contracts';
import { getErrorMessage } from '../../utils';

export default function ContractsPage() {
  const navigate = useNavigate();
  const { data: contracts, isLoading: loading, error } = useGetContractsQuery();

  useEffect(() => {
    if (error) {
      alert(`Ошибка загрузки договоров: ${getErrorMessage(error)}`);
    }
  }, [error]);

  const contractsData = Array.isArray(contracts) ? contracts : contracts?.data ?? [];
  return (
    <AppLayout title="Договоры">
      <div className="contracts-page">
        <div className="contracts-header">
          <div />
          <button className="create-btn" onClick={() => navigate('/contracts/new')}>
            Создать договор
          </button>
        </div>

        {loading ? (
          <div className="loader-wrap">
            <div className="loader" />
          </div>
        ) : contractsData?.length === 0 ? (
          <div className="contracts-empty">
            <p style={{ color: 'var(--tg-muted)' }}>Договоров пока нет</p>
          </div>
        ) : (
          <div className="contracts-list">
            {contractsData?.map((c) => (
              <div
                key={c.id}
                className="contract-card"
                onClick={() => navigate(`/contracts/${c.id}`)}>
                <div className="contract-main">
                  <h3>{c.doc_name || 'Договор без названия'}</h3>
                  <p className="contract-meta">
                    {c.car_name} • {c.car_number}
                  </p>
                  <p className="contract-meta">Клиент: {c.customer_name || '—'}</p>
                </div>

                <div className="contract-footer">
                  <span className="contract-date">
                    {new Date(c.created_at).toLocaleDateString()}
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
