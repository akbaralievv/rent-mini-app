import React, { useMemo, useState, useEffect } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
// import { useGetCarsQuery } from '../../redux/services/cars'
import styles from './CarsListPage.module.css'
import {
  Users,
  Fuel,
  Settings,
  Car,
  ListFilter,
  ChevronDown,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { STATUS_MAPPING, tgTheme } from '../../common/commonStyle'
import BackdropModal from '../../components/BackdropModal/BackdropModal'
import CustomButton from '../../components/CustomButton/CustomButton'
import { useGetCarsQuery } from '../../redux/services/carAction'

const PAGE_SIZE = 5

const cars_class = [
  { id: 0, name: 'Все', key: 'all' },
  { id: 1, name: 'Эконом', key: 'econom' },
  { id: 2, name: 'Стандарт', key: 'standard' },
  { id: 3, name: 'Бизнес', key: 'business' },
  { id: 4, name: 'Спорт', key: 'sport' },
  { id: 5, name: 'Люкс', key: 'luxury' },
  { id: 6, name: 'Электро', key: 'electric' },
]

export default function CarsListPage() {
  const navigate = useNavigate()
  const { data: cars = { cars: [] }, isLoading, isError } = useGetCarsQuery()

  const [filterVisible, setFilterVisible] = useState(false)
  const [key, setKey] = useState('all')
  const [page, setPage] = useState(1)

  const filteredCars = useMemo(() => {
    if (key === 'all') return cars.cars
    return cars.cars.filter((c) => c.car_class === key)
  }, [cars.cars, key])

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [key])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredCars.slice(start, start + PAGE_SIZE)
  }, [filteredCars, page])

  const canPrev = page > 1
  const canNext = page < totalPages

  const changeClass = (carClass) => {
    setKey(carClass.key)
    setFilterVisible(false)
  }

  return (
    <AppLayout title="Список авто" onBack={() => navigate(-1)}>
      <div className={styles.list}>
        {isLoading && <div className={styles.status}>Загрузка...</div>}
        {isError && <div className={styles.status}>Ошибка загрузки</div>}

        <div className={styles.headerFilter}>
          <div className={styles.headerFilter + ' miniBlock'}>
            <span className="font16w600">Класс</span>
            <button onClick={() => setFilterVisible(true)} className={styles.filterBtn}>
              <ListFilter color={tgTheme.textSecondary} size={16} />
              <span className="font13w500">
                {cars_class.find((el) => el.key === key)?.name}
              </span>
              <ChevronDown color={tgTheme.textSecondary} size={16} />
            </button>

            {filterVisible && (
              <>
                <BackdropModal onClick={() => setFilterVisible(false)} />
                <div className={styles.filterBlock}>
                  {cars_class.map((el) => (
                    <button key={el.id} onClick={() => changeClass(el)}>
                      <span className="font14w600">{el.name}</span>
                      {key === el.key && <Check color={tgTheme.accent} size={18} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.headerFilter + ' miniBlock'}>
            <CustomButton
              icon={<Plus color={tgTheme.textSecondary} size={16} />}
              text='Добавить' onClick={() => { }} />
          </div>
        </div>

        {!isLoading && pageData.length === 0 && (
          <div className={styles.status}>
            <span className='font14w500' style={{ color: tgTheme.textSecondary }}>
              Машины не найдены
            </span>
          </div>
        )}

        {pageData.map((car) => (
          <div
            key={car.id}
            className={styles.item}
            onClick={() => navigate('/cars/' + car.car_number)}
          >
            <div className={styles.top}>
              <div className={styles.image}>
                {car.car_images?.[0] ? (
                  <img src={car.car_images[0]} alt={car.car_name} />
                ) : (
                  <Car />
                )}
              </div>

              <div className={styles.info}>
                <div>
                  <span className="font16w500">
                    {car.car_name} · {car.car_year}
                  </span>

                  <div className={styles.meta}>
                    <span
                      className="font12w500"
                      style={{ color: tgTheme.textSecondary }}
                    >
                      {car.car_class} / {car.car_color_s}
                    </span>
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
              <div className={styles.tagNeutralDot}>
                <span className="font12w500">
                  {STATUS_MAPPING[car.status]}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredCars.length > PAGE_SIZE && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              <ChevronLeft color={tgTheme.btnActive} />
            </button>

            <div className={styles.pageInfo}>
              {page} / {totalPages}
            </div>

            <button
              className={styles.pageBtn}
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
            >
              <ChevronRight color={tgTheme.btnActive} />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
