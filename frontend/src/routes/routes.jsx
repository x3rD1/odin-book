import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import Feed from "../features/posts/Feed";
import PostDetail from "../features/posts/PostDetail";
import Profile from "../features/users/Profile";
import ProtectedRoute from "../routes/ProtectedRoute";
import Users from "../features/users/Users";
import Settings from "../components/Settings";

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Feed />
      </ProtectedRoute>
    ),
  },
  {
    path: "/posts/:id",
    element: (
      <ProtectedRoute>
        <PostDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "users",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/:userId",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
];

export default routes;
