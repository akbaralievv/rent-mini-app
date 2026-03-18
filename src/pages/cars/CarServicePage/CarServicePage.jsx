import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import CustomButton from '../../../components/CustomButton/CustomButton';
import BackdropModal from '../../../components/BackdropModal/BackdropModal';
import ModalComponent from '../../../components/ModalComponent/ModalComponent';
import { tgTheme } from '../../../common/commonStyle';
import { Plus, Trash2, Wrench, MapPin, Calendar, Pencil, Tag, ChevronDown, Check } from 'lucide-react';
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
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [statusFilterVisible, setStatusFilterVisible] = useState(false);

  const { data: itemsData, isLoading, error } = useGetByCarQuery(carId);
  const [deleteItem] = useDeleteMutation();

  const allItems = itemsData?.data || itemsData || [];
  const items = statusFilter
    ? allItems.filter((item) => item.status === statusFilter)
    : allItems;

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      setDeletingId(deleteModalId);
      await deleteItem(deleteModalId).unwrap();
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
      setDeleteModalId(null);
    }
  };

  return (
    <AppLayout title="ТО авто" onBack={() => navigate(-1)}>
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.statusFilter}>
            <button
              onClick={() => setStatusFilterVisible(true)}
              className={styles.filterBtn}
            >
              <Tag size={16} color={tgTheme.textSecondary} />
              <span className="font13w500">
                {STATUS_MAP[statusFilter] || 'Все статусы'}
              </span>
              <ChevronDown color={tgTheme.textSecondary} size={16} />
            </button>

            {statusFilterVisible && (
              <>
                <BackdropModal onClick={() => setStatusFilterVisible(false)} />
                <div className={styles.filterBlock}>
                  <button
                    onClick={() => {
                      setStatusFilter(null);
                      setStatusFilterVisible(false);
                    }}
                  >
                    <span className="font14w600">Все</span>
                    {statusFilter === null && <Check color={tgTheme.accent} size={18} />}
                  </button>

                  {Object.entries(STATUS_MAP).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setStatusFilter(key);
                        setStatusFilterVisible(false);
                      }}
                    >
                      <span className="font14w600">{value}</span>
                      {key === statusFilter && (
                        <Check color={tgTheme.accent} size={18} />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
          <div className={styles.empty}>
            {statusFilter ? 'Нет записей с таким статусом' : 'Записей ТО пока нет'}
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => {
              const image = item.images?.[0];
              return (
                <div
                  className={styles.card}
                  key={item.id}
                >
                  {image ? (
                    <img
                      src={getImageUrl(image.path || image.image_url)}
                      alt={item.name}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <Wrench size={24} color={tgTheme.textSecondary} />
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{item.name}</span>

                    {item.status && (
                      <div className={styles.tagNeutralDot}>
                        <span
                          className="font12w500"
                        >
                          {STATUS_MAP[item.status] || item.status}
                        </span>
                      </div>
                    )}

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
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => navigate(`/cars/${carId}/services/${item.id}/edit`)}
                    >
                      <Pencil size={16} color={tgTheme.white} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModalId(item.id);
                      }}
                      disabled={deletingId === item.id}
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
          Вы уверены, что хотите удалить эту запись ТО?
        </span>
      </ModalComponent>
    </AppLayout>
  );
}
