import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import AppLayout from '../../../layouts/AppLayout';
import {
  useCreateContractTemplateMutation,
  useDeleteContractTemplateMutation,
  useGetContractTemplateQuery,
  useUpdateContractTemplateMutation,
} from '../../../redux/services/contractTemplates';
import {
  useCreateContractColorSchemeMutation,
  useGetContractColorSchemesQuery,
} from '../../../redux/services/contractColorShemes';
import ColorSelect from '../../../components/ColorSelect';
import { tgTheme } from '../../../common/commonStyle';
import { getErrorMessage, getImageUrl } from '../../../utils';
import styles from './ContractTemplatesWizzard.module.css';

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;

const DEFAULT_VALUES = {
  name: '',
  company_name: '',
  company_name_ar: '',
  company_phone: '',
  company_email: '',
  company_slogan: '',
  company_logo: '',
  color_scheme_id: null,
  is_active: false,
  is_system: false,
  remove_logo: false,
};

function sanitizeFileName(name) {
  return String(name || 'contract-template.pdf')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '_');
}

function extractFileName(disposition, fallback) {
  if (!disposition) return sanitizeFileName(fallback);

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return sanitizeFileName(decodeURIComponent(utfMatch[1]));
    } catch {
      return sanitizeFileName(fallback);
    }
  }

  const simpleMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (simpleMatch?.[1]) {
    return sanitizeFileName(simpleMatch[1]);
  }

  return sanitizeFileName(fallback);
}

function ContractTemplatesWizzard() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULT_VALUES);
  const [logoPreview, setLogoPreview] = useState({
    src: '',
    isRemote: false,
  });
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const { data, isLoading } = useGetContractTemplateQuery(id, { skip: !isEdit });
  const { data: colorSchemes = [], isLoading: loadingColors } = useGetContractColorSchemesQuery();

  const [createTemplate, { isLoading: creating }] = useCreateContractTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateContractTemplateMutation();
  const [createColorScheme, { isLoading: loadingCreateColor }] = useCreateContractColorSchemeMutation();
  const [deleteTemplate, { isLoading: deleting }] = useDeleteContractTemplateMutation();

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    setForm({
      name: data.name ?? DEFAULT_VALUES.name,
      company_name: data.company_name ?? DEFAULT_VALUES.company_name,
      company_name_ar: data.company_name_ar ?? DEFAULT_VALUES.company_name_ar,
      company_phone: data.company_phone ?? DEFAULT_VALUES.company_phone,
      company_email: data.company_email ?? DEFAULT_VALUES.company_email,
      company_slogan: data.company_slogan ?? DEFAULT_VALUES.company_slogan,
      company_logo: data.company_logo ?? DEFAULT_VALUES.company_logo,
      color_scheme_id: data.color_scheme_id ?? DEFAULT_VALUES.color_scheme_id,
      is_active: Boolean(data.is_active),
      is_system: Boolean(data.is_system),
      remove_logo: false,
    });

    if (data.company_logo) {
      setLogoPreview({
        src: data.company_logo,
        isRemote: true,
      });
    } else {
      setLogoPreview({ src: '', isRemote: false });
    }
  }, [data]);

  useEffect(() => {
    if (isEdit) return;
    if (!Array.isArray(colorSchemes) || colorSchemes.length === 0) return;

    const defaultScheme = colorSchemes.find((item) => item.is_default) || colorSchemes[0];

    setForm((prev) => {
      if (prev.color_scheme_id !== null && prev.color_scheme_id !== undefined) {
        return prev;
      }

      return {
        ...prev,
        color_scheme_id: defaultScheme?.id ?? null,
      };
    });
  }, [colorSchemes, isEdit]);

  const saving = creating || updating;
  const canEditFields = !(isEdit && form.is_system);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!String(form.name || '').trim()) {
      alert('Название шаблона обязательно');
      return;
    }

    const fd = new FormData();

    fd.append('name', String(form.name || '').trim());
    fd.append('company_name', form.company_name || DEFAULT_VALUES.company_name);
    fd.append('company_name_ar', form.company_name_ar || DEFAULT_VALUES.company_name_ar);
    fd.append('company_phone', form.company_phone || DEFAULT_VALUES.company_phone);
    fd.append('company_email', form.company_email || DEFAULT_VALUES.company_email);
    fd.append('company_slogan', form.company_slogan || DEFAULT_VALUES.company_slogan);
    fd.append('is_active', form.is_active ? '1' : '0');

    if (form.color_scheme_id !== null && form.color_scheme_id !== undefined && form.color_scheme_id !== '') {
      fd.append('color_scheme_id', String(form.color_scheme_id));
    }

    if (form.remove_logo) {
      fd.append('remove_logo', '1');
    }

    if (form.company_logo instanceof File) {
      fd.append('company_logo', form.company_logo);
    }

    try {
      if (isEdit) {
        fd.append('_method', 'PUT');
        await updateTemplate({ id, data: fd }).unwrap();
      } else {
        await createTemplate(fd).unwrap();
      }
      navigate('/contracts/templates');
    } catch (error) {
      alert(getErrorMessage(error, 'Ошибка сохранения шаблона'));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Максимальный размер логотипа 2 MB');
      return;
    }

    setForm((prev) => ({
      ...prev,
      company_logo: file,
      remove_logo: false,
    }));

    setLogoPreview({
      src: URL.createObjectURL(file),
      isRemote: false,
    });
  };

  const clearLogo = () => {
    const hasRemoteLogo =
      logoPreview.isRemote || (typeof form.company_logo === 'string' && form.company_logo !== '');

    setForm((prev) => ({
      ...prev,
      company_logo: '',
      remove_logo: hasRemoteLogo,
    }));

    setLogoPreview({ src: '', isRemote: false });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddColor = async ({ name, color }) => {
    const res = await createColorScheme({ name, color }).unwrap();

    if (res?.id) {
      setForm((prev) => ({
        ...prev,
        color_scheme_id: res.id,
      }));
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;

    const ok = window.confirm('Удалить шаблон? Он будет недоступен.');
    if (!ok) return;

    try {
      await deleteTemplate(id).unwrap();
      navigate('/contracts/templates');
    } catch (error) {
      alert(getErrorMessage(error, 'Ошибка удаления шаблона'));
    }
  };

  const handleDownloadPdf = async () => {
    if (!isEdit) return;

    setDownloadingPdf(true);
    try {
      const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      const response = await fetch(`${API_BASE}/contract-templates/${id}/pdf`, {
        method: 'GET',
        headers: tgUserId
          ? {
              'X-Telegram-User': String(tgUserId),
            }
          : {},
      });

      if (!response.ok) {
        let message = 'Не удалось скачать PDF шаблона';
        try {
          const payload = await response.json();
          if (payload?.message) {
            message = payload.message;
          }
        } catch {
          // Ignore 
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const contentDisposition =
        response.headers.get('Content-Disposition') || response.headers.get('content-disposition');
      const fallbackName = `${sanitizeFileName(form.name || `contract-template-${id}`)}.pdf`;
      const fileName = extractFileName(contentDisposition, fallbackName);

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      alert(getErrorMessage(error, 'Ошибка скачивания PDF'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const saveButtonText = saving ? 'Сохранение...' : canEditFields ? 'Сохранить' : 'Сохранить статус';

  return (
    <AppLayout
      title={isEdit ? 'Детали шаблона' : 'Создание шаблона'}
      onBack={() => navigate(-1)}
    >
      {isLoading || loadingColors ? (
        <div className="loader-wrap">
          <div className="loader" />
        </div>
      ) : (
        <div className={styles.page}>
          {isEdit && (
            <div className={`${styles.toolbar} miniBlock`}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
              >
                <FileDown size={16} color={tgTheme.textSecondary} />
                <span className="font13w500">
                  {downloadingPdf ? 'Скачивание...' : 'Скачать PDF'}
                </span>
              </button>

              <div className={styles.tags}>
                <span className={`${styles.badge} ${form.is_active ? styles.badgeActive : styles.badgeMuted}`}>
                  {form.is_active ? 'Активный' : 'Неактивный'}
                </span>
                {form.is_system && (
                  <span className={`${styles.badge} ${styles.badgeSystem}`}>
                    Системный
                  </span>
                )}
              </div>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.card}>
              <h2 className="font18w600">Основные данные</h2>

              <div className={styles.field}>
                <label className={styles.label}>Название шаблона *</label>
                <input
                  className={styles.input}
                  value={form.name}
                  name='name'
                  onChange={handleChange}
                  required
                  disabled={!canEditFields}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Название компании *</label>
                <input
                  className={styles.input}
                  name='company_name'
                  value={form.company_name}
                  onChange={handleChange}
                  disabled={!canEditFields}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Название компании (арабский) *</label>
                <input
                  className={styles.input}
                  name='company_name_ar'
                  value={form.company_name_ar}
                  onChange={handleChange}
                  disabled={!canEditFields}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Телефон</label>
                <input
                  className={styles.input}
                  name='company_phone'
                  value={form.company_phone}
                  onChange={handleChange}
                  disabled={!canEditFields}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  name='company_email'
                  value={form.company_email}
                  onChange={handleChange}
                  disabled={!canEditFields}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Слоган</label>
                <input
                  className={styles.input}
                  name='company_slogan'
                  value={form.company_slogan}
                  onChange={handleChange}
                  disabled={!canEditFields}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Цвет шаблона</label>
                <ColorSelect
                  value={form.color_scheme_id}
                  options={colorSchemes}
                  onChange={(colorSchemeId) =>
                    setForm((prev) => ({ ...prev, color_scheme_id: colorSchemeId }))
                  }
                  onAdd={handleAddColor}
                  loading={loadingCreateColor}
                  disabled={!canEditFields}
                />
              </div>

              <div className={styles.switchField}>
                <div>
                  <span className="font14w500">Активность шаблона</span>
                  <p className={styles.switchDescription}>
                    Активный шаблон будет выбран по умолчанию.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(form.is_active)}
                  className={`${styles.switch} ${form.is_active ? styles.switchActive : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                >
                  <span className={styles.switchThumb} />
                </button>
              </div>

              {canEditFields && (
                <div className={styles.imageUpload}>
                  <label className={styles.label}>Логотип компании</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className={styles.fileInput}
                  />

                  {logoPreview.src && (
                    <div className={styles.imagePreview}>
                      <img
                        src={logoPreview.isRemote ? getImageUrl(logoPreview.src) : logoPreview.src}
                        alt="logo-preview"
                      />
                      <button
                        type="button"
                        className={styles.removeLogoBtn}
                        onClick={clearLogo}
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.footerActions}>
              <button type="submit" className={styles.primaryBtn} disabled={saving}>
                <span className="font14w600">{saveButtonText}</span>
              </button>

              {isEdit && !form.is_system && (
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <span className="font14w600">
                    {deleting ? 'Удаление...' : 'Удалить'}
                  </span>
                </button>
              )}

              <button type="button" className={styles.secondaryBtn} onClick={() => navigate(-1)}>
                <span className="font14w600">Отмена</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}

export default ContractTemplatesWizzard;
