import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";

const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/auth/components/Login/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/components/Register/RegisterPage"));
const ProfilePage = lazy(() => import("../pages/auth/components/Profile/ProfilePage"));
const Dekanat = lazy(() => import("../pages/administration/Dekanat/Dekanat"));
const RectoratePage = lazy(() => import("../pages/administration/Rectorate/RectoratePage"));
const StaffPage = lazy(() => import("../pages/administration/Staff/StaffPage"));
const Content = lazy(() => import('../pages/Content/Content'));
const NotFound = lazy(() => import("../pages/NotFound"));
const DutyPage = lazy(() => import("../pages/administration/Duty/DutyPage"));
const ApplicationsPage = lazy(() => import("../pages/ApplicationsPage/ApplicationsPage"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
          <Route path="/rectorate" element={<RectoratePage />} />
          <Route path="/dekanat" element={<Dekanat />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/content" element={<Content />} />
        {/* Защищённые маршруты */}
        <Route element={<ProtectedRoute />}>
          <Route path="/duty" element={<DutyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
        </Route>
        
        {/* Страница 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;