import PreviewContract from '../components/PreviewContract/PreviewContract';
import styles from './ContractSteps.module.css';

const FEES = [
  ['base_rental', 'Base Rental'],
  ['salik', 'Salik'],
  ['fines', 'Fines'],
  ['others', 'Others'],
  ['grand_total', 'Grand Total'],
  ['advance', 'Advance'],
  ['deposit', 'Deposit'],
  ['balance_due', 'Balance'],
];

export default function StepFees({ state, setState }) {
  return (
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
          {
            key: '1-й водитель',
            value: state.drivers?.driver1?.name || '-',
          },
          {
            key: '2-й водитель',
            value: state.drivers?.driver2?.name || '-',
          },
        ]}
      />

      <h2 className={`font18w600 ${styles.stepTitle}`}>Подробности о сборах</h2>

      <div className={styles.grid}>
        {FEES.map(([fieldKey, label]) => (
          <label key={fieldKey} className={styles.field}>
            <span className={styles.fieldLabel}>{label}</span>
            <input
              className={styles.input}
              placeholder={label}
              value={state.fees?.[fieldKey] || ''}
              onChange={(event) =>
                setState((prev) => ({
                  ...prev,
                  fees: {
                    ...prev.fees,
                    [fieldKey]: event.target.value,
                  },
                }))
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}
