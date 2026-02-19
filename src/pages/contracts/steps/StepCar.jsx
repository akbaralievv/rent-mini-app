import { useGetCarsQuery } from '../../../redux/services/cars';
import PreviewContract from '../components/PreviewContract/PreviewContract';
import styles from './ContractSteps.module.css';

export default function StepCar({ state, setState }) {
  const { data, isLoading, isError } = useGetCarsQuery();
  const cars = data?.cars ?? [];

  const selectedCarNumber = state.car?.car_number || state.car?.number;

  return (
    <div className={styles.stepCard}>
      <PreviewContract
        visible={Boolean(state.template)}
        list={[
          {
            key: 'Выбран шаблон',
            value: state.template?.name || '',
          },
          ...(state.car?.car_name || state.car?.name
            ? [
                {
                  key: 'Выбран авто',
                  value: state.car?.car_name || state.car?.name,
                },
              ]
            : []),
        ]}
      />

      <h2 className={`font18w600 ${styles.stepTitle}`}>Выберите автомобиль</h2>

      {isLoading && (
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      )}

      {!isLoading && isError && (
        <p className={styles.stateError}>Ошибка загрузки автомобилей</p>
      )}

      {!isLoading && !isError && cars.length === 0 && (
        <p className={styles.stateHint}>Нет доступных автомобилей</p>
      )}

      {!isLoading && !isError && cars.length > 0 && (
        <div className={styles.selectList}>
          {cars.map((car) => {
            const isActive = selectedCarNumber === car.car_number;

            return (
              <button
                key={car.car_number}
                type="button"
                className={`${styles.selectCard} ${isActive ? styles.selectCardActive : ''}`}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    car,
                    order: null,
                  }))
                }
              >
                <div className={styles.selectMain}>
                  <span className={styles.selectTitle}>{car.car_name}</span>
                  <span className={`${styles.badge} ${styles.badgeMuted}`}>{car.car_number}</span>
                </div>
                <span className={styles.selectMeta}>
                  {car.car_class || '-'} • {car.car_color_v || car.car_color_s || '-'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
