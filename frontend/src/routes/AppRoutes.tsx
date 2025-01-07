import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { Testimonials } from "../components/Testimonials";
import { Faq } from "../components/Faq";
import { SignupPage } from "../pages/Signup";
import { LoginPage } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const HomePage = () => {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Faq />
    </>
  );
};

export function AppRoutes() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/signup"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignupPage />
        }
      />
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
