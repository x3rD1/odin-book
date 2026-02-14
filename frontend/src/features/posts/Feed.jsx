import { useContext, useEffect } from "react";
import NavIcons from "../../components/NavIcons";
import Title from "../../components/Title";
import styles from "./Feed.module.css";
import PostCreate from "./PostCreate";
import PostList from "./PostList";
import NotifContext from "../../contexts/NotifContext";

function Feed() {
  const { notifs, fetchNotifs } = useContext(NotifContext);

  useEffect(() => {
    if (notifs.length === 0) {
      fetchNotifs();
    }
  }, [fetchNotifs, notifs.length]);

  return (
    <div className={styles.feedContainer}>
      <Title />
      <NavIcons />
      <main className={styles.mainContent}>
        <PostCreate />
        <PostList />
      </main>
    </div>
  );
}

export default Feed;
