import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VideoCard.module.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
};

const VideoCard = ({ video, loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={[styles.thumbnail, 'skeleton'].join(' ')} />
        <div className={styles.info}>
          <div className={[styles.skeletonTitle, 'skeleton'].join(' ')} />
          <div className={[styles.skeletonText, 'skeleton'].join(' ')} />
          <div className={[styles.skeletonMeta, 'skeleton'].join(' ')} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/stream/${video.videoId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/stream/${video.videoId}`)}
      aria-label={`Watch ${video.title}`}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className={styles.thumbnailImg} />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        <div className={styles.playOverlay}>
          <div className={styles.playBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.title} title={video.title}>
          {video.title}
        </h3>
        {video.description && (
          <p className={styles.description}>{video.description}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.date}>{formatDate(video.uploadedOn)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
