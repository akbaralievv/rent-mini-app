import React from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'

export default function SiteChatsPage() {
  const navigate = useNavigate();
  return (
    <AppLayout title={'Чаты сайт'} onBack={() => navigate(-1)}>

    </AppLayout>
  )
}
