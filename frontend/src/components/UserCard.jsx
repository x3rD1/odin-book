import { useContext } from "react";
import styles from "./UserCard.module.css";
import AuthContext from "../features/auth/AuthContext";
import { toggleFollow } from "../features/users/users.api";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

function UserCard({ person, setUsers }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isFollowing = person.follower.some((f) => f.followerId === user.id);

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!person) return;

    let alreadyFollowing;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== person.id) return u;

        alreadyFollowing = u.follower.some((f) => f.followerId === user.id);

        return {
          ...u,
          follower: alreadyFollowing
            ? u.follower.filter((f) => f.followerId !== user.id)
            : [...u.follower, { id: user.id, followerId: user.id }],
        };
      }),
    );

    try {
      const { notif } = await toggleFollow(person.id);
      if (!alreadyFollowing) {
        socket.emit("follow", { person, user, notif });
      }
    } catch (err) {
      console.error(err);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== person.id) return u;

          const alreadyFollowing = u.follower.some(
            (f) => f.followerId === user.id,
          );

          return {
            ...u,
            follower: alreadyFollowing
              ? u.follower.filter((f) => f.followerId !== user.id)
              : [...u.follower, { id: user.id, followerId: user.id }],
          };
        }),
      );
    }
  };

  const handleVisit = (e, userId) => {
    e.stopPropagation();
    navigate(`/users/${userId}`);
  };

  return (
    <div
      className={styles.container}
      onClick={(e) => handleVisit(e, person.id)}
    >
      <div className={styles.imgContainer}>
        <img
          src={
            person.profilePicture ||
            "https://img.icons8.com/nolan/64/user-default.png"
          }
          alt={person.username}
        />
      </div>
      <div className={styles.userInfo}>
        <span>{person.username}</span>
        <button onClick={handleFollow}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
}

export default UserCard;
