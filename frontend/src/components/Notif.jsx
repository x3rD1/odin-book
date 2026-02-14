import { useNavigate } from "react-router-dom";
import styles from "./Notif.module.css";
import { useContext } from "react";
import NotifContext from "../contexts/NotifContext";
import { formatTimeAgo } from "../utils/time";
import { useLockBodyScroll } from "../utils/useLockBodyScroll";

function Notif() {
  const { notifs, markAsRead } = useContext(NotifContext);

  const navigate = useNavigate();
  const hasNotifications = notifs.length > 0;

  useLockBodyScroll(true);

  const getNotifRoute = (notif) => {
    switch (notif.type) {
      case "LIKE":
      case "COMMENT":
        if (notif.commentId) {
          return `/posts/${notif.postId}?comment=${notif.commentId}`;
        }
        return `/posts/${notif.postId}`;
      case "REPLY":
        return `/posts/${notif.postId}?comment=${notif.commentId}`;
      case "FOLLOW":
        return `/users/${notif.actorId}`;
      default:
        return "/";
    }
  };

  const handleClick = (notif) => {
    markAsRead(notif.id);
    navigate(getNotifRoute(notif));
  };

  const handleMarkAllRead = () => {
    notifs.forEach((n) => {
      if (!n.isRead) markAsRead(n.id);
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.title}>Notifications</h3>
        {hasNotifications && (
          <button className={styles.clearBtn} onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </header>

      <div className={styles.list}>
        {!hasNotifications ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p>No notifications yet</p>
            <span>We'll let you know when something happens</span>
          </div>
        ) : (
          notifs.map((n, index) => (
            <div
              key={`${n.type !== "FOLLOW" ? n.postId : n.id}-${index}`}
              onClick={() => handleClick(n)}
              className={`${styles.item} ${!n.isRead ? styles.unread : ""}`}
            >
              <div className={styles.avatarWrapper}>
                <img
                  src={n.actor.profilePicture}
                  alt=""
                  className={styles.avatar}
                />
                {!n.isRead && <span className={styles.statusDot} />}
              </div>
              <div className={styles.content}>
                <p className={styles.message}>{n.message}</p>
                <span className={styles.time}>
                  {formatTimeAgo(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notif;
