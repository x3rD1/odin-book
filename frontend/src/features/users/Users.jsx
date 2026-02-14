import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";
import BackIcon from "../../assets/icons/arrow-left.svg?react";
import { useContext, useEffect, useState } from "react";
import { getAllUsers } from "./users.api";
import UserCard from "../../components/UserCard";
import AuthContext from "../auth/AuthContext";

function Users() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAllUsers();
        setUsers(res.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Skeleton loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <h1 className={styles.title}>People</h1>
          <div className={styles.spacer} />
        </div>
        <div className={styles.skeletonList}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonUsername} />
              </div>
              <div className={styles.skeletonButton} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (users.length <= 1) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <h1 className={styles.title}>People</h1>
          <div className={styles.spacer} />
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>No users found</h3>
          <p>
            Looks like you're the only one here. Invite some friends to join!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <h1 className={styles.title}>People</h1>
        <div className={styles.spacer} />
      </div>

      <div className={styles.listContainer}>
        <ul className={styles.list}>
          {users
            .filter((u) => u.id !== user.id)
            .map((u) => (
              <li key={u.id}>
                <UserCard person={u} setUsers={setUsers} />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default Users;
