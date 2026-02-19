import styles from './ContractSteps.module.css';

export default function StepPreview({ state, onSave, loading }) {
  const rows = [
    {
      key: 'Шаблон',
      value: state.template?.name || '-',
    },
    {
      key: 'Автомобиль',
      value: `${state.car?.car_name || state.car?.name || '-'} - ${state.car?.car_number || state.car?.number || '-'}`,
    },
    {
      key: 'Заказ',
      value: state.order
        ? `${state.order.start_date} -> ${state.order.end_date} • ${state.order.customer_name}`
        : '-',
    },
    {
      key: '1-й водитель',
      value: state.drivers?.driver1?.name || '-',
    },
    {
      key: '2-й водитель',
      value: state.drivers?.driver2?.name || '-',
    },
  ];

  return (
    <div className={styles.stepCard}>
      <h2 className={`font18w600 ${styles.stepTitle}`}>Проверка перед сохранением</h2>

      <div className={styles.summary}>
        {rows.map((row) => (
          <div key={row.key} className={styles.summaryRow}>
            <span className={styles.summaryKey}>{row.key}</span>
            <span className={styles.summaryValue}>{row.value}</span>
          </div>
        ))}
      </div>

      <button type="button" className={styles.saveBtn} onClick={onSave} disabled={loading}>
        <span className="font14w600">{loading ? 'Сохранение...' : 'Сохранить договор'}</span>
      </button>
    </div>
  );
}
