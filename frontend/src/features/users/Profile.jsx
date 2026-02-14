import styles from "./Profile.module.css";
import BackIcon from "../../assets/icons/arrow-left.svg?react";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { getUser, toggleFollow } from "./users.api";
import AuthContext from "../auth/AuthContext";
import PostItem from "../posts/PostItem";
import PostsContext from "../../contexts/PostsContext";
import { socket } from "../../utils/socket";
import SocketContext from "../../contexts/SocketContext";

function Profile() {
  const { onlineMap } = useContext(SocketContext);
  const { posts, fetchPosts } = useContext(PostsContext);
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const [person, setPerson] = useState(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const userPosts = posts.filter((post) => post.authorId === Number(userId));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isOnline = Boolean(person && onlineMap?.[person.id]);

  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, [posts.length, fetchPosts]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await getUser(userId);
        setPerson(res);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleFollow = async () => {
    if (!person || isFollowLoading) return;

    const isCurrentlyFollowing = person.follower.some(
      (f) => f.followerId === user.id,
    );

    setPerson((prev) => ({
      ...prev,
      follower: isCurrentlyFollowing
        ? prev.follower.filter((f) => f.followerId !== user.id)
        : [...prev.follower, { followerId: user.id }],
    }));

    setIsFollowLoading(true);

    try {
      const { notif } = await toggleFollow(userId);
      if (!isCurrentlyFollowing) {
        socket.emit("follow", { person, user, notif });
      }
    } catch (err) {
      console.error(err);
      setPerson((prev) => ({
        ...prev,
        follower: isCurrentlyFollowing
          ? [...prev.follower, { followerId: user.id }]
          : prev.follower.filter((f) => f.followerId !== user.id),
      }));
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonContent} />
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>😕</span>
          <h2>User not found</h2>
          <button onClick={() => navigate(-1)} className={styles.errorBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isFollowing = person.follower.some((f) => f.followerId === user.id);
  const isOwnProfile = user.id === person.id;

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackIcon />
        </button>
        <h1 className={styles.navTitle}>{person.username}</h1>
        <div className={styles.navSpacer} />
      </nav>

      <header className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img
              src={
                person.profilePicture ||
                "https://img.icons8.com/nolan/64/user-default.png"
              }
              alt={person.username}
              className={styles.avatar}
            />
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.userRow}>
            <h2 className={styles.username}>{person.username}</h2>
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`${styles.followBtn} ${
                  isFollowing ? styles.following : styles.notFollowing
                } ${isFollowLoading ? styles.loading : ""}`}
              >
                {isFollowing ? (
                  <>
                    <span className={styles.btnIcon}>✓</span>
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <span className={styles.btnIcon}>+</span>
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div
            className={
              isOnline ? styles.onlineIndicator : styles.offlineIndicator
            }
          >
            {isOnline ? "Online" : "Offline"}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{userPosts.length}</span>
              <span className={styles.statLabel}>posts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{person.follower.length}</span>
              <span className={styles.statLabel}>followers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {person.following.length}
              </span>
              <span className={styles.statLabel}>following</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.activeTab}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Posts</span>
        </button>
      </div>

      <section className={styles.postsSection}>
        {userPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No posts yet</h3>
            <p>When {person.username} shares posts, they'll appear here.</p>
          </div>
        ) : (
          <ul className={styles.postList}>
            {userPosts.map((post, index) => (
              <li
                key={post.id}
                className={styles.postItem}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostItem
                  id={post.id}
                  content={post.content}
                  createdAt={post.createdAt}
                  author={post.author}
                  mediaUrl={post.mediaUrl}
                  mediaType={post.mediaType}
                  likes={post.likes}
                  commentCount={post.commentCount}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Profile;
