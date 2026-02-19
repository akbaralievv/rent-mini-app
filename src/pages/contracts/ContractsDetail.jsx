import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Download, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import {
  useGetContractQuery,
  useDeleteContractMutation,
} from '../../redux/services/contracts';
import { getErrorMessage } from '../../utils';
import { tgTheme } from '../../common/commonStyle';
import styles from './ContractsDetail.module.css';

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;

const hasAnyValue = (obj) =>
  obj &&
  typeof obj === 'object' &&
  Object.values(obj).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== '-' &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'object' && Object.keys(value).length === 0),
  );

const sanitizeFileName = (name) =>
  String(name || 'contract.pdf')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '_');

const extractFileName = (disposition, fallback) => {
  if (!disposition) return sanitizeFileName(fallback);

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return sanitizeFileName(decodeURIComponent(utfMatch[1]));
    } catch {
      return sanitizeFileName(fallback);
    }
  }

  const simpleMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (simpleMatch?.[1]) {
    return sanitizeFileName(simpleMatch[1]);
  }

  return sanitizeFileName(fallback);
};

const DRIVER_FIELDS = {
  name: 'Имя',
  license_no: 'License No',
  license_type: 'Тип водительских прав',
  license_expire: 'Срок действия прав',
  license_issued_at: 'Дата выдачи прав',
  passport_no: 'PP / ID No',
  passport_type: 'Тип паспорта / ID',
  passport_expire: 'Срок действия паспорта / ID',
  passport_issued_at: 'Дата выдачи паспорта / ID',
  nationality: 'Гражданство',
  birth_date: 'Дата рождения',
  mode_of_payment: 'Способ оплаты',
  doc_held: 'Документ выдан',
};

const FEES_FIELDS = {
  base_rental: 'Base Rental (Dly / Wly / Mtly)',
  salik: 'Salik',
  fines: 'Fines',
  others: 'Others',
  grand_total: 'Grand Total',
  advance: 'Advance',
  deposit: 'Deposit',
  balance_due: 'Balance Due',
};

function InfoSection({ title, data, labels }) {
  if (!data || typeof data !== 'object') return null;
  if (!hasAnyValue(data)) return null;

  return (
    <section className={styles.card}>
      <h3 className="font16w600">{title}</h3>
      <div className={styles.rows}>
        {Object.entries(labels).map(([key, label]) => {
          const value = data[key];
          if (value === null || value === undefined || value === '' || value === '-') {
            return null;
          }

          return (
            <div key={key} className={styles.row}>
              <span className={styles.rowLabel}>{label}</span>
              <span className={styles.rowValue}>{String(value)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleted, setDeleted] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const { data, isLoading, isError } = useGetContractQuery(id, {
    skip: deleted,
  });

  const [deleteContract, { isLoading: deleting }] = useDeleteContractMutation();
  const contract = data?.data;

  const handleDelete = async () => {
    if (!window.confirm('Удалить договор?')) return;

    try {
      await deleteContract(id).unwrap();
      setDeleted(true);
      navigate('/contracts');
    } catch (error) {
      alert(`Ошибка удаления: ${getErrorMessage(error, 'Не удалось удалить договор')}`);
    }
  };

  const handleDownloadPdf = async () => {
    if (!contract?.id && !id) return;

    setDownloadingPdf(true);
    try {
      const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      const response = await fetch(`${API_BASE}/contracts/${contract?.id ?? id}/pdf`, {
        method: 'GET',
        headers: tgUserId
          ? {
              'X-Telegram-User': String(tgUserId),
            }
          : {},
      });

      if (!response.ok) {
        let message = 'Не удалось скачать PDF договора';
        try {
          const payload = await response.json();
          if (payload?.message) {
            message = payload.message;
          }
        } catch {
          // Ignore parse errors for non-JSON response body.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const disposition =
        response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
      const baseTitle = String(contract?.doc_name || `contract-${id}`).replace(/\.[^.]+$/, '');
      const fallbackName = `${sanitizeFileName(baseTitle)}.pdf`;
      const fileName = extractFileName(disposition, fallbackName);

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      alert(`Ошибка скачивания: ${getErrorMessage(error, 'Не удалось скачать PDF')}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Договор">
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !contract) {
    return (
      <AppLayout title="Договор">
        <div className={styles.stateError}>Ошибка загрузки договора</div>
      </AppLayout>
    );
  }

  const metadata = contract.metadata || {};
  const drivers = metadata.drivers && typeof metadata.drivers === 'object' ? metadata.drivers : {};
  const fees = metadata.fees && typeof metadata.fees === 'object' ? metadata.fees : {};
  const period = metadata.start_date && metadata.end_date
    ? `${metadata.start_date} -> ${metadata.end_date}`
    : '-';

  return (
    <AppLayout title={`Договор №${metadata.doc_number || contract.id}`} onBack={() => navigate(-1)}>
      <div className={styles.page}>
        <section className={styles.card}>
          <div className={styles.mainHeader}>
            <div>
              <h2 className="font18w600">{contract.doc_name || `Договор #${contract.id}`}</h2>
              <p className={styles.subTitle}>
                {contract.car_name || '-'} • {contract.car_number || '-'}
              </p>
            </div>
            <span className={styles.badge}>ID {contract.id}</span>
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Номер</span>
              <span className={styles.rowValue}>{metadata.doc_number || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Период</span>
              <span className={styles.rowValue}>{period}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Клиент</span>
              <span className={styles.rowValue}>{contract.customer_name || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Шаблон</span>
              <span className={styles.rowValue}>{contract.template_name || '-'}</span>
            </div>
          </div>
        </section>

        <InfoSection title="1-й водитель" data={drivers.driver1 || {}} labels={DRIVER_FIELDS} />
        <InfoSection title="2-й водитель" data={drivers.driver2 || {}} labels={DRIVER_FIELDS} />
        <InfoSection title="Подробности по сборам" data={fees} labels={FEES_FIELDS} />

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={handleDownloadPdf} disabled={downloadingPdf}>
            <Download size={16} color={tgTheme.text} />
            <span className="font14w600">{downloadingPdf ? 'Скачивание...' : 'Скачать PDF'}</span>
          </button>

          <button className={styles.secondaryBtn} onClick={() => navigate(`/contracts/${id}/edit`)}>
            <Pencil size={16} color={tgTheme.text} />
            <span className="font14w600">Редактировать</span>
          </button>

          <button className={styles.dangerBtn} disabled={deleting} onClick={handleDelete}>
            <Trash2 size={16} color={tgTheme.text} />
            <span className="font14w600">{deleting ? 'Удаление...' : 'Удалить'}</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
