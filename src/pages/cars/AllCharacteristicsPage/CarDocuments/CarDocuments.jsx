import React from 'react'
import AppLayout from '../../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'

export default function CarDocuments() {
  const navigate = useNavigate();
  // const { id } = useParams();

  return (
    <AppLayout title={'Документы'} onBack={() => navigate(-1)}>
      
    </AppLayout>
  )
}
