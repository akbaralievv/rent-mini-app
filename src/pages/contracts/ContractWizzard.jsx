import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
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

const safe = (v, fallback = '—') => typeof v === 'string' && v.trim() ? v.trim() : fallback;

const formatDate = (d) => {
  if (!d) return '—';

  if (d.includes('/')) {
    const [day, month, year] = d.split('/');
    return `${day}-${month}-${year}`;
  }
  if (d.includes('-')) {
    const [year, month, day] = d.split('-');
    return `${day}-${month}-${year}`;
  }
  return d;
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
    const [y, m, d] = value.split('-');
    return `${d}${m}${y}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    const [d, m, y] = value.split('/');
    return `${d}${m}${y}`;
  }

  if (/^\d{2}-\d{2}-\d{4}/.test(value)) {
    const [d, m, y] = value.split('-');
    return `${d}${m}${y}`;
  }

  const digits = value.replace(/\D/g, '');
  return digits.length === 8 ? digits : '';
};

const buildDocNumber = (state) => {
  const orderId = padOrderId(state.order?.id);
  const startDateRaw =
    state.order?.start_date ||
    state.metadata?.start_date;

  const dateDigits = normalizeDateToDigits(startDateRaw);

  if (!orderId || !dateDigits) return orderId || '';

  return `${orderId}/${dateDigits}`;
};

export default function ContractWizard() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data } = useGetContractQuery(id, { skip: !isEdit });
  const [createContract, {isLoading: loadingCreate}] = useCreateContractMutation();
  const [updateContract, {isLoading: loadingUpdate}] = useUpdateContractMutation();

  const initialContractState = useMemo(() => {
    if (!data?.data) {
      return {
        template: null,
        car: null,
        order: null,
        drivers: { driver1: {}, driver2: {} },
        fees: {},
      };
    }

    const c = data.data;
    return {
      template: { id: c.template_id, name: c.template_name },
      car: { number: c.car_number, name: c.car_name,  },
      order: { id: c.order_id, customer_name: c.customer_name, start_date: c.start_date || (c.order?.start_date || c.metadata?.start_date), end_date: c.end_date || (c.order?.end_date || c.metadata?.end_date)},
      drivers: c.metadata?.drivers || { driver1: {}, driver2: {} },
      fees: c.metadata?.fees || {},
    };
  }, [data]);

  const [step, setStep] = useState(0);
  const [state, setState] = useState(initialContractState);

  const save = async () => {
    const carNumber = state.car?.car_number ?? state.car?.number;
    const carName = state.car?.car_name ?? state.car?.name;

    const payload = {
      order_id: state.order?.id + '',
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
    } catch (e) {
      alert(getErrorMessage(e, 'Не удалось сохранить договор'));
    }
  };

  const canGoNext = () => {
    if (step === 0) return !!state.template;
    if (step === 1) return !!state.car;
    if (step === 2) return !!state.order;
    return true;
  };

  const steps = [
    <StepTemplate state={state} setState={setState} />,
    <StepCar state={state} setState={setState} />,
    <StepOrder state={state} setState={setState} />,
    <StepDrivers state={state} setState={setState} />,
    <StepFees state={state} setState={setState} />,
    <StepPreview state={state} onSave={save} loading={loadingCreate || loadingUpdate}/>,
  ];

  return (
    <AppLayout
      title={isEdit ? 'Редактирование договора' : 'Создание договора'}
      onBack={() => navigate(-1)}>
      {steps[step]}
      {!canGoNext() && (
        <div className="step-hint error">
          Пожалуйста, выберите значение, чтобы продолжить
        </div>
      )}
      <div className="wizard-nav">
        {step > 0 && <button onClick={() => setStep(step - 1)}>⬅ Назад</button>}
        {step < steps.length - 1 && <button disabled={!canGoNext()} onClick={() => setStep(step + 1)}>Далее ➡</button>}
      </div>
    </AppLayout>
  );
}
