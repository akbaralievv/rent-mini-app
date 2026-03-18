import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import CustomButton from '../../../components/CustomButton/CustomButton';
import { tgTheme } from '../../../common/commonStyle';
import { Plus, Trash2, Wrench, MapPin, Calendar } from 'lucide-react';
import { getErrorMessage, getImageUrl } from '../../../utils';
import {
  useGetByCarQuery,
  useDeleteMutation,
} from '../../../redux/services/maintenanceItemApi';
import styles from './CarServicePage.module.css';

const STATUS_MAP = {
  pending: 'Ожидание',
  process: 'В процессе',
  completed: 'Завершено',
};

const STATUS_COLOR = {
  pending: tgTheme.warning,
  process: tgTheme.accent,
  completed: tgTheme.success,
};

export default function CarServicePage() {
  const navigate = useNavigate();
  const { id: carId } = useParams();
  const [deletingId, setDeletingId] = useState(null);

  const { data: itemsData, isLoading, error } = useGetByCarQuery(carId);
  const [deleteItem] = useDeleteMutation();

  const items = itemsData?.data || itemsData || [];

  const handleDelete = async (e, itemId) => {
    e.stopPropagation();
    if (!window.confirm('Удалить запись ТО?')) return;

    try {
      setDeletingId(itemId);
      await deleteItem(itemId).unwrap();
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout title="ТО авто" onBack={() => navigate(-1)}>
      <div className={styles.main}>
        <div className={styles.header}>
          <div />
          <CustomButton
            icon={<Plus color={tgTheme.textSecondary} size={16} />}
            text="Добавить ТО"
            onClick={() => navigate(`/cars/${carId}/services/create`)}
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
        ) : items.length === 0 ? (
          <div className={styles.empty}>Записей ТО пока нет</div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => {
              const image = item.images?.[0];
              return (
                <div
                  className={styles.card}
                  key={item.id}
                  onClick={() => navigate(`/cars/${carId}/services/${item.id}/edit`)}
                >
                  {image ? (
                    <img
                      src={getImageUrl(image.path || image.image_url)}
                      alt={item.name}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <Wrench size={24} color={tgTheme.muted2} />
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{item.name}</span>

                    <div className={styles.cardMeta}>
                      {item.location && (
                        <span className={styles.metaItem}>
                          <MapPin size={12} color={tgTheme.textSecondary} />
                          {item.location}
                        </span>
                      )}
                      {item.date_start && (
                        <span className={styles.metaItem}>
                          <Calendar size={12} color={tgTheme.textSecondary} />
                          {item.date_start}
                          {item.date_end ? ` — ${item.date_end}` : ''}
                        </span>
                      )}
                    </div>

                    <div>
                      {item.status && (
                        <span
                          className={styles.status}
                          style={{ color: STATUS_COLOR[item.status] || tgTheme.textSecondary }}
                        >
                          {STATUS_MAP[item.status] || item.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                  >
                    <Trash2 size={16} color={tgTheme.danger} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
