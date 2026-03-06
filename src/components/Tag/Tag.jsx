import React from 'react'
import styles from './Tag.module.css'
import { tgTheme } from '../../common/commonStyle';
import { useGetTagsQuery } from '../../redux/services/tagsAction';

export default function Tag({ tagId = 0 }) {
  if (tagId == null) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: tags = [] } = useGetTagsQuery();
  const text = tags.find(el => el.id == tagId)?.name;

  if (!text) return null;
  return (
    <div className={styles.tagNeutralDot}>
      <span className="font12w500" style={{ color: tgTheme.text}}>{text}</span>
    </div>
  )
}
