import styles from "./Title.module.css";

function Title({ sticky = false }) {
  return (
    <div className={`${styles.container} ${sticky ? styles.sticky : ""}`}>
      <div className={styles.wrapper}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Memeo</h1>
          <span className={styles.subtitle}>
            Drop memes. Stay anonymous. Laugh endlessly.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Title;
