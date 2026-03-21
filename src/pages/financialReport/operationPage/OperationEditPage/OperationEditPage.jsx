import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../../layouts/AppLayout";
import styles from "./OperationEditPage.module.css";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Images, Maximize2, Plus, Trash, Trash2 } from "lucide-react";
import { tgTheme } from "../../../../common/commonStyle";
import { useGetTagsQuery } from "../../../../redux/services/tagsAction";
import { useCreateTransactionMutation, useDeleteTransactionAttachmentMutation, useGetTransactionByIdQuery, useUpdateTransactionMutation, useUploadTransactionAttachmentMutation } from "../../../../redux/services/financeApi";
import { useGetAllOrdersQuery } from "../../../../redux/services/orders";
import InfoModal from "../../../../components/InfoModal/InfoModal";
import { useGetCarsQuery } from "../../../../redux/services/carAction";
import BackdropModal from "../../../../components/BackdropModal/BackdropModal";
import CustomButton from "../../../../components/CustomButton/CustomButton";
import ImageModal from "./ImageModal/ImageModal";
import SearchSelect from "../../../../components/SearchSelect/SearchSelect";

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

const increasetArr = ['income', 'deposit_add']

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

export default function OperationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams() || {};

  const { data = {} } = useGetTransactionByIdQuery(id, {
    skip: !id,
  });

  const isEdit = Boolean(id);
  const { data: tags = [] } = useGetTagsQuery();
  const { data: orders = [] } = useGetAllOrdersQuery();
  const { data: cars = { cars: [] } } = useGetCarsQuery();

  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [uploadAttachment] = useUploadTransactionAttachmentMutation();
  const [deleteAttachment] = useDeleteTransactionAttachmentMutation();

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

  const [typeOpen, setTypeOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [imgFullModal, setImgFullModal] = useState(false);

  const orderOptions = useMemo(() =>
    orders.map(o => ({
      id: o.id,
      label: o.customer_name || `Заказ #${o.id}`,
      sub: o.car ? `${o.car.car_name} (${o.car.car_number})` : null,
    })),
    [orders]
  );

  const carOptions = useMemo(() =>
    (cars.cars || []).map(c => ({
      id: c.car_number,
      label: `${c.car_name} (${c.car_number})`,
      sub: c.car_class || null,
    })),
    [cars.cars]
  );

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(data?.attachment?.url || null);
  const fileInputRef = useRef(null);

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

    setPhotoPreview(data?.attachment?.url || null);

  }, [id, data?.id, data.type, data.amount, data.finance_tag_ids, data.description, data.currency, data.order_id, data.car_number, data.customer_name, data.car_name, data?.attachment]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

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
      if (selectedPhoto) {
        await uploadAttachment({
          id: data.id,
          file: selectedPhoto,
        }).unwrap();

        setSelectedPhoto(null);
      }
      if (data.attachment && !photoPreview) {
        await deleteAttachment(data.id).unwrap();

        setPhotoPreview(null);
        setSelectedPhoto(null);
      }
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

        {
          id && <div className={styles.transactionView}>
            <div className={styles.amountBlock}>
              <span
                className={
                  increasetArr.includes(data.type)
                    ? styles.amountIncome
                    : styles.amountExpense
                }
              >
                {increasetArr.includes(data.type) ? "+" : "-"}
                {formatMoney(data.amount)} {data.currency}
              </span>
            </div>
            <div className={styles.infoBlock}>

              {data.finance_tags?.length > 0 && (
                <div className={styles.row}>
                  <span className={styles.label}>Теги:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>
                    {data.finance_tags.map(el => el.name).join(", ")}
                  </span>
                </div>
              )}

              {data.created_at && (
                <div className={styles.row}>
                  <span className={styles.label}>Дата:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>
                    {formatDate(data.created_at)}
                  </span>
                </div>
              )}

              {data.car_name && (
                <div className={styles.row}>
                  <span className={styles.label}>Автомобиль:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>{data.car_name} ({data.car_number})</span>
                </div>
              )}

              {data.car_number && (
                <div className={styles.row}>
                  <span className={styles.label}>Номер авто:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>{data.car_number}</span>
                </div>
              )}

              {data.customer_name && (
                <div className={styles.row}>
                  <span className={styles.label}>Клиент:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>{data.customer_name}</span>
                </div>
              )}

              {data.order_id && (
                <div className={styles.row}>
                  <span className={styles.label}>Заказ:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>#{data.order_id}</span>
                </div>
              )}

              {data.description && (
                <div className={styles.row}>
                  <span className={styles.label}>Комментарий:</span>
                  <span className={'font14w500'} style={{ textAlign: 'right' }}>{data.description}</span>
                </div>
              )}

            </div>
          </div>
        }

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
              <SearchSelect
                options={orderOptions}
                value={form.order_id}
                onChange={(id) => onChange('order_id', id)}
                placeholder="Поиск заказа..."
                emptyLabel="Без заказа"
              />
            </div>

            <div className={styles.field}>
              <span className="font16w500">Авто</span>
              <SearchSelect
                options={carOptions}
                value={form.car_number || null}
                onChange={(carNumber) => {
                  const car = (cars.cars || []).find(c => c.car_number === carNumber);
                  setForm(prev => ({
                    ...prev,
                    car_number: carNumber || '',
                    car_name: car?.car_name || '',
                  }));
                }}
                placeholder="Поиск авто..."
                emptyLabel="Без авто"
              />
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

            {/* ФОТО */}
            <div className={styles.field}>
              <span className="font16w500">Фото</span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoSelect}
              />

              <div>
                {
                  photoPreview ? <div className={styles.displayPhoto}>
                    <img
                      src={photoPreview}
                      alt="photo"
                      className={styles.img}
                      style={{ width: 200, height: 100, objectFit: "contain", borderRadius: 8 }}
                    />
                    <div className={styles.imageBtnsBlock}>
                      <button className={styles.imageMaximizeBtn} type="button" onClick={() => {
                        setImgFullModal(true)
                      }}><Maximize2 color={tgTheme.white} size={20} /></button>
                      <button className={styles.imageChangeBtn} onClick={() => openFilePicker((p) => !p)}><Images color={tgTheme.white} size={20} /></button>
                      <button className={styles.imageTrashBtn} onClick={() => {
                        setSelectedPhoto(null);
                        setPhotoPreview(null);
                      }}><Trash2 color={tgTheme.white} size={20} /></button>
                    </div>
                  </div>
                    :
                    <button
                      className={styles.addTagsBtn}
                      onClick={() => openFilePicker((p) => !p)}
                    >
                      <span className="font12w400">
                        добавить фото
                      </span>
                      <Plus size={16} color={tgTheme.textSecondary} />
                    </button>
                }
              </div>
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
      <ImageModal
        visible={imgFullModal}
        image={photoPreview}
        onClose={() => setImgFullModal(false)}
      />
      <InfoModal visible={error.trim()} setVisible={() => setError('')} text={error} textButton="Ок" />
    </AppLayout>
  );
}

