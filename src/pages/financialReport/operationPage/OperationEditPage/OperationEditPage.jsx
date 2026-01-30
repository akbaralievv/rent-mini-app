import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../../layouts/AppLayout";
import styles from "./OperationEditPage.module.css";
import { ChevronDown } from "lucide-react";
import { transactions, deposit } from "../../../../common/mockData";
import { tgTheme } from "../../../../common/commonStyle";

export default function OperationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  // 🔹 ищем операцию из того же mockData
  const current = useMemo(() => {
    if (!isEdit) return null;
    return [...transactions, ...deposit].find(
      (el) => String(el.id) === String(id)
    );
  }, [id, isEdit]);

  const [form, setForm] = useState({
    increse: false,
    sum: "",
    created_at: "",
    car_name: "",
    description: "",
  });

  useEffect(() => {
    if (current) {
      setForm({
        increse: current.increse,
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
    if (!form.sum || !form.created_at) return alert("Заполните сумму и дату");

    if (isEdit) {
      console.log("UPDATE OPERATION", { id, ...form });
    } else {
      console.log("CREATE OPERATION", form);
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
          {/* BODY */}
          <div className={styles.modalBody}>
            {/* Тип */}
            <div className={styles.field}>
              <span className="font16w500">Тип</span>
              <button
                className={styles.selectLike}
                onClick={() => onChange("increse", !form.increse)}
              >
                <span>
                  {form.increse ? "Доход" : "Расход"}
                </span>
                <ChevronDown size={16} color={tgTheme.textSecondary} />
              </button>
            </div>

            {/* Сумма */}
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

            {/* Дата */}
            <div className={styles.field}>
              <span className="font16w500">Дата</span>
              <input
                className={styles.input}
                type="date"
                value={form.created_at}
                onChange={(e) => onChange("created_at", e.target.value)}
              />
            </div>

            {/* Машина */}
            <div className={styles.field}>
              <span className="font16w500">Автомобиль</span>
              <input
                className={styles.input}
                value={form.car_name}
                onChange={(e) => onChange("car_name", e.target.value)}
                placeholder="—"
              />
            </div>

            {/* Комментарий */}
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

          {/* FOOTER */}
          <div className={styles.modalFooter}>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate(-1)}
            >
              <span className='font14w600'>
                Отмена
              </span>
            </button>
            <button className={styles.primaryBtn} onClick={onSave}>
              <span className='font14w600'>
                Сохранить
              </span>
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
