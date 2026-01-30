import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./OperationPage.module.css";

import { transactions, deposit } from "../../../common/mockData";
import { ArrowDown, Calendar, CalendarCheck, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardEditIcon, Edit, Edit2, Eye, ListFilter, Plus, Trash2 } from "lucide-react";
import { tgTheme } from "../../../common/commonStyle";
import Tag from "../../../components/Tag/Tag";
import { useGetTagsQuery } from "../../../redux/services/tagsAction";

const type = [
  { key: "increase", value: "Доходы" },
  { key: "decrease", value: "Расходы" },
  { key: "deposit", value: "Депозиты" },
];

const PAGE_SIZE = 5;

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OperationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [key, setKey] = useState(location.state?.key);

  const [title, setTitle] = useState(type.find((el) => el.key === key)?.value || "Операции");

  const [page, setPage] = useState(1);
  const [filterVisible, setFilterVisible] = useState(false);

  const list = useMemo(() => {
    let data = [];

    if (key === "deposit") {
      data = deposit;
    } else {
      data = transactions.filter((t) =>
        key === "increase" ? t.increse === true : t.increse === false
      );
    }

    return [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [key]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(type.find((el) => el.key === key)?.value || "Операции")
    setPage(1);
  }, [key]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return list.slice(start, end);
  }, [list, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  const chooseType = (key) => {
    setFilterVisible(false);
    setKey(key);
  }

  return (
    <AppLayout
      onBack={() => navigate(-1)}
      title={`${title} (стр. ${page})`}
    >
      {/* список */}
      <div className={styles.header}>
        <div className={styles.headerFilter + ' miniBlock'}>
          <span className="font16w600">Тип</span>
          <button onClick={() => setFilterVisible(true)} className={styles.filterBtn}>
            <ListFilter color={tgTheme.textSecondary} size={16} />
            <span className={'font13w500'}>{title}</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
          {
            filterVisible && <div className={styles.filterBlock}>
              <button onClick={() => chooseType('decrease')}>
                <span className="font14w600">
                  Расходы
                </span>
                {
                  key == 'decrease' && <Check color={tgTheme.accent} size={22} />
                }
              </button>
              <button onClick={() => chooseType('increase')}>
                <span className="font14w600">
                  Доходы
                </span>
                {
                  key == 'increase' && <Check color={tgTheme.accent} size={22} />
                }
              </button>
              <button onClick={() => chooseType('deposit')}>
                <span className="font14w600">
                  Депозиты
                </span>
                {
                  key == 'deposit' && <Check color={tgTheme.accent} size={22} />
                }
              </button>
            </div>
          }
        </div>
        <div className={styles.headerFilter + ' miniBlock'}>
          <button onClick={() => { }} className={styles.filterBtn}>
            <Calendar color={tgTheme.textSecondary} size={16} />
            <span className={'font13w500'}>01.02-01.02</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
        </div>
      </div>
      <div className={styles.headerFilter + ' miniBlock'}>
        <button className={styles.filterBtn} onClick={() => navigate("/operations/create")}>
          <Plus color={tgTheme.textSecondary} size={16} />
          <span className={'font13w500'}>Добавить</span>
        </button>
      </div>
      <div className={styles.section}>
        {pageData.map((item) => (
          <div key={`${key}-${item.id}`} className={styles.row} >
            <div className={styles.topLine}>
              <div className={styles.left}>
                <span className={'font16w500'}>#{item.id}</span>
                <span className={'font16w500'}>{formatDate(item.created_at)}</span>
              </div>

              <div className={styles.sum + ' ' + (item.increse ? styles.colorIncrease : styles.colorDecrease) + ' font14w600'}>
                {item.increse ? '+' : '-'}{formatMoney(item.sum)} <span className={styles.currency}>AED</span>
              </div>
            </div>

            <Tag />

            <div className={styles.cardFooter}>
              <div className={styles.bottomLine}>
                <div className={'font14w500'}>{item.car_name || "—"}</div>
                <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>{item.description || ""}</span>
              </div>
              <div className={styles.right}>
                <button
                  className={styles.btn}
                  onClick={() => navigate(`/operations/${item.id}/edit`)}
                >
                  <ClipboardEditIcon size={16} color={tgTheme.text} strokeWidth={1.5} />
                </button>
                <button
                  className={styles.btn}
                  onClick={() => { }}
                >
                  <Trash2 size={16} color={tgTheme.text} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* пагинация */}
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={handlePrev}
            disabled={!canPrev}
          >
            <ChevronLeft color={tgTheme.btnActive} />
          </button>

          <div className={styles.pageInfo}>
            {page} / {totalPages}
          </div>

          <button
            type="button"
            className={styles.pageBtn}
            onClick={handleNext}
            disabled={!canNext}
          >
            <ChevronRight color={tgTheme.btnActive} />
          </button>
        </div>
      </div>

    </AppLayout>
  );
}
