import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilLine, Plus } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import CustomButton from '../../../components/CustomButton/CustomButton';
import { useGetContractTemplatesQuery } from '../../../redux/services/contractTemplates';
import { tgTheme } from '../../../common/commonStyle';
import { getErrorMessage } from '../../../utils';
import styles from './ContractTemplatesPage.module.css';

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
    <AppLayout title="Шаблоны договоров" onBack={() => navigate('/')}>
      <div className={styles.page}>
        <div className={`${styles.headerFilter} miniBlock`}>
          <div className={styles.counter}>
            <span className="font13w500">
              Шаблонов: {templates.length}
            </span>
          </div>
          <CustomButton
            onClick={() => navigate('/contracts/templates/new')}
            icon={<Plus color={tgTheme.textSecondary} size={16} />}
            text='Добавить'
          />
        </div>

        {loading ? (
          <div className="loader-wrap">
            <div className="loader" />
          </div>
        ) : templates.length === 0 ? (
          <div className={styles.status}>
            <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
              Шаблоны пока не созданы
            </span>
          </div>
        ) : (
          <div className={styles.list}>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={styles.item}
                onClick={() => navigate(`/contracts/templates/${template.id}/edit`)}
              >
                <div className={styles.itemTop}>
                  <span className="font16w500">
                    {template.name || `Шаблон #${template.id}`}
                  </span>
                  <PencilLine size={16} color={tgTheme.textSecondary} />
                </div>

                <div className={styles.metaRow}>
                  <span className="font13w500" style={{ color: tgTheme.textSecondary }}>
                    ID: {template.id}
                  </span>
                </div>

                <div className={styles.tags}>
                  <span
                    className={`${styles.badge} ${
                      template.is_active ? styles.badgeActive : styles.badgeMuted
                    }`}
                  >
                    {template.is_active ? 'Активный' : 'Неактивный'}
                  </span>
                  {template.is_system && (
                    <span className={`${styles.badge} ${styles.badgeSystem}`}>
                      Системный
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
