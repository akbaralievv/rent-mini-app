import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { getFileIcon, tgTheme } from '../../common/commonStyle'
import styles from './FileThumbnail.module.css'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

function getExtension(fileName) {
  if (!fileName) return ''
  return fileName.split('.').pop().toLowerCase()
}

export default function FileThumbnail({ name, url, size = 48 }) {
  const ext = getExtension(name)
  const isImage = IMAGE_EXTENSIONS.includes(ext)
  const isPdf = ext === 'pdf'

  const [imgError, setImgError] = useState(false)
  const [pdfError, setPdfError] = useState(false)

  const Icon = getFileIcon(name || '')

  if (isImage && url && !imgError) {
    return (
      <div className={styles.thumbnail} style={{ width: size, height: size }}>
        <img
          src={url}
          alt={name}
          className={styles.image}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  if (isPdf && url && !pdfError) {
    return (
      <div className={styles.thumbnail} style={{ width: size, height: size }}>
        <Document
          file={url}
          onLoadError={() => setPdfError(true)}
          loading={
            <div className={styles.iconFallback} style={{ width: size, height: size }}>
              <Icon size={size * 0.55} color={tgTheme.white} strokeWidth={1.5} />
            </div>
          }
        >
          <Page
            pageNumber={1}
            width={size}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    )
  }

  return (
    <div className={styles.iconFallback} style={{ width: size, height: size }}>
      <Icon size={size * 0.55} color={tgTheme.white} strokeWidth={1.5} />
    </div>
  )
}
