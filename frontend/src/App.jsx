import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage mode="signup" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
