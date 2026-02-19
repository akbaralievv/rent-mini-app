import { useGetOrdersByCarQuery } from '../../../redux/services/orders';
import PreviewContract from '../components/PreviewContract/PreviewContract';
import styles from './ContractSteps.module.css';

export default function StepOrder({ state, setState }) {
  const carNumber = state.car?.car_number || state.car?.number;
  const { data, isLoading, isError } = useGetOrdersByCarQuery(carNumber, {
    skip: !carNumber,
  });

  const orders = data?.orders ?? [];

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
          ...(state.order?.id
            ? [
                {
                  key: 'Выбран заказ',
                  value: `${state.order.start_date} -> ${state.order.end_date} • ${state.order.customer_name}`,
                },
              ]
            : []),
        ]}
      />

      <h2 className={`font18w600 ${styles.stepTitle}`}>Выберите заказ</h2>

      {!carNumber && (
        <p className={styles.stateHint}>Сначала выберите автомобиль</p>
      )}

      {carNumber && isLoading && (
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      )}

      {carNumber && !isLoading && isError && (
        <p className={styles.stateError}>Ошибка загрузки заказов</p>
      )}

      {carNumber && !isLoading && !isError && orders.length === 0 && (
        <p className={styles.stateHint}>Нет доступных заказов для этого автомобиля</p>
      )}

      {carNumber && !isLoading && !isError && orders.length > 0 && (
        <div className={styles.selectList}>
          {orders.map((order) => {
            const isActive = String(state.order?.id) === String(order.id);

            return (
              <button
                key={order.id}
                type="button"
                className={`${styles.selectCard} ${isActive ? styles.selectCardActive : ''}`}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    order,
                  }))
                }
              >
                <div className={styles.selectMain}>
                  <span className={styles.selectTitle}>
                    {order.start_date}
                    {' -> '}
                    {order.end_date}
                  </span>
                  <span className={`${styles.badge} ${styles.badgeMuted}`}>#{order.id}</span>
                </div>
                <span className={styles.selectMeta}>{order.customer_name || '-'}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
