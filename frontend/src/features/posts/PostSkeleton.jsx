import styles from "./PostSkeleton.module.css";

function PostSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.postHeader}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.skeletonInfo}>
          <div className={styles.skeletonLineShort} />
          <div className={styles.skeletonLineTiny} />
        </div>
      </div>

      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLineHalf} />

      <div className={styles.reactions}>
        <div className={styles.skeletonIcon} />
        <div className={styles.skeletonIcon} />
      </div>
    </div>
  );
}

export default PostSkeleton;
