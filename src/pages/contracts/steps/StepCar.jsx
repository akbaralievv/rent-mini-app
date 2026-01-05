import { useGetCarsQuery } from '../../../redux/services/cars';

export default function StepCar({ state, setState }) {
  const { data, isLoading, isError } = useGetCarsQuery();

  return (
    <div className="card">
      <h2>🚗 Выберите автомобиль</h2>
      {state.template && (
        <div className="step-selected">
          Выбран шаблон: <b>{state.template.name}</b>
          {(state.car?.car_name || state.car?.name) && (
            <>
              <br />
              Выбран авто: <b>{state.car?.car_name || state.car?.name}</b>
            </>
          )}
        </div>
      )}

      {isLoading ? <div className="loader-wrap">
        <div className="loader" />
        </div>: isError ? <p className="error">Ошибка загрузки автомобилей</p> :
        data?.cars?.length === 0 ? <p className="hint">Нет доступных автомобилей</p> :
        <div className="select-list">
          {data?.cars?.map((car) => (
            <div
              key={car.car_number}
              className={`select-card ${(state.car?.car_number || state.car?.number) === car.car_number ? 'active' : ''}`}
              onClick={() => setState((s) => ({
                ...s,
                car: car,
                order: null,
              }))}>
              {car.car_name} • {car.car_number} {car.car_color_v}
            </div>
          ))}
        </div>
      }
    </div>
  );
}
