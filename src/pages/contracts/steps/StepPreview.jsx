export default function StepPreview({ state, onSave, loading }) {
  return (
    <div className="card">
      <h2>📄 Предпросмотр договора</h2>

      <div className="preview-row">
        <div className="preview-label">Шаблон:</div>
        <div className="preview-value">{state.template?.name || '—'}</div>
      </div>

      <div className="preview-row">
        <div className="preview-label">Автомобиль:</div>
        <div className="preview-value">{state.car?.car_name || state.car?.name} - {state.car.car_number || state.car.number}</div>
      </div>

      <div className="preview-row">
        <div className="preview-label">Заказ:</div>
        <div className="preview-value">
          { state.order.start_date } → {state.order.end_date} • {state.order.customer_name}
        </div>
      </div>

      <div className="section-divider" />

      <button onClick={onSave} className="primary" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}
