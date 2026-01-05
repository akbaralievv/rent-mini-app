import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import {
  useGetContractQuery,
  useDeleteContractMutation,
  useSendToTelegramMutation,
} from '../../redux/services/contracts';
import { useState } from 'react';
import { getErrorMessage } from '../../utils';
const hasAnyValue = (obj) =>
  obj &&
  typeof obj === 'object' &&
  Object.values(obj).some(
    (v) =>
      v !== null &&
      v !== undefined &&
      v !== '' &&
      v !== '-' &&
      !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === 'object' && Object.keys(v).length === 0),
  );

function InfoBlock({ title, data, labels }) {
  if (!data || typeof data !== 'object') return null;
  if (!hasAnyValue(data)) return null;

  return (
    <div className="card">
      <h2>{title}</h2>
      {Object.entries(labels).map(([key, label]) => {
        const value = data[key];
        if (value === null || value === undefined || value === '' || value === '-') {
          return null;
        }

        return (
          <p key={key}>
            <b>{label}:</b> {String(value)}
          </p>
        );
      })}
    </div>
  );
}

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

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleted, setDeleted] = useState(false);

  const { data, isLoading, isError } = useGetContractQuery(id, {
    skip: deleted,
  });
  const [deleteContract, { isLoading: deleting }] = useDeleteContractMutation();
  const [sendToTelegram, { isLoading: loadingSendToTelegram }] = useSendToTelegramMutation();

  const contract = data?.data;

  const handleDelete = async () => {
    if (!window.confirm('Удалить договор?')) return;

    try {
      await deleteContract(id).unwrap();
      setDeleted(true);
      navigate('/contracts');
    } catch (e) {
      alert(`Ошибка удаления: ${getErrorMessage(e, 'Не удалось удалить договор')}`);
    }
  };

  const onSendToTelegram = async () => {
    try {
      const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!tgUserId) {
        alert('Не удалось определить Telegram chat id пользователя');
        return;
      }

      await sendToTelegram({ contractId: contract?.id ?? id, chatId: tgUserId }).unwrap();
      alert('📄 Договор отправлен в Telegram');
    } catch (e) {
      alert(`Ошибка отправки: ${getErrorMessage(e, 'Не удалось отправить договор')}`);
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
        <p style={{ color: 'var(--tg-danger)' }}>Ошибка загрузки договора</p>
      </AppLayout>
    );
  }

  const meta = contract.metadata || {};
  const drivers = meta.drivers && typeof meta.drivers === 'object' ? meta.drivers : {};

  const fees = meta.fees && typeof meta.fees === 'object' ? meta.fees : {};

  return (
    <AppLayout title={`Договор  №${meta.doc_number || contract.id}`} onBack={() => navigate(-1)}>
      <div className="contract-detail">
        <div className="card">
          <h2>📄 Общая информация</h2>
          <p>
            <b>Номер:</b> {meta.doc_number || '—'}
          </p>
          <p>
            <b>Период:</b>{' '}
            {meta.start_date && meta.end_date ? `${meta.start_date} → ${meta.end_date}` : '—'}
          </p>
          <p>
            <b>Авто:</b> {contract.car_name || '—'} • {contract.car_number || '—'}
          </p>
          <p>
            <b>Клиент:</b> {contract.customer_name || '—'}
          </p>
          <p>
            <b>Шаблон:</b> {contract.template_name || '—'}
          </p>
        </div>

        <InfoBlock title="👤 1-й водитель" data={drivers.driver1 || {}} labels={DRIVER_FIELDS} />
        <InfoBlock title="👤 2-й водитель" data={drivers.driver2 || {}} labels={DRIVER_FIELDS} />

        <InfoBlock title="💰 Подробности о сборах" data={fees} labels={FEES_FIELDS} />

        <div className="actions">
          <button onClick={onSendToTelegram} disabled={loadingSendToTelegram}>
            {loadingSendToTelegram ? 'Отправка...' : 'Отправить в Telegram'}
          </button>
          <button onClick={() => navigate(`/contracts/${id}/edit`)}>Редактировать</button>
          <button className="danger" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
