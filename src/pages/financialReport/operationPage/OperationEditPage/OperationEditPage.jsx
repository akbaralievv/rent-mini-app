import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../../layouts/AppLayout";
import styles from "./OperationEditPage.module.css";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { transactions, deposit } from "../../../../common/mockData";
import { tgTheme } from "../../../../common/commonStyle";
import { useGetTagsQuery } from "../../../../redux/services/tagsAction";
import { formatDate } from "../../../../common/utils/helpers";
import CalendarCustom from "../../../../components/CalendarCustom/CalendarCustom";

const TYPE_OPTIONS = [
  { key: "decrease", label: "Расходы", increse: false, deposit: false },
  { key: "increase", label: "Доходы", increse: true, deposit: false },
  { key: "deposit_plus", label: "Депозит +", increse: true, deposit: true },
  { key: "deposit_minus", label: "Депозит −", increse: false, deposit: true },
];

export default function OperationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams() || {};
  const isEdit = Boolean(id);
  const { data: tags = [] } = useGetTagsQuery();

  const current = useMemo(() => {
    if (!isEdit) return null

    const list = [
      ...(transactions || []),
      ...(deposit || []),
    ].filter(Boolean)

    return list.find(el => String(el.id) === String(id)) || null
  }, [id, isEdit])


  const [form, setForm] = useState({
    increse: false,
    deposit: false,
    sum: "",
    created_at: "",
    car_name: "",
    description: "",
  });
  const [tag, setTag] = useState(tags[0]?.id);

  const [typeOpen, setTypeOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        increse: current.increse,
        deposit: Boolean(current.deposit),
        sum: current.sum,
        created_at: current.created_at,
        car_name: current.car_name || "",
        description: current.description || "",
      });
    }
  }, [current]);

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const onSave = () => {
    if (!form.sum || !form.created_at) {
      alert("Заполните сумму и дату");
      return;
    }

    navigate(-1);
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
                  onClick={() => setTypeOpen((p) => !p)}
                >
                  <span className="font14w600">
                    {getTypeLabel(form)}
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                {typeOpen && (
                  <div className={styles.dropdown}>
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setForm((p) => ({
                            ...p,
                            increse: opt.increse,
                            deposit: opt.deposit,
                          }));
                          setTypeOpen(false);
                        }}
                      >
                        <span className="font14w600">{opt.label}</span>
                        {form.increse === opt.increse &&
                          form.deposit === opt.deposit && (
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
                    {tags.find(el => el.id == tag)?.name}
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                {tagsOpen && (
                  <div className={styles.dropdown}>
                    {tags.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTag(opt.id);
                          setTagsOpen(false);
                        }}
                      >
                        <span className="font14w600">{opt.name}</span>
                        {opt.id == tag && (
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
                value={form.sum}
                onChange={(e) => onChange("sum", e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* ДАТА */}
            <div className={styles.field}>
              <span className="font16w500">Дата</span>

              <div className={styles.selectWrapper}>
                <button
                  className={styles.selectLike}
                  onClick={() => setDateOpen((p) => !p)}
                >
                  <span className="font14w600">
                    {form.created_at
                      ? formatDate(form.created_at)
                      : "Выберите дату"}
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                <CalendarCustom
                  date={form.created_at}
                  setDate={(date) => {
                    onChange("created_at", date);
                  }}
                  visible={dateOpen}
                  mode="single"
                  setVisible={setDateOpen}
                />

              </div>
            </div>

            {/* АВТО */}
            <div className={styles.field}>
              <span className="font16w500">Автомобиль</span>
              <input
                className={styles.input}
                value={form.car_name}
                onChange={(e) => onChange("car_name", e.target.value)}
                placeholder="—"
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
    </AppLayout>
  );
}

function getTypeLabel(form) {
  if (form.deposit && form.increse) return "Депозит +";
  if (form.deposit && !form.increse) return "Депозит −";
  if (form.increse) return "Доходы";
  return "Расходы";
}

