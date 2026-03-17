// frontend/src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Сохраняем запрашиваемый URL для редиректа после входа
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Можно сохранить текущий путь для возврата после авторизации
      const returnUrl = location.pathname + location.search;
      if (returnUrl !== '/login') {
        sessionStorage.setItem('returnUrl', returnUrl);
      }
    }
  }, [isAuthenticated, isLoading, location]);

  // Пока загружается, показываем лоадер
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если авторизован, показываем защищенные страницы
  return <Outlet />;
};

export default ProtectedRoute;