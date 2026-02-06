import React from 'react'
import styles from './CarDetailPage.module.css'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'

export default function CarDetailPage() {
  const navigate = useNavigate();
  return (
    <AppLayout title={'Детализация'} onBack={() => navigate(-1)}>

    </AppLayout>
  )
}
