import { AuthProvider } from "./features/auth/AuthProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes/routes";

const router = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
