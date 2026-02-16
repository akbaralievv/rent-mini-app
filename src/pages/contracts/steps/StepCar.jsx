import { tgTheme } from '../../../common/commonStyle';
import { useGetCarsQuery } from '../../../redux/services/cars';
import PreviewContract from '../components/PreviewContract/PreviewContract';

export default function StepCar({ state, setState }) {
  const { data, isLoading, isError } = useGetCarsQuery();

  return (
    <div className="card">
      <PreviewContract
        visible={state.template}
        list={[
          {
            key: 'Выбран шаблон',
            value: state.template.name,
          },
          ...((state.car?.car_name || state.car?.name)
            ? [{
              key: 'Выбран авто',
              value: state.car?.car_name || state.car?.name
            }]
            : [])
        ]}
      />
      <h2>🚗 Выберите автомобиль</h2>

      {isLoading ? <div className="loader-wrap">
        <div className="loader" />
      </div> : isError ? <p className="error">Ошибка загрузки автомобилей</p> :
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
                <span style={{ color: (state.car?.car_number || state.car?.number) === car.car_number ? tgTheme.white : tgTheme.textSecondary }}>
                  {car.car_name} • {car.car_number} {car.car_color_v}
                </span>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
