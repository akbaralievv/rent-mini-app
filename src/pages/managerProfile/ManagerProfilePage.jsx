import React, { useState, useEffect, useMemo } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useNavigate } from 'react-router-dom'
import styles from './ManagerProfilePage.module.css'
import { tgTheme } from '../../common/commonStyle'
import { useAuth } from '../../auth/useAuth'
import { useGetManagersQuery, useUpdateManagerMutation } from '../../redux/services/managersApi'
import LoaderCustom from '../../components/LoaderCustom/LoaderCustom'

export default function ManagerProfilePage() {
  const navigate = useNavigate()
  const { userId } = useAuth()

  const { data, isLoading } = useGetManagersQuery({ per_page: 50, page: 1 })
  const [updateManager, { isLoading: isSaving }] = useUpdateManagerMutation()

  const manager = data?.data?.find((m) => String(m.user_id) === String(userId)) || null

  const [name, setName] = useState('')

  useEffect(() => {
    if (manager) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(manager.name || '')
    }
  }, [manager])

  const hasChanges = useMemo(() => {
    if (!manager) return false
    return (
      name !== (manager.name || '')
    )
  }, [manager, name])

  const handleSave = async () => {
    if (!manager || !hasChanges) return

    const body = {}
    if (name !== (manager.name || '')) body.name = name

    try {
      await updateManager({ userId: manager.user_id, body }).unwrap()
    } catch (err) {
      alert('Ошибка при сохранении')
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Профиль" onBack={() => navigate(-1)}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoaderCustom />
        </div>
      </AppLayout>
    )
  }

  if (!manager) {
    return (
      <AppLayout title="Профиль" onBack={() => navigate(-1)}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Менеджер не найден
          </span>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Профиль" onBack={() => navigate(-1)}>
      <div className={styles.main}>
        <div className={styles.field}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            User ID
          </span>
          <input
            className={styles.input}
            value={manager.user_id}
            disabled
          />
        </div>

        <div className={styles.field}>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            никнейм
          </span>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя"
          />
        </div>

        <div className={styles.footer}>
          <button
            className={styles.secondaryBtn}
            onClick={() => navigate(-1)}
          >
            <span className="font14w600">Отмена</span>
          </button>

          <button
            className={styles.primaryBtn}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving && <LoaderCustom size={16} />}
            <span className="font14w600">{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
