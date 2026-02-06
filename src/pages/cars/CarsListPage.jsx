import React from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import { useGetCarsQuery } from '../../redux/services/cars'
import styles from './CarsListPage.module.css'
import { Users, Fuel, Settings, Car, Edit2, ClipboardEditIcon } from 'lucide-react'
import { STATUS_MAPPING, tgTheme } from '../../common/commonStyle'

export default function CarsListPage() {
  const { data: cars = { cars: [] }, isLoading, isError } = useGetCarsQuery()
  const navigate = useNavigate()

  return (
    <AppLayout title="Список авто" onBack={() => navigate(-1)}>
      <div className={styles.list}>
        {isLoading && <div className={styles.status}>Загрузка...</div>}
        {isError && <div className={styles.status}>Ошибка загрузки</div>}

        {cars.cars.map((car) => (
          <div
            key={car.id}
            className={styles.item}
            onClick={() => navigate(`/cars/${car.id}`)}
          >
            {/* верх */}
            <div className={styles.top}>
              <div className={styles.image}>
                {
                  car.car_images?.[0] ? <img
                    src={car.car_images?.[0]}
                    alt={car.car_name}
                  />
                    : <Car />
                }

              </div>

              <div className={styles.info}>
                <div>
                  <div>
                    <span className='font16w500'>
                      {car.car_name} · {car.car_year}
                    </span>
                  </div>

                  <div className={styles.meta}>
                    <span className='font12w500' style={{ color: tgTheme.textSecondary }}>{car.car_class} / {car.car_color_s}</span>
                  </div>
                </div>

                <div className={styles.features}>
                  <div className={styles.feature}>
                    <Users size={14} color={tgTheme.textSecondary} />
                    <span className='font12w400' style={{ color: tgTheme.textSecondary }}>{car.car_people}</span>
                  </div>
                  <div className={styles.feature}>
                    <Settings size={14} color={tgTheme.textSecondary} />
                    <span className='font12w400' style={{ color: tgTheme.textSecondary }}>{car.car_transmission}</span>
                  </div>
                  <div className={styles.feature}>
                    <Fuel size={14} color={tgTheme.textSecondary} />
                    <span className='font12w400' style={{ color: tgTheme.textSecondary }}>{car.car_power}</span>
                  </div>
                </div>

              </div>
            </div>

            <div className={styles.bottom}>
              <div />
              <div
                className={styles.tagNeutralDot}
              >
                <span className="font12w500" style={{ color: tgTheme.text }}>{STATUS_MAPPING[car.status]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
