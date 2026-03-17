// frontend/src/layouts/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import tuitImage from '../pages/tuit.jpg';

const AuthLayout: React.FC = () => {
  return (
    <>
      {/* Фон только для auth страниц */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${tuitImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: -2,
        }}
      ></div>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 20, 50, 0.55)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: -1,
        }}
      ></div>

      <div className="relative z-10 min-h-screen">
        <Outlet />
      </div>
    </>
  );
};

export default AuthLayout;