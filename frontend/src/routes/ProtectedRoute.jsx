import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../features/auth/AuthContext";
import Loading from "../components/Loading";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
