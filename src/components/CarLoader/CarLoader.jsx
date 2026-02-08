import React from "react";
import { Car } from "lucide-react";
import styles from "./CarLoader.module.css";

export default function CarLoader() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.road} />

      <div className={styles.carContainer}>
        <Car className={styles.car} size={42} strokeWidth={2} />
        <div className={styles.dust} />
      </div>
    </div>
  );
}
