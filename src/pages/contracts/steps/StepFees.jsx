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
    <div className="card">
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

