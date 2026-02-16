export const CHARACTERISTICS = [
  { key: 'car_number', label: 'Номер авто', type: 'input' },
  { key: 'car_vin', label: 'VIN номер', type: 'input' },
  { key: 'car_year', label: 'Год выпуска', type: 'input' },
  { key: 'car_probeg', label: 'Пробег', type: 'input' },
  { key: 'car_people', label: 'Количество мест', type: 'input' },
  { key: 'car_doors', label: 'Количество дверей', type: 'input' },
  { key: 'car_color_s', label: 'Цвет салона', type: 'select' },
  { key: 'car_color_v', label: 'Цвет кузова', type: 'select' },
  { key: 'car_engine', label: 'Двигатель', type: 'input' },
  { key: 'car_privod', label: 'Привод', type: 'input' },
  { key: 'car_transmission', label: 'Трансмиссия', type: 'input' },
  { key: 'car_power', label: 'Мощность (л.с.)', type: 'input' },
  { key: 'mileage_limit', label: 'Лимит пробега', type: 'input' },
  { key: 'prepay', label: 'Предоплата', type: 'select' },
  { key: 'checked', label: 'Проверена', type: 'boolean' },
  { key: 'to_b2b', label: 'Продажи B2B', type: 'boolean' },
  { key: 'b2c_status', label: 'Продажи B2C', type: 'boolean' },
  { key: 'car_class', label: 'Класс авто', type: 'select' },
  { key: 'reg_date', label: 'Дата постановки на учет', type: 'date' },
  { key: 'license_date', label: 'Дата продления лицензии', type: 'date' },
]

export const selectCharactericticsItem = [
  {
    key: 'car_color_s',
    options: [
      { key: 'Белый', value: 'Белый' },
      { key: 'Черный', value: 'Черный', },
      { key: 'Синий', value: 'Синий', },
      { key: 'Красный', value: 'Красный', },
      { key: 'Желтый', value: 'Желтый', },
      { key: 'Зеленый', value: 'Зеленый', },
      { key: 'Серый', value: 'Серый', },
    ]
  },
  {
    key: 'car_color_v',
    options: [
      { key: 'Белый', value: 'Белый' },
      { key: 'Черный', value: 'Черный', },
      { key: 'Синий', value: 'Синий', },
      { key: 'Красный', value: 'Красный', },
      { key: 'Желтый', value: 'Желтый', },
      { key: 'Зеленый', value: 'Зеленый', },
      { key: 'Серый', value: 'Серый', },
    ]
  },
  {
    key: 'car_class',
    options: [
      { value: 'Эконом', key: 'econom' },
      { value: 'Стандарт', key: 'standard' },
      { value: 'Бизнес', key: 'business' },
      { value: 'Спорт', key: 'sport' },
      { value: 'Люкс', key: 'luxury' },
      { value: 'Электро', key: 'electric' },
    ]
  },
  {
    key: 'prepay',
    options: [
      { value: 'Нет', key: 'no' },
      { value: 'Частичная', key: 'partial' },
      { value: 'Полная', key: 'full' },
    ]
  },
]