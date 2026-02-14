import styles from "./Loading.module.css";
import DualBall from "../assets/icons/Dual-Ball@1x-1.2s-200px-200px.svg?react";

function Loading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}>
        <DualBall />
      </div>
    </div>
  );
}

export default Loading;
