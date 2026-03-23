import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../../layouts/AppLayout'
import { tgTheme } from '../../../../common/commonStyle'
import { getErrorMessage } from '../../../../utils'
import {
  useGetContractsByOrderQuery,
  useDeleteContractMutation,
} from '../../../../redux/services/contracts'
import {
  Plus,
  Trash2,
  FileText,
  Download,
  ChevronRight,
} from 'lucide-react'
import ModalComponent from '../../../../components/ModalComponent/ModalComponent'
import styles from './OrderContractsPage.module.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('ru-RU')
}

export default function OrderContractsPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()

  const { data, isLoading, isError } = useGetContractsByOrderQuery(orderId)
  const [deleteContract] = useDeleteContractMutation()

  const contracts = Array.isArray(data) ? data : data?.data ?? []

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const handleDownloadPdf = (contractId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    window.open(`${apiUrl}/api/contracts/${contractId}/pdf`, '_blank')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteContract(deleteId).unwrap()
      setDeleteModalVisible(false)
      setDeleteId(null)
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err, 'Не удалось удалить договор')}`)
    }
  }

  return (
    <AppLayout title="Договоры" onBack={() => navigate(-1)}>
      {isLoading && (
        <div className={styles.state}>Загрузка...</div>
      )}

      {isError && (
        <div className={styles.stateError}>Ошибка загрузки</div>
      )}

      {!isLoading && !isError && (
        <div className={styles.pageWrapper}>
          <button
            className={styles.addButton}
            onClick={() => navigate('/contracts/new')}
          >
            <Plus size={18} color={tgTheme.accent} />
            <span className="font14w500" style={{ color: tgTheme.accent }}>
              Добавить договор
            </span>
          </button>

          {contracts.length === 0 && (
            <div className={styles.empty}>
              <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
                Договоров по этому заказу нет
              </span>
            </div>
          )}

          {contracts.map((contract) => (
            <div key={contract.id} className={styles.contractCard}>
              <div
                className={styles.contractMain}
                onClick={() => navigate(`/contracts/${contract.id}`)}
              >
                <div className={styles.contractLeft}>
                  <FileText size={20} color={tgTheme.textSecondary} />
                  <div className={styles.contractInfo}>
                    <span className="font14w600">
                      {contract.doc_name || 'Договор'}
                    </span>
                    {contract.template_name && (
                      <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
                        {contract.template_name}
                      </span>
                    )}
                    <span className="font12w400" style={{ color: tgTheme.textSecondary }}>
                      {formatDate(contract.created_at)}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} color={tgTheme.textSecondary} />
              </div>

              <div className={styles.contractActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleDownloadPdf(contract.id)}
                >
                  <Download size={15} color={tgTheme.accent} />
                  <span className="font12w500" style={{ color: tgTheme.accent }}>
                    PDF
                  </span>
                </button>

                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    setDeleteId(contract.id)
                    setDeleteModalVisible(true)
                  }}
                >
                  <Trash2 size={15} color={tgTheme.danger} />
                  <span className="font12w500" style={{ color: tgTheme.danger }}>
                    Удалить
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalComponent
        title="Удалить договор?"
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        textButton="Удалить"
        onSave={handleDelete}
      >
        <div>
          <span className="font14w500" style={{ color: tgTheme.textSecondary }}>
            Договор будет удалён без возможности восстановления.
          </span>
        </div>
      </ModalComponent>
    </AppLayout>
  )
}
