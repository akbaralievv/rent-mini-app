import styles from './PreviewContract.module.css';

export default function PreviewContract({ list = [], visible = false }) {
  if (!visible) return null;

  const prepared = list.filter(
    (item) => item && typeof item === 'object' && String(item.value ?? '').trim() !== '',
  );

  if (prepared.length === 0) return null;

  return (
    <div className={styles.preview}>
      <span className={styles.title}>Обзор договора</span>

      <div className={styles.block}>
        {prepared.map((item, index) => (
          <div key={`${item.key}-${index}`} className={styles.item}>
            <span className={styles.key}>{item.key}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
