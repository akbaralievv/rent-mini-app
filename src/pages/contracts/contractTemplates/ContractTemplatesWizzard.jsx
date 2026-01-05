import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../../layouts/AppLayout';
import { useCreateContractTemplateMutation, useDeleteContractTemplateMutation, useGetContractTemplateQuery, useUpdateContractTemplateMutation } from '../../../redux/services/contractTemplates';
import { useCreateContractColorSchemeMutation, useGetContractColorSchemesQuery } from '../../../redux/services/contractColorShemes';
import ColorSelect from '../../../components/ColorSelect';
import { getErrorMessage, getImageUrl } from '../../../utils';

const DEFAULT_VALUES = {
    company_name: '',
    company_name_ar: '',
    company_phone: '',
    company_email: '',
    company_slogan: '',
    company_logo: '',
    color_scheme_id: 1,
};

function ContractTemplatesWizzard() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [form, setForm] = useState(DEFAULT_VALUES);
    const [logoPreview, setLogoPreview] = useState({
        src: '',
        isRemote: false,
    });
    const { data, isLoading } = useGetContractTemplateQuery(id, { skip: !isEdit });
    const { data: colorSchemes = [], isLoading: loadingColors } = useGetContractColorSchemesQuery();
    const [createTemplate, { isLoading: creating }] =
        useCreateContractTemplateMutation();
    const [updateTemplate, { isLoading: updating }] =
        useUpdateContractTemplateMutation();
    const [createColorScheme,{isLoading:loadingCreateColor}] = useCreateContractColorSchemeMutation()
    const [deleteTemplate, { isLoading: deleting }] =
        useDeleteContractTemplateMutation();

    const fileInputRef=useRef()

    useEffect(() => {
        if (!data) return;
        /* eslint-disable */
        setForm({
            ...DEFAULT_VALUES,
            ...data,
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

    const saving = creating || updating;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            alert('Название шаблона обязательно');
            return;
        }

        const fd = new FormData();

        fd.append('name', form.name.trim());
        fd.append('company_name', form.company_name || DEFAULT_VALUES.company_name);
        fd.append('company_name_ar', form.company_name_ar || DEFAULT_VALUES.company_name_ar);
        fd.append('company_phone', form.company_phone || DEFAULT_VALUES.company_phone);
        fd.append('company_email', form.company_email || DEFAULT_VALUES.company_email);
        fd.append('company_slogan', form.company_slogan || DEFAULT_VALUES.company_slogan);
        fd.append('color_scheme_id', form.color_scheme_id);

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
        } catch (e) {
            alert(getErrorMessage(e, 'Ошибка сохранения шаблона'));
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
            alert('Максимальный размер логотипа — 2MB');
            return;
        }

        setForm((prev) => ({
            ...prev,
            company_logo: file,
        }));

        setLogoPreview({
            src: URL.createObjectURL(file),
            isRemote: false,
        });
    };

    const clearLogo = () => {
        setForm((prev) => ({ ...prev, company_logo: '' }));
        setLogoPreview({ src: '', isRemote: false });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddColor = async ({ name, color }) => {
        const res = await createColorScheme({ name, color }).unwrap();

        if (res?.id) {
            setForm((f) => ({
                ...f,
                color_scheme_id: res.id,
            }));
        }
    };

    const handleDelete = async () => {
        if (!isEdit) return;

        const ok = window.confirm('Удалить шаблон? Он будет скрыт и недоступен.');
        if (!ok) return;

        try {
            await deleteTemplate(id).unwrap();
            navigate('/contracts/templates');
        } catch (e) {
            alert(getErrorMessage(e, 'Ошибка удаления шаблона'));
        }
    };
    const isReadOnly = isEdit && form.is_system;

  return (
     <AppLayout
          title={isEdit ? 'Редактирование шаблона' : 'Создание шаблона'}
          onBack={() => navigate(-1)}>
            {
              isLoading || loadingColors ? <div className="loader-wrap">
                  <div className="loader" />
              </div> :
                  <form className="template-wizard" onSubmit={handleSubmit}>
                      <div className="card">
                          <div>
                              <label>Название шаблона *</label>
                              <input
                                  className="input"
                                  value={form.name}
                                  name='name'
                                  onChange={handleChange}
                                  required
                                  disabled={isReadOnly}
                              />
                          </div>

                          <div>
                              <label>Название компании *</label>
                              <input
                                  className="input"
                                  name='company_name'
                                  value={form.company_name}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                  required
                              />
                          </div>
                          <div>
                              <label>Название компании (Арабский) *</label>
                              <input
                                  className="input"
                                  name='company_name_ar'
                                  value={form.company_name_ar}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                  required
                              />
                          </div>

                          <div>
                              <label>Телефон</label>
                              <input
                                  className="input"
                                  name='company_phone'
                                  value={form.company_phone}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                              />
                          </div>

                          <div>
                              <label>Email</label>
                              <input
                                  className="input"
                                  name='company_email'
                                  value={form.company_email}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                              />
                          </div>

                          <div>
                              <label>Слоган</label>
                              <input
                                  className="input"
                                  name='company_slogan'
                                  value={form.company_slogan}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                              />
                          </div>
                          <div>
                              <label>Цвет шаблона</label>
                              <ColorSelect
                                  value={form.color_scheme_id}
                                  options={colorSchemes}
                                  onChange={(id) =>
                                      setForm((f) => ({ ...f, color_scheme_id: id }))
                                  }
                                  onAdd={handleAddColor}
                                  loading={loadingCreateColor}
                                  disabled={isReadOnly}
                              />
                          </div>
                          {!isReadOnly&&<div className="image-upload">
                              <label className="image-label">Логотип компании</label>

                              <input disabled={isReadOnly} ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload}/>

                              {logoPreview.src && (
                                  <div className="image-preview">
                                      <img src={logoPreview.isRemote ? getImageUrl(logoPreview.src) : logoPreview.src} alt="preview" />
                                      <button
                                          type="button"
                                          className="remove-logo-btn"
                                          onClick={clearLogo}
                                      >
                                          ✕
                                      </button>
                                  </div>

                              )}
                          </div>}
                      </div>
                      <div className="wizard-actions">
                          {!form.is_system && (<button type="submit" disabled={saving}>
                              {saving ? 'Сохранение…' : 'Сохранить'}
                          </button>)}
                          {!form.is_system && (
                              <button
                                  type="button"
                                  className="danger-btn"
                                  onClick={handleDelete}
                                  disabled={deleting}
                              >
                                  {deleting ? 'Удаление…' : 'Удалить'}
                              </button>
                          )}
                          <button type="button" onClick={() => navigate(-1)}>
                              Отмена
                          </button>
                      </div>
                  </form>
            }
    </AppLayout>
  )
}

export default ContractTemplatesWizzard