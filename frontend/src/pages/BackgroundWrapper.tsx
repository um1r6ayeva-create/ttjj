import React from 'react';
import tuitImage from './tuit.jpg';

const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
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
        zIndex: -1,
        filter: 'blur(5px)',
      }}
    >
    fff  {children}
    </div>
  );
};

export default BackgroundWrapper;
