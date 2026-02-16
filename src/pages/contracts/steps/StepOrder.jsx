import { tgTheme } from '../../../common/commonStyle';
import { useGetOrdersByCarQuery } from '../../../redux/services/orders';
import PreviewContract from '../components/PreviewContract/PreviewContract';

export default function StepOrder({ state, setState }) {
  const carNumber = state.car?.car_number || state.car?.number;
  const { data, isLoading, isError } = useGetOrdersByCarQuery(carNumber, {
    skip: !carNumber,
  });

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
          ...((state.order?.id)
            ? [{
              key: 'Выбран Заказ',
              value: `${state.order.start_date} → ${state.order.end_date} • ${state.order.customer_name}`
            }]
            : [])
        ]}
      />
      <h2>📦 Выберите заказ</h2>
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
                  <span style={{ color: state.order?.id == o.id ? tgTheme.white : tgTheme.textSecondary }}>
                    {o.start_date} → {o.end_date} • {o.customer_name}
                  </span>
                </div>
              ))}
            </div>
      }
    </div>
  );
}
