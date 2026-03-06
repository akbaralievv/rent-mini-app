import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../../layouts/AppLayout";
import styles from "./OperationEditPage.module.css";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { tgTheme } from "../../../../common/commonStyle";
import { useGetTagsQuery } from "../../../../redux/services/tagsAction";
import { useCreateTransactionMutation, useGetTransactionByIdQuery, useUpdateTransactionMutation } from "../../../../redux/services/financeApi";
import { useGetAllOrdersQuery } from "../../../../redux/services/orders";
import InfoModal from "../../../../components/InfoModal/InfoModal";

const TYPE_OPTIONS = [
  { key: "expense", label: "Расходы" },
  { key: "income", label: "Доходы" },
  { key: "deposit_add", label: "Депозит +" },
  { key: "deposit_return", label: "Депозит -" },
];

export default function OperationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams() || {};

  const { data = {} } = useGetTransactionByIdQuery(id);

  const isEdit = Boolean(id);
  const { data: tags = [] } = useGetTagsQuery();
  const { data: orders = [] } = useGetAllOrdersQuery();

  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: 'expense',
    amount: 0,
    finance_tag_id: tags[0]?.id || null,
    description: "",
    currency: "AED",
    car_number: "",
    customer_name: "",
    order_id: null,
    car_name: ''
  });

  useEffect(() => {
    if (!id || !data?.id) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      type: data.type ?? 'expense',
      amount: Number(data.amount) || 0,
      finance_tag_id: data.finance_tag_id ?? null,
      description: data.description ?? "",
      currency: data.currency ?? "AED",
      car_number: data.car_number ?? "",
      customer_name: data.customer_name ?? "",
      order_id: data.order_id ?? null,
      car_name: data.car_name ?? ""
    });

  }, [id, data?.id]);

  const [typeOpen, setTypeOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const onSave = async () => {

    if (!form.amount) {
      setError("Пожалуйста заполните сумму.");
      return;
    }

    try {
      if (id) {
        await updateTransaction({ id: id, body: form }).unwrap();
      } else {
        await createTransaction(form).unwrap();
      }
      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppLayout
      title={isEdit ? "Редактирование операции" : "Новая операция"}
      onBack={() => navigate(-1)}
    >
      <div className={styles.pageWrapper}>
        <div className={styles.modalLike}>
          <div className={styles.modalBody}>

            {/* ТИП */}
            <div className={styles.field}>
              <span className="font16w500">Тип</span>

              <div className={styles.selectWrapper}>
                <button
                  className={styles.selectLike}
                  disabled={id}
                  onClick={() => setTypeOpen((p) => !p)}
                >
                  <span className="font14w600">
                    {
                      TYPE_OPTIONS.find(el => el.key == form.type).label
                    }
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                {typeOpen && (
                  <div className={styles.dropdown}>
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setForm(prev => ({ ...prev, type: opt.key }));
                          setTypeOpen(false);
                        }}
                      >
                        <span className="font14w600">{opt.label}</span>
                        {opt.key == form.type && (
                          <Check color={tgTheme.accent} size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* tag */}
            <div className={styles.field}>
              <span className="font16w500">Тег</span>

              <div className={styles.selectWrapper}>
                <button
                  className={styles.selectLike}
                  onClick={() => setTagsOpen((p) => !p)}
                >
                  <span className="font14w600">
                    {tags.find(el => el.id == form.finance_tag_id)?.name || 'Выберите тег'}
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                {tagsOpen && (
                  <div className={styles.dropdown}>
                    {tags.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setForm(prev => ({ ...prev, finance_tag_id: opt.id }));
                          setTagsOpen(false);
                        }}
                      >
                        <span className="font14w600">{opt.name}</span>
                        {opt.id == form.finance_tag_id && (
                          <Check color={tgTheme.accent} size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* OrderId */}
            <div className={styles.field}>
              <span className="font16w500">Заказ</span>

              <div className={styles.selectWrapper}>
                <button
                  className={styles.selectLike}
                  onClick={() => setOrderOpen((p) => !p)}
                >
                  <span className="font14w600">
                    {
                      orders.find(el => el.id == form.order_id)?.customer_name || 'Без заказа'
                    }
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                {orderOpen && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          order_id: null,
                          car_number: '',
                          customer_name: '',
                          car_name: '',
                        }));
                        setOrderOpen(false);
                      }}
                    >
                      <span className="font14w600">Без заказа</span>
                      {null == form.order_id && (
                        <Check color={tgTheme.accent} size={20} />
                      )}
                    </button>
                    {orders.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            order_id: opt.id,
                            car_number: opt.car.car_number,
                            customer_name: opt.customer_name,
                            car_name: opt.car.car_name,
                          }));
                          setOrderOpen(false);
                        }}
                      >
                        <span className="font14w600">{opt.customer_name}</span>
                        {opt.id == form.order_id && (
                          <Check color={tgTheme.accent} size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* СУММА */}
            <div className={styles.field}>
              <span className="font16w500">Сумма</span>
              <input
                className={styles.input}
                type="number"
                value={form.amount}
                onChange={(e) => onChange("amount", e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* КОММЕНТАРИЙ */}
            <div className={styles.field}>
              <span className="font16w500">Комментарий</span>
              <textarea
                className={styles.input}
                rows={2}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="Необязательно"
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate(-1)}
            >
              <span className="font14w600">Отмена</span>
            </button>

            <button
              className={styles.primaryBtn}
              onClick={onSave}
            >
              <span className="font14w600">Сохранить</span>
            </button>
          </div>
        </div>
      </div>
      <InfoModal visible={error.trim()} setVisible={() => setError('')} text={error} textButton="Ок" />
    </AppLayout>
  );
}

