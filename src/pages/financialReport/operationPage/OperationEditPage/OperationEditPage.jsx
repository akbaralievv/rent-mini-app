import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../../layouts/AppLayout";
import styles from "./OperationEditPage.module.css";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash, Trash2 } from "lucide-react";
import { tgTheme } from "../../../../common/commonStyle";
import { useGetTagsQuery } from "../../../../redux/services/tagsAction";
import { useCreateTransactionMutation, useGetTransactionByIdQuery, useUpdateTransactionMutation } from "../../../../redux/services/financeApi";
import { useGetAllOrdersQuery } from "../../../../redux/services/orders";
import InfoModal from "../../../../components/InfoModal/InfoModal";
import { useGetCarsQuery } from "../../../../redux/services/carAction";
import BackdropModal from "../../../../components/BackdropModal/BackdropModal";
import CustomButton from "../../../../components/CustomButton/CustomButton";

const addUnique = (array, item, onDuplicate) => {
  if (array.includes(item)) {
    onDuplicate?.();
    return array;
  }

  return [...array, item];
};

const removeItem = (array, id) => {
  return array.filter(el => el !== id);
};

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
  const { data: cars = { cars: [] } } = useGetCarsQuery();

  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: 'expense',
    amount: 0,
    // finance_tag_id: tags[0]?.id || null,
    finance_tag_ids: [],
    description: "",
    currency: "AED",
    order_id: null,

    // car_number: "",
    // customer_name: "",
    // car_name: ''
  });

  useEffect(() => {
    if (!id || !data?.id) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      type: data.type ?? 'expense',
      amount: Number(data.amount) || 0,
      finance_tag_ids: data.finance_tag_ids ?? [],
      description: data.description ?? "",
      currency: data.currency ?? "AED",
      order_id: data.order_id ?? null,

      car_number: data.car_number ?? "",
      customer_name: data.customer_name ?? "",
      car_name: data.car_name ?? ""
    });

  }, [id, data?.id]);

  const [typeOpen, setTypeOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [carsOpen, setCarsOpen] = useState(false);

  const filteredTags = tags.filter(el => el.type == form.type);

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
                          setForm(prev => ({ ...prev, type: opt.key, finance_tag_ids: [] }));
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
              <span className="font16w500">Теги</span>

              <div className={styles.tagsArr}>
                {
                  form.finance_tag_ids.map((item) => <div className={styles.addTagsBtn}>
                    <p className="font12w400" style={{ color: tgTheme.textSecondary }}>{tags.find(el => el.id == item)?.name}</p>
                    <Trash2 size={14} color={tgTheme.danger} onClick={() => setForm(prev => ({
                      ...prev,
                      finance_tag_ids: removeItem(prev.finance_tag_ids, item)
                    }))} />
                  </div>)
                }
                <button
                  className={styles.addTagsBtn}
                  onClick={() => setTagsOpen((p) => !p)}
                >
                  <span className="font12w400">
                    добавить
                  </span>
                  <Plus size={16} color={tgTheme.textSecondary} />
                </button>
                {tagsOpen && (
                  <>
                    <BackdropModal onClick={() => setTagsOpen(false)} />
                    <div className={styles.dropdown}>
                      {filteredTags.length === 0 ? (
                        <div className={styles.emptyTags}>
                          <span className="font14w400" style={{ color: "var(--tg-text-secondary)" }}>
                            Тегов, относящихся к выбранной транзакции, нет
                          </span>
                          <div onClick={() => navigate('/financial-main/tags')}><p className="font13w400" style={{ textDecorationLine: 'underline' }}>
                            Создать тег
                          </p></div>
                        </div>
                      ) : (
                        filteredTags.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setForm(prev => ({
                                ...prev,
                                finance_tag_ids: addUnique(
                                  prev.finance_tag_ids || [],
                                  opt.id,
                                  () => console.log('Такой тег уже есть')
                                )
                              }));
                              setTagsOpen(false);
                            }}
                          >
                            <span className="font14w600">{opt.name}</span>

                            {form.finance_tag_ids?.includes(opt.id) && (
                              <Check color={tgTheme.accent} size={20} />
                            )}
                          </button>
                        ))
                      )}
                      <div onClick={() => navigate('/financial-main/tags')}><p className="font12w400" style={{ padding: 12 }}>
                        Добавить тег
                      </p></div>
                    </div>
                  </>
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

                          // car_number: '',
                          // customer_name: '',
                          // car_name: '',
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
                            // car_number: opt.car.car_number,
                            // customer_name: opt.customer_name,
                            // car_name: opt.car.car_name,
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

            {
              id && <div className={styles.field}>
                <span className="font16w500">Авто</span>

                <div className={styles.selectWrapper}>
                  <button
                    className={styles.selectLike}
                    onClick={() => setCarsOpen((p) => !p)}
                  >
                    <span className="font14w600">
                      {
                        cars.cars.find(el => el.car_number == form.car_number)?.car_name || 'Без авто'
                      }
                    </span>
                    <ChevronDown size={16} color={tgTheme.textSecondary} />
                  </button>

                  {carsOpen && (
                    <div className={styles.dropdown}>
                      <button
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            car_number: '',
                            // customer_name: '',
                            car_name: '',
                          }));
                          setCarsOpen(false);
                        }}
                      >
                        <span className="font14w600">Без авто</span>
                        {null == form.order_id && (
                          <Check color={tgTheme.accent} size={20} />
                        )}
                      </button>
                      {cars.cars.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setForm(prev => ({
                              ...prev,
                              car_number: opt.car_number,
                              // customer_name: opt.customer_name,
                              car_name: opt.car_name,
                            }));
                            setCarsOpen(false);
                          }}
                        >
                          <span className="font14w600">{opt.car_name}</span>
                          {opt.id == form.order_id && (
                            <Check color={tgTheme.accent} size={20} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            }

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

