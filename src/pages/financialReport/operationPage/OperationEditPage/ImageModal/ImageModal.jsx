import { X } from "lucide-react";
import styles from "./ImageModal.module.css";

export default function ImageModal({ visible, image, onClose }) {
  if (!visible || !image) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose}>
          <X size={28} />
        </button>

        <img src={image} alt="preview" className={styles.image} />
      </div>
    </div>
  );
}