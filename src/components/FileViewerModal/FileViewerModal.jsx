import React from "react";
import styles from "./FileViewerModal.module.css";

const getFileType = (url) => {
  if (!url) return "unknown";

  const ext = url.split(".").pop().toLowerCase().split("?")[0];

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["txt", "json", "xml"].includes(ext)) return "text";

  return "unknown";
};

export default function FileViewerModal({ url, visible, onClose }) {
  if (!visible || !url) return null;

  const type = getFileType(url);

  const renderContent = () => {
    if (type === "image") {
      return <img src={url} alt="preview" className={styles.image} />;
    }

    if (type === "pdf") {
      return (
        <iframe
          src={url}
          className={styles.viewer}
          title="PDF Viewer"
        />
      );
    }

    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(type)) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
          className={styles.viewer}
        />
      )
    }

    if (type === "text") {
      return (
        <iframe
          src={url}
          className={styles.viewer}
          title="Text Viewer"
        />
      );
    }

    return (
      <div className={styles.fallback}>
        <p>Предпросмотр недоступен</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Скачать файл
        </a>
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>{renderContent()}</div>
      </div>
    </div>
  );
}