import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
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
  {
    path: "/signup",
    element: <Signup />,
  },
];

export default routes;
