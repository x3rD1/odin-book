import Login from "../features/auth/Login";
import Feed from "../features/posts/Feed";
import ProtectedRoute from "../routes/ProtectedRoute";

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
    path: "/login",
    element: <Login />,
  },
];

export default routes;
