import PreviewContract from "../components/PreviewContract/PreviewContract";

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
  console.log(state)
  return (
    <div className="card">
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
          },
          {
            key: '1-й водитель',
            value: state.drivers.driver1?.name || 'не найдено'
          },
          {
            key: '2-й водитель',
            value: state.drivers.driver2?.name || 'не найдено'
          }
        ]}
      />
      <h2>💰 Подробности о сборах</h2>

      <div className="form-grid">
        {FEES.map(([key, label]) => (
          <input
            key={key}
            className="input"
            placeholder={label}
            value={state.fees[key] || ''}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                fees: {
                  ...s.fees,
                  [key]: e.target.value,
                },
              }))
            }
          />
        ))}
      </div>
    </div>
  );
}

