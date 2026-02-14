import { useEffect, useState } from "react";
import NotifContext from "./NotifContext";
import { socket } from "../utils/socket";
import { api } from "../api/client";

export function NotifProvider({ children }) {
  const [notifs, setNotif] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);

  const markAsRead = async (notifId) => {
    console.log(notifId);
    setNotif((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
    );

    try {
      api.patch(`/notifications/${notifId}/read`);
    } catch (err) {
      console.error("Failed to mark as read", err);
      setNotif((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: false } : n)),
      );
    }
  };

  const fetchNotifs = async () => {
    try {
      const res = await api.get("/notifications");
      setNotif(res);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // Send a like notif to post's author
  useEffect(() => {
    const handler = (data) => {
      setNotif((prev) => [data, ...prev]);
      setHasChecked(false);
    };
    socket.on("post_liked_notification", handler);
    return () => socket.off("post_liked_notification", handler);
  }, []);

  // Send a comment notif to post's author
  useEffect(() => {
    const handler = (data) => {
      setNotif((prev) => [data, ...prev]);
      setHasChecked(false);
    };
    socket.on("post_comment_notification", handler);
    return () => socket.off("post_comment_notification", handler);
  }, []);

  // Send a reply notif to comment's author
  useEffect(() => {
    const handler = (data) => {
      setNotif((prev) => [data, ...prev]);
      setHasChecked(false);
    };
    socket.on("comment_reply_notification", handler);
    return () => socket.off("comment_reply_notification", handler);
  }, []);

  // Send a comment:like notification to comment's author
  useEffect(() => {
    const handler = (data) => {
      setNotif((prev) => [data, ...prev]);
      setHasChecked(false);
    };
    socket.on("comment_like_notification", handler);
    return () => socket.off("comment_like_notification", handler);
  }, []);

  // Send a follow notification to the target user
  useEffect(() => {
    const handler = (data) => {
      setNotif((prev) => [data, ...prev]);
      setHasChecked(false);
    };
    socket.on("follow_notification", handler);
    return () => socket.off("follow_notification", handler);
  }, []);

  const value = {
    notifs,
    setNotif,
    hasChecked,
    setHasChecked,
    fetchNotifs,
    markAsRead,
  };
  return (
    <NotifContext.Provider value={value}>{children}</NotifContext.Provider>
  );
}
