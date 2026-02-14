require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

require("./lib/passport");

const app = express();

app.use(cors({ origin: `${process.env.FRONTEND_URL}`, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);
const sessionMiddleware = session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

// Routers
const { requireAuth } = require("./auth/auth.middleware");
const authRoutes = require("./auth/auth.routes");
const postRoutes = require("./modules/posts/post.routes");
const userRoutes = require("./modules/users/user.routes");
const notifRoutes = require("./modules/notifications/notif.routes");
const uploadRoutes = require("./modules/uploads/uploads.routes");
const gifRoutes = require("./modules/gifs/gif.routes");

app.use("/auth", authRoutes);
app.use("/posts", requireAuth, postRoutes);
app.use("/users", requireAuth, userRoutes);
app.use("/notifications", requireAuth, notifRoutes);
app.use("/upload", requireAuth, uploadRoutes);
app.use("/gifs", requireAuth, gifRoutes);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: `${process.env.FRONTEND_URL}`, credentials: true },
});

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
// Authenticate sockets
io.use((socket, next) => {
  const user = socket.request.user;

  if (!user) {
    return next(new Error("Not authenticated"));
  }

  socket.userId = user.id;
  socket.username = user.username;

  next();
});

const onlineUsers = new Map();
const userStatus = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, socket.id);
  }

  const wasOffline = !userStatus.get(userId);

  userStatus.set(userId, true);

  if (wasOffline) {
    io.emit("user_status", { userId, isOnline: true });
  }

  socket.emit(
    "online_snapshot",
    Array.from(userStatus.entries())
      .filter(([, v]) => v === true)
      .map(([id]) => id),
  );

  socket.on("join_post", (postId) => {
    // Track which post the user is viewing
    socket.currentPostId = postId;
    socket.join(`post:${postId}`);
  });

  socket.on("leave_post", (postId) => {
    socket.currentPostId = null;
    socket.leave(`post:${postId}`);
  });

  socket.on("create_post", ({ newPost }) => {
    socket.broadcast.emit("post_update", { newPost });
  });

  socket.on("like_post", ({ postId, authorId, actor, content, notif }) => {
    const likerId = socket.userId;

    // Update like count of post
    socket.broadcast.emit("post_liked_update_count", {
      postId,
      from: likerId,
    });

    // Prevent self notif
    if (likerId === authorId) return;

    const authorSocketId = onlineUsers.get(authorId);
    if (!authorSocketId) return;

    io.to(authorSocketId).emit("post_liked_notification", {
      id: notif.id,
      type: "LIKE",
      postId,
      actor: { profilePicture: actor.profilePicture },
      isRead: notif.isRead,
      createdAt: Date.now(),
      message: `${socket.username} liked your post: "${content}"`,
    });
  });

  socket.on("unlike_post", ({ postId }) => {
    const unlikerId = socket.userId;

    socket.broadcast.emit("post_unliked_update_count", {
      postId,
      from: unlikerId,
    });
  });

  socket.on(
    "post_comment",
    ({ postId, authorId, content, comment, actor, notif }) => {
      const commenterId = socket.userId;

      // Update comments of a post in real-time
      socket
        .to(`post:${postId}`)
        .emit("post_comment_update", { postId, comment });

      // Update postId comment count for all sockets except sender
      socket.broadcast.emit("post_comment_count_update", {
        postId,
      });

      if (commenterId === authorId) return;

      const authorSocketId = onlineUsers.get(authorId);
      if (!authorSocketId) return;

      // Checks if author is online and is viewing the post
      if (
        authorSocketId &&
        io.sockets.sockets.get(authorSocketId)?.currentPostId !== Number(postId)
      ) {
        io.to(authorSocketId).emit("post_comment_notification", {
          id: notif.id,
          type: "COMMENT",
          postId,
          actor: { profilePicture: actor.profilePicture },
          isRead: notif.isRead,
          createdAt: Date.now(),
          message: `${socket.username} has commented on your post: 
      "${content}"`,
        });
      }
    },
  );

  socket.on(
    "comment_reply",
    ({ postId, commentAuthorId, content, comment, actor, notif }) => {
      const commenterId = socket.userId;

      socket
        .to(`post:${postId}`)
        .emit("comment_reply_update", { postId, comment });

      // Update postId comment count for all sockets except sender
      socket.broadcast.emit("post_comment_count_update", {
        postId,
      });

      if (commenterId === commentAuthorId) return;

      const authorSocketId = onlineUsers.get(commentAuthorId);
      if (!authorSocketId) return;

      if (
        authorSocketId &&
        io.sockets.sockets.get(authorSocketId)?.currentPostId !== Number(postId)
      ) {
        io.to(authorSocketId).emit("comment_reply_notification", {
          id: notif.id,
          type: "REPLY",
          postId,
          actor: { profilePicture: actor.profilePicture },
          isRead: notif.isRead,
          createdAt: Date.now(),
          message: `${socket.username} has replied to your comment: "${content}"`,
        });
      }
    },
  );

  socket.on(
    "like_comment",
    ({ postId, commentId, commentAuthorId, content, actor, notif }) => {
      const likerId = socket.userId;

      socket.broadcast.emit("comment_like_count_update", {
        postId,
        commentId,
        likerId,
      });

      // Prevents self notif
      if (likerId === commentAuthorId) return;

      const authorSocketId = onlineUsers.get(commentAuthorId);
      if (!authorSocketId) return;

      if (
        authorSocketId &&
        io.sockets.sockets.get(authorSocketId)?.currentPostId !== Number(postId)
      ) {
        io.to(authorSocketId).emit("comment_like_notification", {
          id: notif.id,
          type: "LIKE",
          postId,
          commentId,
          actor: { profilePicture: actor.profilePicture },
          isRead: notif.isRead,
          createdAt: Date.now(),
          message: `${socket.username} liked your comment: "${content}"`,
        });
      }
    },
  );

  socket.on("follow", ({ person, user, notif }) => {
    const target = person;
    const actor = user;

    if (target.id === actor.id) return;

    const targetSocketId = onlineUsers.get(target.id);
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("follow_notification", {
      id: notif.id,
      type: "FOLLOW",
      targetId: target.id,
      actor: { profilePicture: actor.profilePicture },
      actorId: actor.id,
      isRead: notif.isRead,
      createdAt: Date.now(),
      message: `${actor.username} has started following you.`,
    });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);

    userStatus.set(userId, false);

    io.emit("user_status", { userId, isOnline: false });

    console.log("User disconnected:", userId);
  });
});

server.listen(3000, (error) => {
  if (error) throw error;
  console.log("App is listening to port 3000");
});
