import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videosApi } from '../api';
import { toast } from 'react-toastify';
import Input from '../components/atoms/Input/Input';
import Textarea from '../components/atoms/Textarea/Textarea';
import Button from '../components/atoms/Button/Button';
import FileUpload from '../components/molecules/FileUpload/FileUpload';
import ProgressBar from '../components/molecules/ProgressBar/ProgressBar';
import styles from './Upload.module.css';

const VideoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ImageIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error

  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      errs.title = 'Title must be 100 characters or less';
    }
    if (!videoFile) {
      errs.videoFile = 'Please select a video file to upload';
    }
    return errs;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      if (errors.videoFile) setErrors((prev) => ({ ...prev, videoFile: '' }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnailFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setProgress(0);

    const data = new FormData();
    data.append('title', formData.title.trim());
    if (formData.description.trim()) {
      data.append('description', formData.description.trim());
    }
    data.append('file', videoFile);
    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile);
    }

    try {
      const res = await videosApi.upload(data, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(pct);
      });

      const videoId = res.data?.videoId || res.data?.video?.videoId;
      setUploadedVideoId(videoId);
      setUploadStatus('success');
      toast.success('Video uploaded successfully!');
    } catch (err) {
      setUploadStatus('error');
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
      setErrors({ general: msg });
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFormData({ title: '', description: '' });
    setVideoFile(null);
    setThumbnailFile(null);
    setErrors({});
    setProgress(0);
    setUploading(false);
    setUploadedVideoId(null);
    setUploadStatus('idle');
  };

  // Success State
  if (uploadStatus === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckIcon />
          </div>
          <h2 className={styles.successTitle}>Upload Complete!</h2>
          <p className={styles.successText}>
            Your video has been uploaded successfully and is being processed.
            It may take a few minutes before it's available for streaming.
          </p>
          <div className={styles.successActions}>
            {uploadedVideoId && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/stream/${uploadedVideoId}`)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Video
              </Button>
            )}
            <Button variant="secondary" size="lg" onClick={handleReset}>
              Upload Another
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/')}>
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
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Upload Video</h1>
          <p className={styles.pageSubtitle}>Share your content with the world</p>
        </div>

        <div className={styles.layout}>
          {/* Main Form */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {errors.general && (
                <div className={styles.generalError}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.general}
                </div>
              )}

              {/* Video File */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Video File *</label>
                <FileUpload
                  accept="video/*"
                  onChange={handleVideoChange}
                  label="Click or drag & drop your video here"
                  hint="MP4, MKV, AVI, MOV supported"
                  file={videoFile}
                  error={errors.videoFile}
                  icon={<VideoIcon />}
                />
              </div>

              {/* Title */}
              <Input
                label="Title *"
                type="text"
                placeholder="Enter a compelling title for your video"
                value={formData.title}
                onChange={handleChange('title')}
                error={errors.title}
                hint={`${formData.title.length}/100`}
              />

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Tell viewers what your video is about... (optional)"
                value={formData.description}
                onChange={handleChange('description')}
                rows={4}
                hint="Optional: Describe your video content"
              />

              {/* Thumbnail */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Thumbnail
                  <span className={styles.optionalTag}>Optional</span>
                </label>
                <FileUpload
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  label="Click or drag & drop a thumbnail"
                  hint="JPG, PNG, WEBP supported (recommended 1280×720)"
                  file={thumbnailFile}
                  icon={<ImageIcon />}
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className={styles.progressWrap}>
                  <ProgressBar
                    value={progress}
                    label={progress < 100 ? 'Uploading...' : 'Processing...'}
                    variant={progress < 100 ? 'default' : 'success'}
                    animated={progress < 100}
                  />
                  <p className={styles.progressHint}>
                    {progress < 100
                      ? 'Please keep this page open while uploading.'
                      : 'Upload complete! Processing your video...'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/')}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={uploading}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Tips */}
          <div className={styles.sidebar}>
            <div className={styles.tipsCard}>
              <h3 className={styles.tipsTitle}>Upload Tips</h3>
              <ul className={styles.tipsList}>
                <li className={styles.tip}>
                  <span className={styles.tipDot} />
                  Use a clear, descriptive title to help viewers find your video
                </li>
                <li className={styles.tip}>
                  <span className={styles.tipDot} />
                  Add a detailed description for better discoverability
                </li>
                <li className={styles.tip}>
                  <span className={styles.tipDot} />
                  A custom thumbnail (1280×720) increases click-through rates
                </li>
                <li className={styles.tip}>
                  <span className={styles.tipDot} />
                  Videos are transcoded into multiple resolutions automatically
                </li>
                <li className={styles.tip}>
                  <span className={styles.tipDot} />
                  Processing may take a few minutes after upload completes
                </li>
              </ul>
            </div>

            <div className={styles.formatsCard}>
              <h3 className={styles.tipsTitle}>Supported Formats</h3>
              <div className={styles.formatTags}>
                {['MP4', 'MKV', 'AVI', 'MOV', 'WEBM', 'FLV'].map((fmt) => (
                  <span key={fmt} className={styles.formatTag}>{fmt}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
