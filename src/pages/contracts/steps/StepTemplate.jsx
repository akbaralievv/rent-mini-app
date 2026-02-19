import { useGetContractTemplatesQuery } from '../../../redux/services/contractTemplates';
import PreviewContract from '../components/PreviewContract/PreviewContract';
import styles from './ContractSteps.module.css';

export default function StepTemplate({ state, setState }) {
  const { data, isLoading, isError } = useGetContractTemplatesQuery();
  const templates = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className={styles.stepCard}>
      <PreviewContract
        visible={Boolean(state.template)}
        list={[
          {
            key: 'Выбран шаблон',
            value: state.template?.name || '',
          },
        ]}
      />

      <h2 className={`font18w600 ${styles.stepTitle}`}>Выберите шаблон договора</h2>

      {isLoading && (
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      )}

      {!isLoading && isError && (
        <p className={styles.stateError}>Ошибка загрузки шаблонов</p>
      )}

      {!isLoading && !isError && templates.length === 0 && (
        <p className={styles.stateHint}>Нет доступных шаблонов договоров</p>
      )}

      {!isLoading && !isError && templates.length > 0 && (
        <div className={styles.selectList}>
          {templates.map((template) => {
            const isActive = state.template?.id === template.id;

            return (
              <button
                key={template.id}
                type="button"
                className={`${styles.selectCard} ${isActive ? styles.selectCardActive : ''}`}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    template,
                  }))
                }
              >
                <div className={styles.selectMain}>
                  <span className={styles.selectTitle}>{template.name}</span>
                  <span className={`${styles.badge} ${template.is_active ? styles.badgeActive : styles.badgeMuted}`}>
                    {template.is_active ? 'Активный' : 'Неактивный'}
                  </span>
                </div>
                <span className={styles.selectMeta}>ID: {template.id}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
