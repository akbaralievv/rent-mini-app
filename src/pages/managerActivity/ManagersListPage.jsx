import React from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../layouts/AppLayout'
import { useGetManagersQuery } from '../../redux/services/managersApi'
import { tgTheme } from '../../common/commonStyle'
import { ChevronRight } from 'lucide-react'
import LoaderCustom from '../../components/LoaderCustom/LoaderCustom'
import styles from './ManagersListPage.module.css'

export default function ManagersListPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetManagersQuery({ per_page: 50, page: 1 })

  const managers = data?.data || []

  return (
    <AppLayout title="Активность менеджеров" onBack={() => navigate(-1)}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoaderCustom />
        </div>
      ) : isError ? (
        <div className={styles.empty}>
          <span className="font14w500" style={{ color: tgTheme.danger }}>Ошибка загрузки</span>
        </div>
      ) : managers.length === 0 ? (
        <div className={styles.empty}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>Менеджеры не найдены</span>
        </div>
      ) : (
        <div className={styles.list}>
          {managers.map((m) => (
            <div
              key={m.user_id}
              className={styles.card}
              onClick={() => navigate(`/managers/${m.user_id}/activity`)}
            >
              <div className={styles.cardInfo}>
                <span className="font14w600">{m.name || 'Без имени'}</span>
                <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
                  {`ID: ${m.user_id}`}
                </span>
              </div>
              <ChevronRight size={18} color={tgTheme.textSecondary} />
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
