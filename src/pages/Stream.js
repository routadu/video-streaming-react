import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { videosApi, analyticsApi, BASE_VIDEO_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import Comments from '../components/organisms/Comments/Comments';
import Spinner from '../components/atoms/Spinner/Spinner';
import Badge from '../components/atoms/Badge/Badge';
import Button from '../components/atoms/Button/Button';
import styles from './Stream.module.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
};

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UpdateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const Stream = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);

  // resumeAt comes from Home page "Continue Watching" navigation state
  const resumeAt = location.state?.resumeAt ?? null;

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  const { isAuthenticated } = useAuth();

  // Refs for playback tracking — avoids stale closures in intervals
  const intervalRef = useRef(null);
  const lastSavedSecondRef = useRef(null);
  const currentTimeRef = useRef(0);

  // ── Playback tracking: every 10 seconds PATCH backend ──
  const startTracking = useCallback((player) => {
    if (!isAuthenticated) return;

    // Keep currentTimeRef up to date on every timeupdate
    player.on('timeupdate', () => {
      currentTimeRef.current = Math.floor(player.currentTime());
    });

    // Every 10 seconds, if time changed, send PATCH
    intervalRef.current = setInterval(async () => {
      const currentSecond = currentTimeRef.current;
      if (
        currentSecond > 0 &&
        currentSecond !== lastSavedSecondRef.current &&
        !player.paused() &&
        !player.ended()
      ) {
        lastSavedSecondRef.current = currentSecond;
        try {
          await analyticsApi.updateContinueWatching(videoId, currentSecond);
        } catch {
          // Silently ignore — don't interrupt the user's experience
        }
      }
    }, 10000);
  }, [isAuthenticated, videoId]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Save on pause/end as well (best effort) ──
  const saveOnPauseOrEnd = useCallback(async (player) => {
    if (!isAuthenticated) return;
    const currentSecond = Math.floor(player.currentTime());
    if (currentSecond > 0 && currentSecond !== lastSavedSecondRef.current) {
      lastSavedSecondRef.current = currentSecond;
      try {
        await analyticsApi.updateContinueWatching(videoId, currentSecond);
      } catch {
        // Silently ignore
      }
    }
  }, [isAuthenticated, videoId]);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await videosApi.getById(videoId);
        setVideo(res.data.video || res.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Video not found.'
            : 'Failed to load video. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (videoId) fetchVideo();
  }, [videoId]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const handlePlayerReady = useCallback((player) => {
    playerRef.current = player;

    // ── Seek to resume position if coming from Continue Watching ──
    if (resumeAt !== null && resumeAt > 0) {
      player.one('loadedmetadata', () => {
        player.currentTime(resumeAt);
      });
    }

    // ── Start playback tracking when playback starts ──
    player.one('play', () => {
      startTracking(player);
    });

    // ── Save on pause ──
    player.on('pause', () => {
      saveOnPauseOrEnd(player);
    });

    // ── Save on video end ──
    player.on('ended', () => {
      stopTracking();
      saveOnPauseOrEnd(player);
    });
  }, [resumeAt, startTracking, stopTracking, saveOnPauseOrEnd]);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    preload: 'auto',
    sources: [
      {
        src: `${BASE_VIDEO_URL}/${videoId}/master.m3u8`,
        type: 'application/x-mpegURL',
      },
    ],
    html5: {
      vhs: {
        overrideNative: true,
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        bandwidth: 5000000,
      },
      nativeAudioTracks: false,
      nativeVideoTracks: false,
    },
  };

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="xl" />
        <p className={styles.loadingText}>Loading video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className={styles.errorTitle}>Oops!</h2>
          <p className={styles.errorText}>{error}</p>
          <div className={styles.errorActions}>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <BackIcon />
          <span>Back</span>
        </button>

        {/* Player */}
        <div className={styles.playerWrap}>
          <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
        </div>

        {/* Video Info */}
        {video && (
          <div className={styles.videoInfo}>
            {/* Title & Badges */}
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{video.title}</h1>
              {video.resolutions && video.resolutions.length > 0 && (
                <div className={styles.badges}>
                  {video.resolutions.sort((a, b) => b - a).map((res) => (
                    <Badge key={res} variant={res >= 1080 ? 'accent' : res >= 720 ? 'info' : 'default'} size="sm">
                      {res}p
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Meta */}
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <CalendarIcon />
                <span>Uploaded {formatRelativeDate(video.uploadedOn)}</span>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaDate}>{formatDate(video.uploadedOn)}</span>
              </div>
              {video.lastUpdatedOn && video.lastUpdatedOn !== video.uploadedOn && (
                <div className={styles.metaItem}>
                  <UpdateIcon />
                  <span>Updated {formatRelativeDate(video.lastUpdatedOn)}</span>
                </div>
              )}
            </div>

            <div className={styles.divider} />

            {/* Description */}
            {video.description ? (
              <div className={styles.descriptionWrap}>
                <p
                  className={[
                    styles.description,
                    !descExpanded ? styles.descriptionCollapsed : '',
                  ].join(' ')}
                >
                  {video.description}
                </p>
                {video.description.length > 200 && (
                  <button
                    className={styles.expandBtn}
                    onClick={() => setDescExpanded((p) => !p)}
                  >
                    {descExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            ) : (
              <p className={styles.noDescription}>No description provided.</p>
            )}

          </div>
        )}

        {/* Comments */}
        <div className={styles.commentsWrap}>
          <Comments videoId={videoId} />
        </div>

      </div>
    </div>
  );
};

export default Stream;
