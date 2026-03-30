import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { getErrorMessage } from '../../utils';
import {
  useCreateContractMutation,
  useUpdateContractMutation,
  useGetContractQuery,
} from '../../redux/services/contracts';
import { useGetContractTemplatesQuery } from '../../redux/services/contractTemplates';
import { useGetCarsQuery } from '../../redux/services/cars';
import { useGetOrdersByCarQuery } from '../../redux/services/orders';
import { tgTheme } from '../../common/commonStyle';
import { Check, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';
import BackdropModal from '../../components/BackdropModal/BackdropModal';
import LoaderCustom from '../../components/LoaderCustom/LoaderCustom';
import styles from './ContractForm.module.css';

/* ── helpers (unchanged) ── */
const safe = (v, fb = '-') => (typeof v === 'string' && v.trim() ? v.trim() : fb);
const formatDate = (d) => {
  if (!d) return '-';
  if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); return `${dd}-${mm}-${yy}`; }
  if (d.includes('-')) { const [yy, mm, dd] = d.split('-'); return `${dd}-${mm}-${yy}`; }
  return d;
};
const buildDocName = (s) => {
  const c = safe(s.car?.car_name, s.car?.name).replace(/\s+/g, '_');
  const sd = formatDate(s.order?.start_date || s.metadata?.start_date);
  const ed = formatDate(s.order?.end_date || s.metadata?.end_date);
  return `Contract_${c}_${sd}_to_${ed}.html`;
};
const padOrderId = (id) => (!id ? '' : String(id).padStart(3, '0'));
const normalizeDateToDigits = (v) => {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) { const [y, m, d] = v.split('-'); return `${d}${m}${y}`; }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(v)) { const [d, m, y] = v.split('/'); return `${d}${m}${y}`; }
  if (/^\d{2}-\d{2}-\d{4}/.test(v)) { const [d, m, y] = v.split('-'); return `${d}${m}${y}`; }
  const digits = v.replace(/\D/g, ''); return digits.length === 8 ? digits : '';
};
const buildDocNumber = (s) => {
  const oid = padOrderId(s.order?.id);
  const dd = normalizeDateToDigits(s.order?.start_date || s.metadata?.start_date);
  if (!oid || !dd) return oid || '';
  return `${oid}/${dd}`;
};

const emptyState = {
  template: null, car: null, order: null,
  drivers: { driver1: {}, driver2: {} },
  fees: {},
  vehicle_info: {
    vehicle_color: '', vehicle_model: '', reg_no: '',
    km_allowed_daily: '', km_allowed_weekly: '', km_allowed_monthly: '',
    time_out: '', time_in: '',
  },
  kms: { kms_out: '', kms_in: '', checked_out_by: '', checked_in_by: '' },
  signatures: { driver1_sign: '', driver2_sign: '', office_sign: '' },
  company_info: { mob_no: '', email: '', website: '' },
};

/* ── Tiny inline input ── */
function CellInput({ value, onChange, placeholder, type, style }) {
  return (
    <input
      className={styles.cellInput}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ''}
      type={type || 'text'}
      style={style}
    />
  );
}

/* ── Driver rows block ── */
function DriverBlock({ label, driverKey, state, updateDriver }) {
  const d = state.drivers?.[driverKey] || {};
  const u = (field) => (val) => updateDriver(driverKey, field, val);

  return (
    <>
      <tr>
        <td colSpan={4} className={styles.driverHeader}>
          <b>{label}:</b> <CellInput value={d.name} onChange={u('name')} placeholder="Full Name" style={{ width: '60%' }} />
        </td>
      </tr>
      <tr>
        <td className={styles.labelCell}>LICENSE NO.<br /><span className={styles.ar}>رقم الرخصة</span></td>
        <td><CellInput value={d.license_no} onChange={u('license_no')} /></td>
        <td className={styles.labelCell}>TYPE<br /><span className={styles.ar}>النوع</span></td>
        <td><CellInput value={d.license_type} onChange={u('license_type')} /></td>
      </tr>
      <tr>
        <td className={styles.labelCell}>EXPIRE DATE<br /><span className={styles.ar}>تاريخ الانتهاء</span></td>
        <td><CellInput value={d.license_expire} onChange={u('license_expire')} type="date" /></td>
        <td className={styles.labelCell}>ISSUED AT<br /><span className={styles.ar}>صدرت في</span></td>
        <td><CellInput value={d.license_issued_at} onChange={u('license_issued_at')} type="date" /></td>
      </tr>
      <tr>
        <td className={styles.labelCell}>PP / ID NO.<br /><span className={styles.ar}>رقم جواز السفر</span></td>
        <td><CellInput value={d.passport_no} onChange={u('passport_no')} /></td>
        <td className={styles.labelCell}>TYPE<br /><span className={styles.ar}>النوع</span></td>
        <td><CellInput value={d.passport_type} onChange={u('passport_type')} /></td>
      </tr>
      <tr>
        <td className={styles.labelCell}>EXPIRE DATE<br /><span className={styles.ar}>تاريخ الانتهاء</span></td>
        <td><CellInput value={d.passport_expire} onChange={u('passport_expire')} type="date" /></td>
        <td className={styles.labelCell}>ISSUED AT<br /><span className={styles.ar}>صدرت في</span></td>
        <td><CellInput value={d.passport_issued_at} onChange={u('passport_issued_at')} type="date" /></td>
      </tr>
      <tr>
        <td className={styles.labelCell}>NATIONALITY<br /><span className={styles.ar}>جنسية</span></td>
        <td><CellInput value={d.nationality} onChange={u('nationality')} /></td>
        <td className={styles.labelCell}>DATE OF BIRTH<br /><span className={styles.ar}>تاريخ الميلاد</span></td>
        <td><CellInput value={d.birth_date} onChange={u('birth_date')} type="date" /></td>
      </tr>
      <tr>
        <td className={styles.labelCell}>MODE OF PAYMENT<br /><span className={styles.ar}>طريقة الدفع</span></td>
        <td><CellInput value={d.mode_of_payment} onChange={u('mode_of_payment')} /></td>
        <td className={styles.labelCell}>DOC.HELD<br /><span className={styles.ar}>محجوزات</span></td>
        <td><CellInput value={d.doc_held} onChange={u('doc_held')} /></td>
      </tr>
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function ContractWizard() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data } = useGetContractQuery(id, { skip: !isEdit });
  const [createContract, { isLoading: loadingCreate }] = useCreateContractMutation();
  const [updateContract, { isLoading: loadingUpdate }] = useUpdateContractMutation();

  const { data: templatesData, isLoading: templatesLoading } = useGetContractTemplatesQuery();
  const templates = Array.isArray(templatesData) ? templatesData : templatesData?.data ?? [];
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery();
  const cars = carsData?.cars ?? [];

  const [state, setState] = useState(emptyState);
  const carNumber = state.car?.car_number || state.car?.number;
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersByCarQuery(carNumber, { skip: !carNumber });
  const orders = ordersData?.orders ?? [];

  const [showTemplates, setShowTemplates] = useState(false);
  const [showCars, setShowCars] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  /* ── zoom ── */
  const [scale, setScale] = useState(0.48);
  const viewportRef = useRef(null);
  const paperRef = useRef(null);
  const [paperSize, setPaperSize] = useState({ w: 794, h: 1200 });

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.12, 1.5)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.12, 0.3)), []);

  /* ── measure paper to fit viewport exactly ── */
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPaperSize({ w: el.scrollWidth, h: el.scrollHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── pinch-to-zoom ── */
  const lastDist = useRef(null);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDist.current = Math.hypot(dx, dy);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && lastDist.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = (dist - lastDist.current) * 0.003;
        setScale((s) => Math.max(0.3, Math.min(1.5, s + delta)));
        lastDist.current = dist;
      }
    };
    const onTouchEnd = () => { lastDist.current = null; };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  /* ── edit hydration ── */
  const initialContractState = useMemo(() => {
    if (!data?.data) return emptyState;
    const c = data.data;
    return {
      template: { id: c.template_id, name: c.template_name },
      car: { number: c.car_number, name: c.car_name, car_number: c.car_number, car_name: c.car_name },
      order: {
        id: c.order_id, customer_name: c.customer_name,
        start_date: c.start_date || c.order?.start_date || c.metadata?.start_date,
        end_date: c.end_date || c.order?.end_date || c.metadata?.end_date,
      },
      drivers: c.metadata?.drivers || { driver1: {}, driver2: {} },
      fees: c.metadata?.fees || {},
      vehicle_info: c.metadata?.vehicle_info || emptyState.vehicle_info,
      kms: c.metadata?.kms || emptyState.kms,
      signatures: c.metadata?.signatures || emptyState.signatures,
      company_info: c.metadata?.company_info || emptyState.company_info,
    };
  }, [data]);

  useEffect(() => {
    if (isEdit && data?.data) setState(initialContractState);
    if (!isEdit) setState(emptyState);
  }, [initialContractState, isEdit, data?.data]);

  /* ── updaters ── */
  const updateDriver = (dk, fk, v) => setState((p) => ({
    ...p, drivers: { ...p.drivers, [dk]: { ...p.drivers[dk], [fk]: v } }
  }));
  const updateFee = (fk, v) => setState((p) => ({ ...p, fees: { ...p.fees, [fk]: v } }));
  const updateVI = (fk, v) => setState((p) => ({ ...p, vehicle_info: { ...p.vehicle_info, [fk]: v } }));
  const updateKms = (fk, v) => setState((p) => ({ ...p, kms: { ...p.kms, [fk]: v } }));
  const updateCompany = (fk, v) => setState((p) => ({ ...p, company_info: { ...p.company_info, [fk]: v } }));

  const selectTemplate = (t) => { setState((p) => ({ ...p, template: t })); setShowTemplates(false); };
  const selectCar = (c) => { setState((p) => ({ ...p, car: c, order: null })); setShowCars(false); };
  const selectOrder = (o) => { setState((p) => ({ ...p, order: o })); setShowOrders(false); };

  const canSave = state.template && state.car && state.order;
  const loading = loadingCreate || loadingUpdate;

  const save = async () => {
    const cn = state.car?.car_number ?? state.car?.number;
    const cname = state.car?.car_name ?? state.car?.name;
    const payload = {
      order_id: `${state.order?.id ?? ''}`,
      car_number: cn, car_name: cname,
      customer_name: state.order?.customer_name,
      template_id: state.template?.id, template_name: state.template?.name,
      doc_name: buildDocName(state),
      metadata: {
        doc_number: buildDocNumber(state),
        start_date: state.order?.start_date, end_date: state.order?.end_date,
        drivers: state.drivers, fees: state.fees,
        vehicle_info: state.vehicle_info, kms: state.kms, signatures: state.signatures,
        company_info: state.company_info,
      },
    };
    try {
      if (isEdit) await updateContract({ id, data: payload }).unwrap();
      else await createContract(payload).unwrap();
      navigate('/contracts');
    } catch (error) {
      alert(getErrorMessage(error, 'Не удалось сохранить договор'));
    }
  };

  /* ── short aliases ── */
  const vi = state.vehicle_info || {};
  const fees = state.fees || {};
  const kms = state.kms || {};
  const orderId = state.order?.id || '';

  return (
    <AppLayout
      title={isEdit ? 'Редактирование договора' : 'Создание договора'}
      onBack={() => navigate(-1)}
    >
      {/* ── Top selectors (normal mobile UI) ── */}
      <div className={styles.selectors}>
        {/* Template */}
        <div className={styles.selRow}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary, minWidth: 70 }}>Шаблон</span>
          <div className={styles.selectorWrap}>
            <button className={styles.selectorBtn} onClick={() => { setShowCars(false); setShowOrders(false); setShowTemplates(true); }}>
              <span className="font14w500">{state.template ? state.template.name : 'Выбрать...'}</span>
              <ChevronDown color={tgTheme.textSecondary} size={14} />
            </button>
            {showTemplates && <>
              <BackdropModal onClick={() => setShowTemplates(false)} />
              <div className={styles.dropdown}>
                {templatesLoading ? <div className={styles.ddLoader}><LoaderCustom /></div>
                  : templates.length === 0 ? <div className={styles.ddEmpty}><span className="font13w400">Нет шаблонов</span></div>
                    : templates.map((t) => (
                      <button key={t.id} className={styles.ddItem} onClick={() => selectTemplate(t)}>
                        <span className="font14w500">{t.name}</span>
                        {state.template?.id === t.id && <Check color={tgTheme.accent} size={16} />}
                      </button>
                    ))}
              </div>
            </>}
          </div>
        </div>
        {/* Car */}
        <div className={styles.selRow}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary, minWidth: 70 }}>Авто</span>
          <div className={styles.selectorWrap}>
            <button className={styles.selectorBtn} onClick={() => { setShowTemplates(false); setShowOrders(false); setShowCars(true); }}>
              <span className="font14w500">{state.car ? (state.car.car_name || state.car.name) : 'Выбрать...'}</span>
              <ChevronDown color={tgTheme.textSecondary} size={14} />
            </button>
            {showCars && <>
              <BackdropModal onClick={() => setShowCars(false)} />
              <div className={styles.dropdown}>
                {carsLoading ? <div className={styles.ddLoader}><LoaderCustom /></div>
                  : cars.length === 0 ? <div className={styles.ddEmpty}><span className="font13w400">Нет авто</span></div>
                    : cars.map((c) => (
                      <button key={c.car_number} className={styles.ddItem} onClick={() => selectCar(c)}>
                        <span className="font14w500">{c.car_name} <span style={{ color: tgTheme.textSecondary }}>{c.car_number}</span></span>
                        {(state.car?.car_number || state.car?.number) === c.car_number && <Check color={tgTheme.accent} size={16} />}
                      </button>
                    ))}
              </div>
            </>}
          </div>
        </div>
        {/* Order */}
        <div className={styles.selRow}>
          <span className="font13w500" style={{ color: tgTheme.textSecondary, minWidth: 70 }}>Заказ</span>
          <div className={styles.selectorWrap}>
            <button className={styles.selectorBtn} onClick={() => { setShowTemplates(false); setShowCars(false); setShowOrders(true); }} disabled={!carNumber}>
              <span className="font14w500">
                {!carNumber ? 'Сначала авто' : state.order ? `#${state.order.id} • ${state.order.customer_name || ''}` : 'Выбрать...'}
              </span>
              <ChevronDown color={tgTheme.textSecondary} size={14} />
            </button>
            {showOrders && carNumber && <>
              <BackdropModal onClick={() => setShowOrders(false)} />
              <div className={styles.dropdown}>
                {ordersLoading ? <div className={styles.ddLoader}><LoaderCustom /></div>
                  : orders.length === 0 ? <div className={styles.ddEmpty}><span className="font13w400">Нет заказов</span></div>
                    : orders.map((o) => (
                      <button key={o.id} className={styles.ddItem} onClick={() => selectOrder(o)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className="font14w500">#{o.id} • {o.start_date} → {o.end_date}</span>
                          <span className="font12w400" style={{ color: tgTheme.textSecondary }}>{o.customer_name || '—'}</span>
                        </div>
                        {String(state.order?.id) === String(o.id) && <Check color={tgTheme.accent} size={16} />}
                      </button>
                    ))}
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── Save bar (above document) ── */}
      <div className={styles.saveBar}>
        {!canSave && (
          <span className="font12w400" style={{ color: tgTheme.warning }}>Выберите шаблон, авто и заказ</span>
        )}
        <button className={styles.saveBtn} onClick={save} disabled={!canSave || loading}>
          <span className="font14w600">{loading ? 'Сохранение...' : 'Сохранить договор'}</span>
        </button>
      </div>

      {/* ── Zoom controls ── */}
      <div className={styles.zoomBar}>
        <button className={styles.zoomBtn} onClick={zoomOut}><ZoomOut size={18} color={tgTheme.text} /></button>
        <span className="font12w500" style={{ color: tgTheme.textSecondary }}>{Math.round(scale * 100)}%</span>
        <button className={styles.zoomBtn} onClick={zoomIn}><ZoomIn size={18} color={tgTheme.text} /></button>
      </div>

      {/* ── A4 Viewport (scroll + pinch) ── */}
      <div className={styles.a4Viewport} ref={viewportRef}>
        {/* Wrapper shrinks to the scaled paper size — no empty grey area */}
        <div style={{ width: paperSize.w * scale, height: paperSize.h * scale, overflow: 'hidden' }}>
          <div
            ref={paperRef}
            className={styles.a4Paper}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: 794,
            }}
          >

          {/* ═══ PAGE 1 ═══ */}
          <table className={styles.docTable}>
            <tbody>
              {/* Header */}
              <tr>
                <td colSpan={2} className={styles.headerLeft}>
                  <div className={styles.docNo}>No. <b>{orderId || '___'}</b></div>
                  <div className={styles.companyMeta}>
                    Mob No: <CellInput value={state.company_info?.mob_no} onChange={(v) => updateCompany('mob_no', v)} placeholder="+971 XX XXX XXXX" style={{ width: '60%', fontSize: 10 }} />
                    <br />
                    Email: <CellInput value={state.company_info?.email} onChange={(v) => updateCompany('email', v)} placeholder="info@company.com" style={{ width: '60%', fontSize: 10 }} />
                    <br />
                    Website: <CellInput value={state.company_info?.website} onChange={(v) => updateCompany('website', v)} placeholder="www.company.com" style={{ width: '60%', fontSize: 10 }} />
                  </div>
                </td>
                <td colSpan={2} className={styles.headerRight}>
                  <div className={styles.logoBox}>Logo</div>
                </td>
              </tr>

              {/* Title */}
              <tr>
                <td colSpan={4} className={styles.titleCell}>
                  <b>This Car Rental Agreement between Company and the Hirer</b>
                  <br />
                  <span className={styles.ar}>اتفاقية تأجير سيارة بين شركة رادياتس رايد ناجير السيارات ذ.م.م والمستأجر</span>
                </td>
              </tr>

              {/* Vehicle info */}
              <tr>
                <td className={styles.labelCell}>
                  لون المركبة<br />Vehicle Color:
                </td>
                <td><CellInput value={vi.vehicle_color} onChange={(v) => updateVI('vehicle_color', v)} placeholder="Black" /></td>
                <td className={styles.labelCell}>
                  طراز السيارة<br />Vehicle Model:
                </td>
                <td><CellInput value={vi.vehicle_model} onChange={(v) => updateVI('vehicle_model', v)} placeholder="MG 3" /></td>
              </tr>
              <tr>
                <td className={styles.labelCell}>مركبة<br />VEHICLE</td>
                <td><CellInput value={state.car?.car_name || state.car?.name || ''} onChange={() => {}} placeholder="Car Name" /></td>
                <td className={styles.labelCell}>رقم التسجيل<br />REG. NO.</td>
                <td><CellInput value={vi.reg_no || state.car?.car_number || ''} onChange={(v) => updateVI('reg_no', v)} placeholder="74609" /></td>
              </tr>

              {/* Dates */}
              <tr>
                <td className={styles.labelCell}>تاريخ الخروج<br />DATE OUT</td>
                <td><CellInput value={state.order?.start_date || ''} onChange={() => {}} type="date" /></td>
                <td className={styles.labelCell}>وقت الخروج<br />TIME OUT</td>
                <td><CellInput value={vi.time_out} onChange={(v) => updateVI('time_out', v)} type="time" /></td>
              </tr>
              <tr>
                <td className={styles.labelCell}>تاريخ الدخول<br />DATE IN</td>
                <td><CellInput value={state.order?.end_date || ''} onChange={() => {}} type="date" /></td>
                <td className={styles.labelCell}>وقت الدخول<br />TIME IN</td>
                <td><CellInput value={vi.time_in} onChange={(v) => updateVI('time_in', v)} type="time" /></td>
              </tr>

              {/* KM Allowed */}
              <tr>
                <td className={styles.labelCell}>الكيلومتر المسموح<br />KM ALLOWED</td>
                <td>
                  <div className={styles.kmRow}>
                    <span className={styles.kmLabel}>DAILY</span>
                    <CellInput value={vi.km_allowed_daily} onChange={(v) => updateVI('km_allowed_daily', v)} style={{ width: 50 }} />
                  </div>
                </td>
                <td>
                  <div className={styles.kmRow}>
                    <span className={styles.kmLabel}>WEEKLY</span>
                    <CellInput value={vi.km_allowed_weekly} onChange={(v) => updateVI('km_allowed_weekly', v)} style={{ width: 50 }} />
                  </div>
                </td>
                <td>
                  <div className={styles.kmRow}>
                    <span className={styles.kmLabel}>MONTHLY</span>
                    <CellInput value={vi.km_allowed_monthly} onChange={(v) => updateVI('km_allowed_monthly', v)} style={{ width: 50 }} />
                  </div>
                </td>
              </tr>

              {/* 1st Driver */}
              <DriverBlock label="1st Driver Name" driverKey="driver1" state={state} updateDriver={updateDriver} />

              {/* Check out / Check in placeholder */}
              <tr>
                <td colSpan={2} className={styles.checkCell}>
                  <div className={styles.checkHeader} style={{ background: '#d32f2f', color: '#fff' }}>RATE INCLUSIVE / EXCLUSIVE OF EXCESS WAIVER</div>
                  <div className={styles.checkTitle}>CHECK OUT</div>
                  <div className={styles.carImagePlaceholder}>🚗</div>
                </td>
                <td colSpan={2} className={styles.checkCell}>
                  <div style={{ height: 22 }} />
                  <div className={styles.checkTitle}>CHECK IN</div>
                  <div className={styles.carImagePlaceholder}>🚗</div>
                </td>
              </tr>

              {/* 2nd Driver */}
              <DriverBlock label="2nd Driver Name" driverKey="driver2" state={state} updateDriver={updateDriver} />

              {/* KMS */}
              <tr>
                <td className={styles.labelCell}>KMS OUT</td>
                <td><CellInput value={kms.kms_out} onChange={(v) => updateKms('kms_out', v)} /></td>
                <td className={styles.labelCell}>CHECKED OUT BY<br /><span className={styles.ar}>قراءة العداد</span></td>
                <td><CellInput value={kms.checked_out_by} onChange={(v) => updateKms('checked_out_by', v)} /></td>
              </tr>
              <tr>
                <td className={styles.labelCell}>KMS IN</td>
                <td><CellInput value={kms.kms_in} onChange={(v) => updateKms('kms_in', v)} /></td>
                <td className={styles.labelCell}>CHECKED IN BY<br /><span className={styles.ar}>قراءة العداد</span></td>
                <td><CellInput value={kms.checked_in_by} onChange={(v) => updateKms('checked_in_by', v)} /></td>
              </tr>
            </tbody>
          </table>

          {/* ═══ PAGE 2 — Charges ═══ */}
          <div className={styles.pageBreak} />
          <table className={styles.docTable}>
            <tbody>
              <tr>
                <td colSpan={2} className={styles.chargesHeader}>
                  <span className={styles.ar}>تفاصيل الشحن</span>&nbsp;&nbsp;Charges Details
                </td>
              </tr>
              {[
                ['base_rental', 'Base Rental(D/y/Wk/Mth)', 'إيجار السيارة في اليوم'],
                ['salik', 'Salik', 'سالك'],
                ['fines', 'Fines', 'مخالفات'],
                ['others', 'Others', 'أخرى'],
                ['grand_total', 'G. Total', 'المبلغ الإجمالي'],
                ['advance', 'Advance', 'دفعة مقدمة'],
                ['deposit', 'Deposit', 'تأمين'],
                ['balance_due', 'Balance', 'الرصيد المتبقي'],
              ].map(([key, en, ar]) => (
                <tr key={key}>
                  <td className={styles.chargeLabelCell}>
                    {en}<br /><span className={styles.ar}>{ar}</span>
                  </td>
                  <td className={styles.chargeInputCell}>
                    <CellInput value={fees[key]} onChange={(v) => updateFee(key, v)} placeholder="0" />
                  </td>
                </tr>
              ))}

              {/* Signatures */}
              <tr>
                <td colSpan={2} style={{ paddingTop: 24 }}>
                  <div className={styles.sigRow}>
                    <div className={styles.sigBlock}>
                      <div className={styles.sigLabel}>توقيع السائق-1<br />1st Driver Sign</div>
                      <div className={styles.sigLine} />
                    </div>
                    <div className={styles.sigBlock}>
                      <div className={styles.sigLabel}>توقيع السائق-2<br />2nd Driver Sign</div>
                      <div className={styles.sigLine} />
                    </div>
                    <div className={styles.sigBlock}>
                      <div className={styles.sigLabel}>توقيع المكتب<br />Office Sign</div>
                      <div className={styles.sigLine} />
                    </div>
                  </div>
                </td>
              </tr>

              {/* Acknowledgement */}
              <tr>
                <td colSpan={2} className={styles.ackCell}>
                  <b>Acknowledge that, We have read above and reverse Mentioned</b><br />
                  <span className={styles.ar}>اقر انا مستأجر السيارة قد اطلعت على الشروط وقرأت بدواعيه والقت عليها</span>
                </td>
              </tr>

              {/* Terms header */}
              <tr>
                <td className={styles.termsHeader}>Terms & Conditions</td>
                <td className={styles.termsHeader} style={{ textAlign: 'right' }}>الأحكام والشروط</td>
              </tr>

              {/* Terms content */}
              <tr>
                <td colSpan={2} className={styles.termsBody}>
                  <ol className={styles.termsList}>
                    <li>In case of any accident, whether the hirer is at fault or not, he must pay the daily rent for the entire period the vehicle is under repair.</li>
                    <li>In case of any accident, the hirer should not move the vehicle from the place of accident before the police inspection is complete.</li>
                    <li>If any accident occurred because the driver was under the influence of alcohol or any other similar substance, he has to pay complete compensation for all damages to the vehicle.</li>
                    <li>The hirer is responsible to pay for repair and delays/rent for the period if the vehicle is not working due to an accident or technical trouble caused by carelessness, negligence, or intentional misuse.</li>
                    <li>The hirer agrees to pay all traffic or parking tickets during or after the rental period.</li>
                    <li>In case of Total Loss (vehicle beyond economical repairs), the hirer agrees to pay the company.</li>
                    <li>The hirer is not allowed to use the vehicle to tow another vehicle or for racing.</li>
                    <li>In case of accident or technical trouble, the hirer must inform the rent office.</li>
                    <li>No permission to use the vehicle outside the UAE.</li>
                    <li>The hirer needs to take permission to extend the rental period.</li>
                  </ol>
                </td>
              </tr>
            </tbody>
          </table>

          </div>
        </div>
      </div>

    </AppLayout>
  );
}
