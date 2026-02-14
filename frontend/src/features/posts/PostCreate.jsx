import { useContext, useState } from "react";
import styles from "./PostCreate.module.css";
import AuthContext from "../auth/AuthContext";
import CreatePostModal from "../../components/CreatePostModal";
import { useNavigate } from "react-router-dom";

function PostCreate({ setPosts }) {
  const { user } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.container}>
        <div
          className={styles.avatar}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/users/${user.id}`);
          }}
        >
          <img
            src={
              user.profilePicture ||
              "https://img.icons8.com/nolan/64/user-default.png"
            }
            alt={user.username}
          />
        </div>

        <button
          className={styles.inputTrigger}
          onClick={() => setOpenModal(true)}
        >
          What's on your mind, {user.username}?
        </button>
      </div>

      {openModal && (
        <CreatePostModal
          closeModal={() => setOpenModal(false)}
          setPosts={setPosts}
        />
      )}
    </>
  );
}

export default PostCreate;
