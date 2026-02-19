import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import StepTemplate from './steps/StepTemplate';
import StepCar from './steps/StepCar';
import StepOrder from './steps/StepOrder';
import StepDrivers from './steps/StepDrivers';
import StepFees from './steps/StepFees';
import StepPreview from './steps/StepPreview';
import { getErrorMessage } from '../../utils';
import {
  useCreateContractMutation,
  useUpdateContractMutation,
  useGetContractQuery,
} from '../../redux/services/contracts';
import styles from './steps/ContractSteps.module.css';

const STEP_LABELS = ['Шаблон', 'Авто', 'Заказ', 'Водители', 'Сборы', 'Проверка'];

const safe = (value, fallback = '-') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const formatDate = (date) => {
  if (!date) return '-';

  if (date.includes('/')) {
    const [day, month, year] = date.split('/');
    return `${day}-${month}-${year}`;
  }

  if (date.includes('-')) {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  return date;
};

const buildDocName = (state) => {
  const carName = safe(state.car?.car_name, state.car?.name).replace(/\s+/g, '_');
  const startDate = formatDate(state.order?.start_date || state.metadata?.start_date);
  const endDate = formatDate(state.order?.end_date || state.metadata?.end_date);

  return `Contract_${carName}_${startDate}_to_${endDate}.html`;
};

const padOrderId = (id) => {
  if (!id) return '';
  return String(id).padStart(3, '0');
};

const normalizeDateToDigits = (value) => {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}${month}${year}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${day}${month}${year}`;
  }

  if (/^\d{2}-\d{2}-\d{4}/.test(value)) {
    const [day, month, year] = value.split('-');
    return `${day}${month}${year}`;
  }

  const digits = value.replace(/\D/g, '');
  return digits.length === 8 ? digits : '';
};

const buildDocNumber = (state) => {
  const orderId = padOrderId(state.order?.id);
  const startDateRaw = state.order?.start_date || state.metadata?.start_date;
  const dateDigits = normalizeDateToDigits(startDateRaw);

  if (!orderId || !dateDigits) return orderId || '';

  return `${orderId}/${dateDigits}`;
};

const emptyWizardState = {
  template: null,
  car: null,
  order: null,
  drivers: { driver1: {}, driver2: {} },
  fees: {},
};

export default function ContractWizard() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data } = useGetContractQuery(id, { skip: !isEdit });
  const [createContract, { isLoading: loadingCreate }] = useCreateContractMutation();
  const [updateContract, { isLoading: loadingUpdate }] = useUpdateContractMutation();

  const initialContractState = useMemo(() => {
    if (!data?.data) {
      return emptyWizardState;
    }

    const contract = data.data;
    return {
      template: { id: contract.template_id, name: contract.template_name },
      car: { number: contract.car_number, name: contract.car_name },
      order: {
        id: contract.order_id,
        customer_name: contract.customer_name,
        start_date: contract.start_date || contract.order?.start_date || contract.metadata?.start_date,
        end_date: contract.end_date || contract.order?.end_date || contract.metadata?.end_date,
      },
      drivers: contract.metadata?.drivers || { driver1: {}, driver2: {} },
      fees: contract.metadata?.fees || {},
    };
  }, [data]);

  const [step, setStep] = useState(0);
  const [state, setState] = useState(emptyWizardState);

  useEffect(() => {
    if (isEdit && data?.data) {
      setState(initialContractState);
    }
    if (!isEdit) {
      setState(emptyWizardState);
    }
  }, [initialContractState, isEdit, data?.data]);

  const save = async () => {
    const carNumber = state.car?.car_number ?? state.car?.number;
    const carName = state.car?.car_name ?? state.car?.name;

    const payload = {
      order_id: `${state.order?.id ?? ''}`,
      car_number: carNumber,
      car_name: carName,
      customer_name: state.order?.customer_name,
      template_id: state.template?.id,
      template_name: state.template?.name,
      doc_name: buildDocName(state),
      metadata: {
        doc_number: buildDocNumber(state),
        start_date: state.order?.start_date,
        end_date: state.order?.end_date,
        drivers: state.drivers,
        fees: state.fees,
      },
    };

    try {
      if (isEdit) {
        await updateContract({ id, data: payload }).unwrap();
      } else {
        await createContract(payload).unwrap();
      }

      navigate('/contracts');
    } catch (error) {
      alert(getErrorMessage(error, 'Не удалось сохранить договор'));
    }
  };

  const canGoNext = () => {
    if (step === 0) return Boolean(state.template);
    if (step === 1) return Boolean(state.car);
    if (step === 2) return Boolean(state.order);
    return true;
  };

  const steps = [
    <StepTemplate key="template" state={state} setState={setState} />,
    <StepCar key="car" state={state} setState={setState} />,
    <StepOrder key="order" state={state} setState={setState} />,
    <StepDrivers key="drivers" state={state} setState={setState} />,
    <StepFees key="fees" state={state} setState={setState} />,
    <StepPreview key="preview" state={state} onSave={save} loading={loadingCreate || loadingUpdate} />,
  ];

  const goPrev = () => setStep((prev) => Math.max(prev - 1, 0));
  const goNext = () => {
    if (!canGoNext()) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <AppLayout
      title={isEdit ? 'Редактирование договора' : 'Создание договора'}
      onBack={() => navigate(-1)}
    >
      <div className={styles.page}>
        <div className={styles.stepper}>
          {STEP_LABELS.map((label, index) => {
            const isCurrent = index === step;
            const isCompleted = index < step;
            const isAccessible = index <= step;

            return (
              <button
                key={label}
                type="button"
                className={`${styles.stepChip} ${isCurrent ? styles.stepChipCurrent : ''} ${isCompleted ? styles.stepChipDone : ''}`}
                onClick={() => isAccessible && setStep(index)}
                disabled={!isAccessible}
              >
                <span className={styles.stepIndex}>{index + 1}</span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.stepShell}>{steps[step]}</div>

        {!canGoNext() && (
          <div className={styles.hintError}>
            Пожалуйста, заполните текущий шаг, чтобы продолжить.
          </div>
        )}

        {step < steps.length - 1 && (
          <div className={styles.navBar}>
            <button type="button" className={styles.navSecondary} onClick={goPrev} disabled={step === 0}>
              Назад
            </button>
            <button type="button" className={styles.navPrimary} onClick={goNext} disabled={!canGoNext()}>
              Далее
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
