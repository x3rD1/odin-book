import styles from "./NavIcons.module.css";
import HomeIcon from "../assets/icons/home.svg?react";
import PeopleIcon from "../assets/icons/people.svg?react";
import BellIcon from "../assets/icons/bell.svg?react";
import SettingsIcon from "../assets/icons/settings.svg?react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import Notif from "./Notif";
import NotifContext from "../contexts/NotifContext";

function NavIcons() {
  const { notifs } = useContext(NotifContext);
  const unReadCount = notifs.filter((notif) => !notif.isRead);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("pointerdown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open]);

  const toggleNotif = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <nav className={styles.navContainer}>
      <div className={styles.navItem} onClick={() => window.location.reload()}>
        <HomeIcon className={styles.icon} />
        <span className={styles.label}>HOME</span>
      </div>

      <div className={styles.navItem} onClick={() => navigate("/users")}>
        <PeopleIcon className={styles.icon} />
        <span className={styles.label}>PEOPLE</span>
      </div>

      <div className={styles.navItem} ref={dropdownRef} onClick={toggleNotif}>
        <div className={styles.iconWrapper}>
          <BellIcon className={styles.icon} />
          {unReadCount.length > 0 && (
            <span className={styles.badge} key={unReadCount.length}>
              {unReadCount.length > 99 ? "99+" : unReadCount.length}
            </span>
          )}
        </div>
        <span className={styles.label}>NOTIFS</span>

        {open && (
          <div className={styles.dropdown}>
            <Notif onClose={() => setOpen(false)} />
          </div>
        )}
      </div>

      <div className={styles.navItem} onClick={() => navigate("/settings")}>
        <SettingsIcon className={styles.icon} />
        <span className={styles.label}>SETTINGS</span>
      </div>
    </nav>
  );
}

export default NavIcons;
