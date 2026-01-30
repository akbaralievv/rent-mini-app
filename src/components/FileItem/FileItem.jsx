/* eslint-disable react-hooks/static-components */
import React from 'react'
import { getFileIcon, tgTheme } from '../../common/commonStyle'

export default function FileItem({ name }) {
  const Icon = getFileIcon(name)

  return (
    <Icon size={28} color={tgTheme.white} strokeWidth={1.5} />
  )
}
