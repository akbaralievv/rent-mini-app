import React, { useState } from 'react'
import AppLayout from '../../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import { useGetSiteChatsQuery } from '../../../redux/services/siteChatsApi'
import { CircleUser } from 'lucide-react'
import { tgTheme } from '../../../common/commonStyle'
import styles from './SiteChatsPage.module.css'
import LoaderCustom from '../../../components/LoaderCustom/LoaderCustom'

export default function SiteChatsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useGetSiteChatsQuery(page)

  const chats = data?.data || []
  const currentPage = data?.current_page || 1
  const lastPage = data?.last_page || 1

  const formatDate = (dateStr) => {
    try {
      const dt = new Date(dateStr)
      return dt.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  if (isLoading) {
    return (
      <AppLayout title={'Чаты сайт'} onBack={() => navigate('/all-chats')}>
        <div className={styles.loader}>
          <LoaderCustom size={24} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={'Чаты сайт'} onBack={() => navigate('/all-chats')}>
      <div className={styles.list}>
        {chats.length === 0 && (
          <div className={`${styles.emptyText} font14w400`}>Чатов пока нет</div>
        )}

        {chats.map(chat => (
          <div
            key={chat.id}
            className={styles.chatItem}
            onClick={() => navigate(`/all-chats/site/${chat.id}`)}
          >
            <CircleUser color={tgTheme.white} size={22} />
            <div className={styles.chatContent}>
              <span className={`${styles.chatTitle} font14w500`}>
                {`Чат №${chat.id} ${chat.title||''}`}
              </span>
              {chat.last_message && (
                <span className={`${styles.chatLastMessage} font12w400`}>
                  {chat.last_message.body}
                </span>
              )}
            </div>
            <span className={`${styles.chatDate} font12w400`}>
              {formatDate(chat.created_at)}
            </span>
          </div>
        ))}

        {isFetching && (
          <div className={styles.loader}>
            <LoaderCustom size={24} />
          </div>
        )}

        {lastPage > 1 && (
          <div className={styles.pagination}>
            <button
              className={`${styles.pageBtn} font14w500`}
              disabled={currentPage <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Назад
            </button>
            <span className='font14w400' style={{ color: tgTheme.textSecondary }}>
              {currentPage} / {lastPage}
            </span>
            <button
              className={`${styles.pageBtn} font14w500`}
              disabled={currentPage >= lastPage}
              onClick={() => setPage(p => p + 1)}
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
