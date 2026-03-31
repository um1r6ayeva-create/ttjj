import React from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
    src: string; // Ссылка на видео (локальная или YouTube)
    title?: string;
    description?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, description }) => {
    // Функция для получения ссылки для эмбеда YouTube
    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.includes('youtu.be/') 
                ? url.split('youtu.be/')[1].split('?')[0] 
                : url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    };

    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
    const finalSrc = isYouTube ? getEmbedUrl(src) : src;

    return (
        <div className="video-item">
            {title && <h3 className="video-title">{title}</h3>}
            {description && <p className="video-description">{description}</p>}

            <div className="video-wrapper">
                {isYouTube ? (
                    <iframe
                        className="main-video"
                        src={finalSrc}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video
                        className="main-video"
                        controls
                        preload="metadata"
                        poster="/images/dormitory.jpg"
                    >
                        <source src={finalSrc} type="video/mp4" />
                        Ваш браузер не поддерживает тег видео.
                    </video>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
