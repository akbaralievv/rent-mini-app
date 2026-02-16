import PreviewContract from "../components/PreviewContract/PreviewContract";

const FIELDS = [
  ['name', 'Имя'],
  ['license_no', 'License No'],
  ['license_type', 'Тип прав'],
  ['license_expire', 'Срок действия'],
  ['license_issued_at', 'Дата выдачи'],
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
  const update = (driver, key, value) => {
    setState((s) => ({
      ...s,
      drivers: {
        ...s.drivers,
        [driver]: {
          ...s.drivers[driver],
          [key]: value,
        },
      },
    }));
  };

  return (
    <div className="drivers-step">
      <PreviewContract
        visible={state.template}
        list={[
          {
            key: 'Выбран шаблон',
            value: state.template.name,
          },
          {
            key: 'Выбран авто',
            value: state.car.car_name || state.car.name,
          },
          {
            key: 'Выбран Заказ',
            value: `${state.order.start_date} → ${state.order.end_date} • ${state.order.customer_name}`
          }
        ]}
      />
      {['driver1', 'driver2'].map((driver, idx) => (
        <div className="card" key={driver}>
          <h2>👤 {idx + 1}-й водитель</h2>

          <div className="form-grid">
            {FIELDS.map(([key, label]) => (
              <input
                key={key}
                className="input"
                placeholder={label}
                value={state.drivers[driver]?.[key] || ''}
                onChange={(e) => update(driver, key, e.target.value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

