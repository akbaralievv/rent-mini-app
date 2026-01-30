import React from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import ButtonSection from '../../../components/ButtonSection/ButtonSection';
import { useGetTagsQuery } from '../../../redux/services/tagsAction';

export default function TagsPage() {
  const navigate = useNavigate();
  const { data: tags } = useGetTagsQuery;
  return (
    <AppLayout title={'Теги'} onBack={() => navigate(-1)}>
      <ButtonSection
        buttons={[]}
      />
    </AppLayout>
  )
}
