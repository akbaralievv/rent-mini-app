import React from 'react'
import styles from './Tag.module.css'
import { tagsMinusData, tagsPlusData } from '../../common/tagsData';
import { tgTheme } from '../../common/commonStyle';

export default function Tag({ tagId = 0, isIncome = false }) {
  if (tagId == null) return null;
  const tagsData = isIncome ? tagsPlusData : tagsMinusData;
  const text = tagsData.find(el => el.id == tagId)?.text;

  if (!text) return null;
  return (
    <div className={styles.tagNeutralDot}>
      <span className="font12w500" style={{ color: tgTheme.text}}>{text}</span>
    </div>
  )
}
