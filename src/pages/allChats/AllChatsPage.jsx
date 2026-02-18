import React from 'react'
import AppLayout from '../../layouts/AppLayout'
import ButtonSection from '../../components/ButtonSection/ButtonSection'
import { useNavigate } from 'react-router-dom'
import { WhatsappLogo } from 'phosphor-react';
import { tgTheme } from '../../common/commonStyle';
import { MessageCircleMore, MessageSquare, Zap } from 'lucide-react';

export default function AllChatsPage() {
  const navigate = useNavigate();
  return (
    <AppLayout title={'Все чаты'} onBack={() => navigate(-1)}>
      <ButtonSection
        title='Выберите нужные чаты'
        buttons={[
          {
            icon: <MessageCircleMore size={20} color={tgTheme.white} />,
            text: 'Чаты сайт',
            onClick: () => navigate('/all-chats/site'),
          },
          {
            icon: <WhatsappLogo size={20} color={tgTheme.white} />,
            text: 'Чаты Whatsapp',
            onClick: () => navigate('/all-chats/wa'),
          },
        ]}
      />
      <div className='miniBlock'>
        <span className='font12w500' style={{ color: tgTheme.textSecondary }}>
          Центр управления коммуникацией.
          Перейдите в нужный раздел для работы с чатами.
        </span>
      </div>
      <div className='mt30' />
      <ButtonSection
        title='Инструменты'
        buttons={[
          {
            icon: <Zap size={20} color={tgTheme.white} />,
            text: 'WA шаблоны (быстрые ответы)',
            onClick: () => navigate('/all-chats/templates-wa'),
          },
        ]}
      />

    </AppLayout>
  )
}
