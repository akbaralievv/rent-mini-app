import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import styles from "./FileViewerModal.module.css";

const getFileType = (url) => {
  if (!url) return "unknown";

  const ext = url.split(".").pop().toLowerCase().split("?")[0];

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["txt", "json", "xml"].includes(ext)) return "text";

  return "unknown";
};

function DocxViewer({ url }) {
  const wrapperRef = useRef(null);
  const renderTargetRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!url || !wrapper) return;
    let cancelled = false;

    // Create a DOM node outside React's control
    const target = document.createElement("div");
    renderTargetRef.current = target;
    wrapper.appendChild(target);

    const loadDocx = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Не удалось загрузить файл");
        const blob = await response.blob();
        if (cancelled) return;
        await renderAsync(blob, target, null, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: true,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Ошибка просмотра docx");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDocx();

    return () => {
      cancelled = true;
      // Manually remove the node we created — React never touches it
      if (target.parentNode) {
        target.parentNode.removeChild(target);
      }
      renderTargetRef.current = null;
    };
  }, [url]);

  return (
    <div className={styles.docxContainer}>
      {loading && !error && <div className={styles.docxLoading}>Загрузка документа...</div>}
      {error && (
        <div className={styles.fallback}>
          <p>{error}</p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Скачать файл
          </a>
        </div>
      )}
      <div ref={wrapperRef} />
    </div>
  );
}

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

    if (type === "docx") {
      return <DocxViewer url={url} />;
    }

    if (["doc", "excel", "ppt"].includes(type)) {
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