import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../../../layouts/AppLayout';
import { tgTheme } from '../../../../common/commonStyle';
import { getErrorMessage, getImageUrl } from '../../../../utils';
import { Check, ChevronDown, Images, Plus, Trash2, X } from 'lucide-react';
import BackdropModal from '../../../../components/BackdropModal/BackdropModal';
import {
  useGetOneQuery,
  useCreateMutation,
  useUpdateMutation,
} from '../../../../redux/services/maintenanceItemApi';
import styles from './MaintenanceEditPage.module.css';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Ожидание' },
  { key: 'process', label: 'В процессе' },
  { key: 'completed', label: 'Завершено' },
];

export default function MaintenanceEditPage() {
  const navigate = useNavigate();
  const { id: carId, itemId } = useParams();
  const isEdit = Boolean(itemId);
  const fileRef = useRef(null);

  const { data: itemData, isLoading: loading } = useGetOneQuery(itemId, { skip: !isEdit });
  const [createItem, { isLoading: creating }] = useCreateMutation();
  const [updateItem, { isLoading: updating }] = useUpdateMutation();

  const item = itemData?.data || itemData;
  const saving = creating || updating;

  const [form, setForm] = useState({
    name: '',
    location: '',
    status: 'pending',
    date_start: '',
    date_end: '',
  });
  const [statusOpen, setStatusOpen] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && item && isEdit) {
    setForm({
      name: item.name || '',
      location: item.location || '',
      status: item.status || 'pending',
      date_start: item.date_start || '',
      date_end: item.date_end || '',
    });
    setExistingImages(item.images || []);
    setInitialized(true);
  }

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const valid = files.filter((f) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        alert('Допустимые форматы: JPG, PNG, WEBP');
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert('Максимальный размер: 5 МБ');
        return false;
      }
      return true;
    });

    setNewImages((prev) => [...prev, ...valid]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Введите название');
      return;
    }

    try {
      const payload = {
        car_id: carId,
        name: form.name.trim(),
        location: form.location.trim(),
        status: form.status,
        date_start: form.date_start,
        date_end: form.date_end,
        images: newImages,
      };

      if (isEdit) {
        await updateItem({ id: itemId, ...payload }).unwrap();
      } else {
        await createItem(payload).unwrap();
      }

      navigate(-1);
    } catch (err) {
      alert(`Ошибка: ${getErrorMessage(err)}`);
    }
  };

  if (isEdit && loading) {
    return (
      <AppLayout title="ТО" onBack={() => navigate(-1)}>
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={isEdit ? 'Редактировать ТО' : 'Новое ТО'}
      onBack={() => navigate(-1)}
    >
      <div className={styles.pageWrapper}>
        <div className={styles.modalLike}>
          <div className={styles.modalBody}>

            {/* NAME */}
            <div className={styles.field}>
              <span className="font16w500">Название</span>
              <input
                className={styles.input}
                type="text"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Название работы"
              />
            </div>

            {/* LOCATION */}
            <div className={styles.field}>
              <span className="font16w500">Локация</span>
              <input
                className={styles.input}
                type="text"
                value={form.location}
                onChange={(e) => onChange('location', e.target.value)}
                placeholder="Адрес / сервис"
              />
            </div>

            {/* STATUS */}
            <div className={styles.field}>
              <span className="font16w500">Статус</span>
              <div className={styles.selectWrapper}>
                <button
                  className={styles.selectLike}
                  onClick={() => setStatusOpen((p) => !p)}
                >
                  <span className="font14w600">
                    {STATUS_OPTIONS.find((o) => o.key === form.status)?.label}
                  </span>
                  <ChevronDown size={16} color={tgTheme.textSecondary} />
                </button>

                {statusOpen && (
                  <>
                    <BackdropModal onClick={() => setStatusOpen(false)} />
                    <div className={styles.dropdown}>
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            onChange('status', opt.key);
                            setStatusOpen(false);
                          }}
                        >
                          <span className="font14w600">{opt.label}</span>
                          {opt.key === form.status && (
                            <Check color={tgTheme.accent} size={20} />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DATE START */}
            <div className={styles.field}>
              <span className="font16w500">Дата начала</span>
              <input
                className={styles.input}
                type="date"
                value={form.date_start}
                onChange={(e) => onChange('date_start', e.target.value)}
              />
            </div>

            {/* DATE END */}
            <div className={styles.field}>
              <span className="font16w500">Дата окончания</span>
              <input
                className={styles.input}
                type="date"
                value={form.date_end}
                onChange={(e) => onChange('date_end', e.target.value)}
              />
            </div>

            {/* IMAGES */}
            <div className={styles.field}>
              <span className="font16w500">Фото</span>

              <div className={styles.imagesGrid}>
                {existingImages.map((img, i) => (
                  <div key={`ex-${img.id || i}`} className={styles.imageThumb}>
                    <img src={getImageUrl(img.path || img.image_url)} alt="" />
                    <button
                      className={styles.imageRemove}
                      onClick={() => removeExistingImage(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {newImages.map((file, i) => (
                  <div key={`new-${i}`} className={styles.imageThumb}>
                    <img src={URL.createObjectURL(file)} alt="" />
                    <button
                      className={styles.imageRemove}
                      onClick={() => removeNewImage(i)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleAddImages}
              />
              <button
                className={styles.addBtn}
                onClick={() => fileRef.current?.click()}
              >
                <Images size={16} color={tgTheme.textSecondary} />
                <span className="font12w400">Добавить фото</span>
              </button>
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
              onClick={handleSave}
              disabled={saving}
            >
              <span className="font14w600">
                {saving ? 'Сохранение…' : 'Сохранить'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
