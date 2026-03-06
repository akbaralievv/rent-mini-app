import React, { useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import { CalendarDays, Check, ChevronDown, FileDown, Tag as TagIcon } from 'lucide-react';
import styles from './ExportFiltersPage.module.css';
import AppLayout from '../../../layouts/AppLayout';
import { useNavigate } from 'react-router-dom';
import { tgTheme } from '../../../common/commonStyle';
import { useGetTagsQuery } from '../../../redux/services/tagsAction';
import { useExportTransactionsMutation } from '../../../redux/services/financeApi';
import BackdropModal from '../../../components/BackdropModal/BackdropModal';
import CalendarCustom from '../../../components/CalendarCustom/CalendarCustom';
import { formatDate, uiToIsoDate } from '../../../common/utils/helpers';
import { getErrorMessage } from '../../../utils';

const PERIOD_OPTIONS = [
  { key: 'custom_range', label: 'По календарю' },
  { key: 'last_3_months', label: 'За 3 месяца' },
  { key: 'last_6_months', label: 'За 6 месяцев' },
  { key: 'current_month', label: 'Текущий месяц' },
  { key: 'last_month', label: 'Прошлый месяц' },
  { key: 'current_year', label: 'Текущий год' },
  { key: 'last_year', label: 'Прошлый год' },
  { key: 'all_time', label: 'За все время' },
];

const EXPORT_TYPES = 'income,expense,deposit_add,deposit_return';

function formatRangeLabel(startDate, endDate) {
  if (!startDate) return 'Выберите период';

  const start = formatDate(startDate);
  const end = formatDate(endDate || startDate);

  return `${start} - ${end}`;
}

function parseCalendarRange(value) {
  if (!value) {
    return { start_date: '', end_date: '' };
  }

  const [startRaw, endRaw] = value.split('/');

  return {
    start_date: uiToIsoDate(startRaw),
    end_date: uiToIsoDate(endRaw || startRaw),
  };
}

function buildExportParams({ periodKey, customRange, tagId }) {
  const params = {
    type: EXPORT_TYPES,
    order: 'desc',
  };

  if (tagId) {
    params.finance_tag_id = tagId;
  }

  if (periodKey === 'custom_range') {
    params.start_date = customRange.start_date;
    params.end_date = customRange.end_date || customRange.start_date;
  } else {
    params.period = periodKey;
  }

  return params;
}

export default function ExportFiltersPage() {
  const navigate = useNavigate();
  const { data: tags = [] } = useGetTagsQuery();
  const [exportTransactions, { isLoading }] = useExportTransactionsMutation();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState('');
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [customRange, setCustomRange] = useState({
    start_date: '',
    end_date: '',
  });
  const [errorText, setErrorText] = useState('');

  const selectedTag = useMemo(
    () => tags.find((tag) => String(tag.id) === String(selectedTagId)),
    [selectedTagId, tags]
  );

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriodKey === 'custom_range') {
      return formatRangeLabel(customRange.start_date, customRange.end_date);
    }

    return PERIOD_OPTIONS.find((option) => option.key === selectedPeriodKey)?.label || 'Выберите период';
  }, [customRange.end_date, customRange.start_date, selectedPeriodKey]);

  const selectedTagLabel = selectedTag?.name || 'Выбрать тег';

  const toggleDropdown = (name) => {
    setErrorText('');
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const handlePeriodSelect = (option) => {
    setErrorText('');

    if (option.key === 'custom_range') {
      setOpenDropdown(null);
      setCalendarVisible(true);
      return;
    }

    setSelectedPeriodKey(option.key);
    setOpenDropdown(null);
  };

  const handleCalendarApply = (value) => {
    const range = parseCalendarRange(value);
    setCustomRange(range);
    setSelectedPeriodKey('custom_range');
    setErrorText('');
  };

  const handleDownload = async () => {
    if (!selectedPeriodKey) {
      setErrorText('Выберите период для экспорта.');
      return;
    }

    if (selectedPeriodKey === 'custom_range' && !customRange.start_date) {
      setErrorText('Выберите период по календарю.');
      return;
    }

    setErrorText('');

    try {
      const result = await exportTransactions(
        buildExportParams({
          periodKey: selectedPeriodKey,
          customRange,
          tagId: selectedTagId,
        })
      ).unwrap();

      saveAs(result.blob, result.fileName || 'finance_transactions_export.xlsx');
    } catch (error) {
      console.error(error);
      setErrorText(getErrorMessage(error, 'Не удалось скачать Excel-отчет.'));
    }
  };

  return (
    <AppLayout onBack={() => navigate(-1)} title="Экспорт по фильтрам">
      {openDropdown && <BackdropModal onClick={() => setOpenDropdown(null)} />}

      <div className={styles.page}>
        <div className={styles.fileCard}>
          <div className={styles.fileBlock}>
            <div className={styles.fileIcon}>
              <FileDown strokeWidth={1.5} color={tgTheme.text} />
            </div>

            <div className={styles.fileInfo}>
              <div className={styles.fileName}>finance_transactions_export.xlsx</div>
              <div className={styles.fileMeta}>
                <span>{selectedPeriodKey ? selectedPeriodLabel : 'Период не выбран'}</span>
                <span className={styles.dot}>•</span>
                <span>{selectedTag?.name || 'Все теги'}</span>
              </div>
            </div>
          </div>

          <div className="miniBlock">
            <span className={`font13w400 ${styles.helperText}`}>
              Отчет выгружается в Excel и учитывает выбранный период и тег транзакции.
            </span>
          </div>
        </div>

        <div className={styles.filtersCard}>
          <div className={styles.field}>
            <span className="font16w500">Период</span>

            <div className={styles.selectWrapper}>
              <button
                type="button"
                className={styles.selectLike}
                onClick={() => toggleDropdown('period')}
              >
                <div className={styles.selectValue}>
                  <CalendarDays size={16} color={tgTheme.textSecondary} />
                  <span className="font14w600">{selectedPeriodLabel}</span>
                </div>

                <ChevronDown size={16} color={tgTheme.textSecondary} />
              </button>

              {openDropdown === 'period' && (
                <div className={styles.dropdown}>
                  {PERIOD_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      onClick={() => handlePeriodSelect(option)}
                    >
                      <span className="font14w600">{option.label}</span>
                      {selectedPeriodKey === option.key && (
                        <Check color={tgTheme.accent} size={20} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <CalendarCustom
                visible={calendarVisible}
                setVisible={setCalendarVisible}
                date={customRange.start_date || ''}
                setDate={handleCalendarApply}
                mode="range"
                listBlockPosition="left"
              />
            </div>
          </div>

          <div className={styles.field}>
            <span className="font16w500">Выбрать тег</span>

            <div className={styles.selectWrapper}>
              <button
                type="button"
                className={styles.selectLike}
                onClick={() => toggleDropdown('tag')}
              >
                <div className={styles.selectValue}>
                  <TagIcon size={16} color={tgTheme.textSecondary} />
                  <span className="font14w600">{selectedTagLabel}</span>
                </div>

                <ChevronDown size={16} color={tgTheme.textSecondary} />
              </button>

              {openDropdown === 'tag' && (
                <div className={styles.dropdown}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTagId(null);
                      setOpenDropdown(null);
                    }}
                  >
                    <span className="font14w600">Все теги</span>
                    {!selectedTagId && <Check color={tgTheme.accent} size={20} />}
                  </button>

                  {tags.map((tag) => (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => {
                        setSelectedTagId(tag.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <span className="font14w600">{tag.name}</span>
                      {String(selectedTagId) === String(tag.id) && (
                        <Check color={tgTheme.accent} size={20} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className={`font12w400 ${styles.fieldHint}`}>
              Если тег не выбран, отчет выгрузится по всем тегам.
            </span>
          </div>

          {errorText && <div className={`font13w500 ${styles.errorText}`}>{errorText}</div>}

          <button
            type="button"
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={isLoading}
          >
            <span className="font14w600">{isLoading ? 'Скачивание...' : 'Скачать Excel-отчет'}</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}