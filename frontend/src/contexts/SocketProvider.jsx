import { useContext, useEffect, useState } from "react";
import { socket } from "../utils/socket";
import SocketContext from "./SocketContext";
import AuthContext from "../features/auth/AuthContext";

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [onlineMap, setOnlineMap] = useState({});

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) socket.connect();

    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    socket.on("online_snapshot", (userIds) => {
      const map = {};
      userIds.forEach((id) => (map[id] = true));
      setOnlineMap(map);
    });

    socket.on("user_status", ({ userId, isOnline }) => {
      setOnlineMap((prev) => ({
        ...prev,
        [userId]: isOnline,
      }));
    });

    return () => {
      socket.off("online_snapshot");
      socket.off("user_status");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ onlineMap }}>
      {children}
    </SocketContext.Provider>
  );
}
