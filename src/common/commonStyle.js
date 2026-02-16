import { File, FileDoc, FileImage, FileJpg, FilePdf, FilePng, FileText, FileXls, FileZip } from "phosphor-react";

export const tgTheme = {

  bg: '#191e23',
  card: '#1c2228',
  card2: '#202830',
  border: '#2b323a',

  text: '#fefeff',
  textSecondary: '#6b7e96',
  muted: '#545158',

  accent: '#4689d3',
  danger: '#d47062',
  warning: '#fbbf24',
  success: '#10b981',

  btnActive: '#5c6874',
  itemButtonBg: '#212a33',
  itemButtonBgHover: '#2a3440',

  white: '#ffffff',
  muted2: '#666f7a'
};

export const fileIconMap = {
  pdf: FilePdf,
  doc: FileDoc,
  docx: FileDoc,
  xls: FileXls,
  xlsx: FileXls,
  txt: FileText,
  jpg: FileJpg,
  jpeg: FileJpg,
  png: FilePng,
  gif: FileImage,
  zip: FileZip,
  rar: FileZip,
}

export function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  return fileIconMap[ext] || File
}


export const STATUS_MAPPING = {
  'Ready for rent': 'Готов к аренде',
  Booked: 'Забронирован',
  Delivery: 'Доставка',
  Rented: 'Арендован',
  Fence: 'Подменное авто',
  'In company': 'В компании',
  Service: 'Сервис',
  ended: 'Завершен',
  'Wait confirm': 'Ожидание подтверждения',
}

export const STATUS_EMOJI = {
  free: '🟢',
  'Wait confirm': '⏳',
  'Ready for rent': '🟢',
  Booked: '📘',
  Delivery: '🚚',
  Rented: '🚗',
  Fence: '🚧',
  'In company': '🏢',
  Service: '🔧',
}

export const RENT_STATUS = {
  'Wait confirm': '🚗 Активный',
  Booked: '🚗 Активный',
  Delivery: '🚗 Активный',
  Rented: '🚗 Активный',
  Fence: '🚗 Активный',
}
