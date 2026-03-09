import React, { useMemo, useState, useEffect } from "react";
import AppLayout from "../../../layouts/AppLayout";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./OperationPage.module.css";

import { ArrowDown, Calendar, CalendarCheck, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardEditIcon, Edit, Edit2, Eye, ListFilter, Plus, Trash2 } from "lucide-react";
import { tgTheme } from "../../../common/commonStyle";
import Tag from "../../../components/Tag/Tag";
import DateFilter from "../../../components/DateFilter/DateFilter";
import BackdropModal from "../../../components/BackdropModal/BackdropModal";
import { useDeleteTransactionMutation, useGetTransactionsQuery } from "../../../redux/services/financeApi";
import ModalComponent from "../../../components/ModalComponent/ModalComponent";
import { useGetTagsQuery } from "../../../redux/services/tagsAction";
import { parseUiDateRange } from "../../../common/utils/helpers";

const type = [
  { key: "expense", label: "Расходы" },
  { key: "income", label: "Доходы" },
  { key: "deposit_add", label: "Депозит +" },
  { key: "deposit_return", label: "Депозит -" },
];

const increasetArr = ['income', 'deposit_add']

const PAGE_SIZE = 5;

function formatDate(iso) {
  const date = new Date(iso);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(0);

  const [page, setPage] = useState(1);
  const [filterVisible, setFilterVisible] = useState(false);
  const [tagFilterVisible, setTagFilterVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState(undefined);
  const [selectedTagId, setSelectedTagId] = useState(null);

  const dateParams = useMemo(() => parseUiDateRange(dateFilter), [dateFilter]);
  const financeTagType = increasetArr.includes(key);
  const { data: tags = [] } = useGetTagsQuery();

  const filteredTags = useMemo(() => {
    return tags
  }, [financeTagType, tags]);

  const selectedTag = useMemo(() => {
    return filteredTags.find((tag) => String(tag.id) === String(selectedTagId)) || null;
  }, [filteredTags, selectedTagId]);

  const transactionParams = useMemo(() => {
    const params = {
      type: key,
      page: 1,
      per_page: 50,
    };

    if (dateParams.from) {
      params.start_date = dateParams.from;
      params.end_date = dateParams.to;
    } else {
      params.period = 'last_3_months';
    }

    if (selectedTagId != null) {
      params.finance_tag_id = selectedTagId;
    }

    return params;
  }, [dateParams.from, dateParams.to, key, selectedTagId]);

  const { data: transactionsData = { data: [] } } = useGetTransactionsQuery(transactionParams);
  const totalAmount = useMemo(() => {
    return transactionsData.data.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
  }, [transactionsData.data]);

  const [deleteTransactionAction] = useDeleteTransactionMutation();

  const [title, setTitle] = useState(type.find((el) => el.key === key)?.value || "Операции");

  const list = useMemo(() => {
    return [...transactionsData.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [transactionsData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(type.find((el) => el.key === key)?.label || "Операции")
    setPage(1);
    setSelectedTagId(null);
    setTagFilterVisible(false);
  }, [key]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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

  const deleteOperationById = () => {
    try {
      deleteTransactionAction(deleteTransactionId);
      setDeleteTransactionId(null);
      setDeleteModal(false)
    } catch (err) {
      alert('Не удалось удалить тег');
      console.log(err)
    }
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
          <button onClick={() => {
            setTagFilterVisible(false);
            setFilterVisible(true);
          }} className={styles.filterBtn}>
            <ListFilter color={tgTheme.textSecondary} size={16} />
            <span className={'font13w500'}>{title}</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
          {
            filterVisible && <>
              <BackdropModal onClick={() => setFilterVisible(false)} />
              <div className={styles.filterBlock}>
                <button onClick={() => chooseType('expense')}>
                  <span className="font14w600">
                    Расходы
                  </span>
                  {
                    key == 'expense' && <Check color={tgTheme.accent} size={20} />
                  }
                </button>
                <button onClick={() => chooseType('income')}>
                  <span className="font14w600">
                    Доходы
                  </span>
                  {
                    key == 'income' && <Check color={tgTheme.accent} size={20} />
                  }
                </button>
                <button onClick={() => chooseType('deposit_add')}>
                  <span className="font14w600">
                    Депозиты
                  </span>
                  {
                    key == 'deposit_add' && <Check color={tgTheme.accent} size={20} />
                  }
                </button>
                <button onClick={() => chooseType('deposit_return')}>
                  <span className="font14w600">
                    Депозиты возврат
                  </span>
                  {
                    key == 'deposit_return' && <Check color={tgTheme.accent} size={20} />
                  }
                </button>
              </div>
            </>
          }
        </div>
        <div className={styles.headerFilter + ' miniBlock'}>
          <button className={styles.filterBtn} onClick={() => navigate("/operations/create")}>
            <Plus color={tgTheme.textSecondary} size={16} />
            <span className={'font13w500'}>Добавить</span>
          </button>
        </div>
      </div>
      <div className={styles.header}>
        <div className={styles.headerFilter + ' miniBlock'}>
          <DateFilter date={dateFilter} setDate={setDateFilter} />
        </div>
        <div className={styles.headerFilter + ' miniBlock'}>
          <button onClick={() => {
            setFilterVisible(false);
            setTagFilterVisible((prev) => !prev);
          }} className={styles.filterBtn}>
            <span className={'font13w500'}>{selectedTag?.name || 'Все теги'}</span>
            <ChevronDown color={tgTheme.textSecondary} size={16} />
          </button>
          {
            tagFilterVisible && <>
              <BackdropModal onClick={() => setTagFilterVisible(false)} />
              <div className={styles.filterBlock} style={{ right: 0 }}>
                <button onClick={() => {
                  setSelectedTagId(null);
                  setTagFilterVisible(false);
                }}>
                  <span className="font14w600">
                    Все теги
                  </span>
                  {
                    selectedTagId == null && <Check color={tgTheme.accent} size={20} />
                  }
                </button>
                {
                  filteredTags.map((tag) => (
                    <button key={tag.id} onClick={() => {
                      setSelectedTagId(tag.id);
                      setTagFilterVisible(false);
                    }}>
                      <span className="font14w600">
                        {tag.name}
                      </span>
                      {
                        String(tag.id) === String(selectedTagId) && <Check color={tgTheme.accent} size={20} />
                      }
                    </button>
                  ))
                }
              </div>
            </>
          }
        </div>
      </div>

      {
        transactionsData?.data?.length == 0 ? <div className={'miniBlock'} style={{ textAlign: "center", paddingTop: 20 }}>
          <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>
            Транзакции отсутствуют</span>
        </div>
          : <div className={styles.section}>
            <div className={styles.totalAmountBLock}>
              <p className={'font13w400'}>Итого:</p>
              <p className={'font14w500'}>{formatMoney(totalAmount)} AED</p>
            </div>
            {transactionsData?.data?.map((item) => (
              <div key={`${key}-${item.id}`} className={styles.row} >
                <div className={styles.topLine}>
                  <div className={styles.left}>
                    <span className={'font16w500'}>#{item.id}</span>
                    <span className={'font16w500'}>{formatDate(item.created_at)}</span>
                  </div>

                  <div className={styles.sum + ' ' + (increasetArr.includes(item.type) ? styles.colorIncrease : styles.colorDecrease) + ' font14w600'}>
                    {increasetArr.includes(item.type) ? '+' : '-'}{formatMoney(item.amount)} <span className={styles.currency}>AED</span>
                  </div>
                </div>
                {console.log(item)}

                <Tag tagId={item?.finance_tag?.id} />

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
                      onClick={() => {
                        setDeleteTransactionId(item.id)
                        setDeleteModal(true)
                      }}
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
      }

      <ModalComponent visible={deleteModal} setVisible={setDeleteModal} onSave={deleteOperationById}
        textButton="Удалить" title={`Удалить транзакцию #${deleteTransactionId}?`}>
        <span className="font13w400" style={{ color: "var(--tg-text-secondary)" }}>{'После удаления её нельзя будет восстановить.'}</span>
      </ModalComponent>
    </AppLayout>
  );
}