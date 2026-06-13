import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { videosApi, analyticsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/molecules/VideoCard/VideoCard';
import Spinner from '../components/atoms/Spinner/Spinner';
import Button from '../components/atoms/Button/Button';
import styles from './Home.module.css';

const SearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
  </svg>
);

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const ContinueWatchingPopup = ({ item, onPlay, onDismiss }) => {
  const progressPercent = Math.min(100, Math.max(0, (item.lastPlaybackSecond / (item.duration || 300)) * 100));

  return (
    <div className={styles.cwPopup} role="complementary" aria-label="Continue watching">
      <div className={styles.cwPopupInner}>
        {/* Dismiss button */}
        <button className={styles.cwDismiss} onClick={onDismiss} aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <p className={styles.cwPopupLabel}>Continue watching</p>

        {/* Thumbnail */}
        <div className={styles.cwPopupThumbWrap} onClick={onPlay}>
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className={styles.cwPopupThumb}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={styles.cwPopupThumbFallback}
            style={{ display: item.thumbnailUrl ? 'none' : 'flex' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          {/* Play overlay */}
          <div className={styles.cwPopupPlayOverlay}>
            <div className={styles.cwPopupPlayBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
          {/* Timestamp */}
          <span className={styles.cwPopupTimestamp}>{formatDuration(item.lastPlaybackSecond)}</span>
          {/* Progress bar */}
          <div className={styles.cwPopupProgress}>
            <div className={styles.cwPopupProgressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Info */}
        <div className={styles.cwPopupInfo}>
          <p className={styles.cwPopupTitle}>{item.title}</p>
          <button className={styles.cwPopupPlayText} onClick={onPlay}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Resume
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [continueWatching, setContinueWatching] = useState(null);
  const [cwDismissed, setCwDismissed] = useState(false);
  const cwTimerRef = useRef(null);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchContinueWatching = useCallback(async () => {
    try {
      const res = await analyticsApi.getContinueWatching();
      const cw = res.data.continuewatching || null;
      setContinueWatching(cw);
      // Auto-dismiss popup after 10 seconds
      if (cw) {
        if (cwTimerRef.current) clearTimeout(cwTimerRef.current);
        cwTimerRef.current = setTimeout(() => {
          setCwDismissed(true);
        }, 10000);
      }
    } catch {
      setContinueWatching(null);
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cwTimerRef.current) clearTimeout(cwTimerRef.current);
    };
  }, []);

  const fetchRecommended = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await videosApi.getRecommended();
      setVideos(res.data.videos || []);
    } catch (err) {
      setError('Failed to load videos. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearch = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await videosApi.search(query);
      setVideos(res.data.videos || []);
    } catch (err) {
      setError('Search failed. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearchQuery(query);

    if (query) {
      fetchSearch(query);
    } else if (isAuthenticated) {
      fetchRecommended();
      setCwDismissed(false);
      fetchContinueWatching();
    } else {
      setVideos([]);
      setContinueWatching(null);
      setLoading(false);
    }
  }, [location.search, isAuthenticated, authLoading, fetchRecommended, fetchSearch, fetchContinueWatching]);

  const handleContinueWatching = () => {
    if (continueWatching?.videoId) {
      if (cwTimerRef.current) clearTimeout(cwTimerRef.current);
      setCwDismissed(true);
      navigate(`/stream/${continueWatching.videoId}`, {
        state: { resumeAt: continueWatching.lastPlaybackSecond },
      });
    }
  };

  const handleCwDismiss = () => {
    if (cwTimerRef.current) clearTimeout(cwTimerRef.current);
    setCwDismissed(true);
  };

  if (authLoading) {
    return (
      <div className={styles.centered}>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero Banner - shown when not authenticated and no search */}
      {!isAuthenticated && !searchQuery && (
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>
              <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#FF0000" />
                <path d="M11 9L23 16L11 23V9Z" fill="white" />
              </svg>
            </div>
            <h1 className={styles.heroTitle}>Welcome to StreamVault</h1>
            <p className={styles.heroSubtitle}>
              Your personal video streaming platform. Sign in to discover, watch, and share amazing videos.
            </p>
            <div className={styles.heroActions}>
              <Link to="/login">
                <Button variant="primary" size="lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroDecoration}>
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
            <div className={styles.decorCircle3} />
          </div>
        </div>
      )}

      <div className={styles.container}>


        {/* Search Results Header */}
        {searchQuery && (
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <SearchIcon />
              <div>
                <h2 className={styles.sectionTitle}>
                  Search results for <span className={styles.queryText}>"{searchQuery}"</span>
                </h2>
                {!loading && (
                  <p className={styles.sectionSubtitle}>
                    {videos.length} video{videos.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Recommended Section Header */}
        {isAuthenticated && !searchQuery && (
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <PlayIcon />
              <div>
                <h2 className={styles.sectionTitle}>Recommended for you</h2>
                <p className={styles.sectionSubtitle}>Videos picked just for you</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCard key={i} loading />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} style={{ color: 'var(--error)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>Something went wrong</h3>
            <p className={styles.emptyText}>{error}</p>
            <Button
              variant="primary"
              onClick={() => searchQuery ? fetchSearch(searchQuery) : fetchRecommended()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* No videos - authenticated, no search results */}
        {!loading && !error && videos.length === 0 && isAuthenticated && !searchQuery && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <PlayIcon />
            </div>
            <h3 className={styles.emptyTitle}>No videos yet</h3>
            <p className={styles.emptyText}>Be the first to upload a video!</p>
            <Link to="/upload">
              <Button variant="primary">Upload Video</Button>
            </Link>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && videos.length === 0 && searchQuery && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <SearchIcon />
            </div>
            <h3 className={styles.emptyTitle}>No videos found</h3>
            <p className={styles.emptyText}>
              No results for <strong>"{searchQuery}"</strong>. Try different keywords.
            </p>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Not authenticated, search results */}
        {!loading && !error && videos.length === 0 && searchQuery && !isAuthenticated && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <LockIcon />
            </div>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && videos.length > 0 && (
          <div className={styles.grid}>
            {videos.map((video, idx) => (
              <VideoCard key={video.videoId || idx} video={video} />
            ))}
          </div>
        )}
      </div>

      {/* ── Continue Watching Popup (bottom-right, YouTube style) ── */}
      {isAuthenticated && !searchQuery && continueWatching && !cwDismissed && (
        <ContinueWatchingPopup
          item={continueWatching}
          onPlay={handleContinueWatching}
          onDismiss={handleCwDismiss}
        />
      )}
    </div>
  );
};

export default Home;
