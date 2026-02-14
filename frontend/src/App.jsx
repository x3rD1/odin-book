import { AuthProvider } from "./features/auth/AuthProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes/routes";
import { NotifProvider } from "./contexts/NotifProvider";
import { SocketProvider } from "./contexts/SocketProvider";
import { PostsProvider } from "./contexts/PostsProvider";
import { CommentProvider } from "./contexts/CommentProvider";

const router = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <PostsProvider>
          <CommentProvider>
            <NotifProvider>
              <RouterProvider router={router} />
            </NotifProvider>
          </CommentProvider>
        </PostsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
