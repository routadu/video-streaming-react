import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ options, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const mergedOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        preload: 'auto',
        ...options,
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
          ...(options?.html5 || {}),
        },
      };

      const player = (playerRef.current = videojs(videoElement, mergedOptions, () => {
        try {
          player.hlsQualitySelector({ displayCurrentQuality: true });
        } catch (e) {
          // Plugin may not be available
        }
        if (onReady) onReady(player);
      }));
    } else {
      const player = playerRef.current;
      if (options?.autoplay !== undefined) player.autoplay(options.autoplay);
      if (options?.sources) player.src(options.sources);
    }
  }, [options, onReady]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className={styles.playerContainer}>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
