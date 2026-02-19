import PreviewContract from '../components/PreviewContract/PreviewContract';
import styles from './ContractSteps.module.css';

const FIELDS = [
  ['name', 'Имя'],
  ['license_no', 'License No'],
  ['license_type', 'Тип прав'],
  ['license_expire', 'Срок действия прав'],
  ['license_issued_at', 'Дата выдачи прав'],
  ['passport_no', 'PP / ID No'],
  ['passport_type', 'Тип паспорта'],
  ['passport_expire', 'Срок действия паспорта'],
  ['passport_issued_at', 'Дата выдачи паспорта'],
  ['nationality', 'Гражданство'],
  ['birth_date', 'Дата рождения'],
  ['mode_of_payment', 'Способ оплаты'],
  ['doc_held', 'Документ выдан'],
];

export default function StepDrivers({ state, setState }) {
  const updateField = (driverKey, fieldKey, value) => {
    setState((prev) => ({
      ...prev,
      drivers: {
        ...prev.drivers,
        [driverKey]: {
          ...prev.drivers[driverKey],
          [fieldKey]: value,
        },
      },
    }));
  };

  return (
    <div className={styles.stepStack}>
      <div className={styles.stepCard}>
        <PreviewContract
          visible={Boolean(state.template)}
          list={[
            {
              key: 'Выбран шаблон',
              value: state.template?.name || '',
            },
            {
              key: 'Выбран авто',
              value: state.car?.car_name || state.car?.name || '',
            },
            {
              key: 'Выбран заказ',
              value: state.order
                ? `${state.order.start_date} -> ${state.order.end_date} • ${state.order.customer_name}`
                : '',
            },
          ]}
        />
      </div>

      {['driver1', 'driver2'].map((driver, index) => (
        <section key={driver} className={styles.stepCard}>
          <h2 className={`font18w600 ${styles.stepTitle}`}>{index + 1}-й водитель</h2>

          <div className={styles.grid}>
            {FIELDS.map(([fieldKey, label]) => (
              <label key={fieldKey} className={styles.field}>
                <span className={styles.fieldLabel}>{label}</span>
                <input
                  className={styles.input}
                  value={state.drivers?.[driver]?.[fieldKey] || ''}
                  onChange={(event) => updateField(driver, fieldKey, event.target.value)}
                  placeholder={label}
                />
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
