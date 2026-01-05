import { useGetOrdersByCarQuery } from '../../../redux/services/orders';

export default function StepOrder({ state, setState }) {
  const carNumber = state.car?.car_number || state.car?.number;
  const { data, isLoading, isError } = useGetOrdersByCarQuery(carNumber, {
    skip: !carNumber,
  });

  return (
    <div className="card">
      <h2>📦 Выберите заказ</h2>
      {state.template && (
        <div className="step-selected">
          Выбран шаблон: <b>{state.template.name}</b>
          <br/>
          Выбран авто: <b>{state.car.car_name || state.car.name}</b>
          {state.order?.id && (
            <>
              <br />
              Выбран Заказ: <b>{state.order.start_date} → {state.order.end_date} • {state.order.customer_name}</b>
            </>
          )}
        </div>
      )}
      {!carNumber ? <p className="hint">Сначала выберите автомобиль</p> : isLoading ? <div className="loader-wrap">
        <div className="loader" />
        </div> : 
        isError ? <p className="error">Ошибка загрузки заказов</p> :
        data?.orders?.length === 0 ? <p className="hint">Нет доступных заказов для этого автомобиля</p> :
        <div className="select-list">
          {data?.orders?.map((o) => (
            <div
              key={o.id}
              className={`select-card ${state.order?.id == o.id ? 'active' : ''}`}
              onClick={() => setState((s) => ({
                ...s,
                order: o,
              }))}>
              {o.start_date} → {o.end_date} • {o.customer_name}
            </div>
          ))}
        </div>
      }
    </div>
  );
}
