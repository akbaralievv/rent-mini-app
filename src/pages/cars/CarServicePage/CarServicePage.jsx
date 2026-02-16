import React from 'react'
import styles from './CarServicePage.module.css'
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';

export default function CarServicePage() {
  const navigate = useNavigate();

  return (
    <AppLayout title={'ТО авто'} onBack={() => navigate(-1)}>
      <div className={styles.main}>

      </div>
    </AppLayout>
  )
}
