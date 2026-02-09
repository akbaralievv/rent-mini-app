import React from 'react'
import styles from './AllCharacteristics.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'

export default function AllCharacteristics() {
  const navigate = useNavigate();
  return (
    <AppLayout title={'Все характеристики'} onBack={() => navigate(-1)}>
      <div className={styles.main}>

      </div>
    </AppLayout>
  )
}
