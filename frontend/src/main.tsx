import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import Dashboard from "./pages/dashboard.tsx";

function protectedLoader() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw redirect("/login");
  }

  return null;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Register />,
  },
  {
    loader: protectedLoader,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
