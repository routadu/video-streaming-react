import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersApi, videosApi } from '../api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/molecules/VideoCard/VideoCard';
import Button from '../components/atoms/Button/Button';
import styles from './UserPage.module.css';

const formatJoinDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [videosError, setVideosError] = useState(null);

  const fetchUser = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await usersApi.getByUsername(username);
      setUserData(res.data.user);
    } catch (err) {
      if (err.response?.status === 404) {
        setUserError('User not found.');
      } else {
        setUserError('Failed to load user info. Please try again.');
      }
    } finally {
      setUserLoading(false);
    }
  }, [username]);

  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    setVideosError(null);
    try {
      const res = await videosApi.getUserVideos(username);
      setVideos(res.data.videos || []);
    } catch (err) {
      setVideosError('Failed to load videos. Please try again.');
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUser();
    fetchVideos();
  }, [fetchUser, fetchVideos]);

  const getInitials = (firstName, lastName) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const isOwnPage = currentUser?.username === username;

  // User not found
  if (!userLoading && userError) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className={styles.errorTitle}>
              {userError === 'User not found.' ? 'User Not Found' : 'Something Went Wrong'}
            </h2>
            <p className={styles.errorText}>{userError}</p>
            <div className={styles.errorActions}>
              <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
              <Button variant="secondary" onClick={fetchUser}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back Button */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <BackIcon />
          Back
        </button>
      </div>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileBanner}>
          <div className={styles.bannerGradient} />
        </div>

        <div className={styles.profileContent}>
          {userLoading ? (
            <div className={styles.profileLoadingWrap}>
              <div className={[styles.avatarSkeleton, 'skeleton'].join(' ')} />
              <div className={styles.profileTextSkeleton}>
                <div className={['skeleton', styles.skeletonName].join(' ')} />
                <div className={['skeleton', styles.skeletonMeta].join(' ')} />
              </div>
            </div>
          ) : (
            <div className={styles.profileInfo}>
              {/* Avatar */}
              <div className={styles.avatar}>
                <span className={styles.avatarInitials}>
                  {getInitials(userData?.firstName, userData?.lastName)}
                </span>
              </div>

              {/* Name & Meta */}
              <div className={styles.profileDetails}>
                <div className={styles.nameRow}>
                  <h1 className={styles.fullName}>
                    {userData?.firstName} {userData?.lastName}
                  </h1>
                  {isOwnPage && (
                    <span className={styles.youBadge}>You</span>
                  )}
                </div>
                <p className={styles.username}>@{userData?.username}</p>
                <div className={styles.metaRow}>
                  <span className={styles.metaItem}>
                    <CalendarIcon />
                    Joined {formatJoinDate(userData?.createdDate)}
                  </span>
                  {!videosLoading && (
                    <span className={styles.metaItem}>
                      <VideoIcon />
                      {videos.length} video{videos.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Upload button if own page */}
              {isOwnPage && (
                <div className={styles.profileActions}>
                  <Link to="/upload">
                    <Button variant="primary" size="sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Upload Video
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      <div className={styles.videosSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <VideoIcon />
            {isOwnPage ? 'Your Videos' : `Videos by ${userData?.firstName || username}`}
          </h2>
          {!videosLoading && !videosError && (
            <span className={styles.videoCount}>
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Videos loading skeletons */}
        {videosLoading && (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <VideoCard key={i} loading />
            ))}
          </div>
        )}

        {/* Videos error */}
        {!videosLoading && videosError && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} style={{ color: 'var(--error)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>Failed to load videos</h3>
            <p className={styles.emptyText}>{videosError}</p>
            <Button variant="primary" onClick={fetchVideos}>Try Again</Button>
          </div>
        )}

        {/* No videos */}
        {!videosLoading && !videosError && videos.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No videos yet</h3>
            <p className={styles.emptyText}>
              {isOwnPage
                ? "You haven't uploaded any videos yet."
                : `${userData?.firstName || username} hasn't uploaded any videos yet.`}
            </p>
            {isOwnPage && (
              <Link to="/upload">
                <Button variant="primary">Upload Your First Video</Button>
              </Link>
            )}
          </div>
        )}

        {/* Video Grid */}
        {!videosLoading && !videosError && videos.length > 0 && (
          <div className={styles.grid}>
            {videos.map((video, idx) => (
              <VideoCard key={video.videoId || idx} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
