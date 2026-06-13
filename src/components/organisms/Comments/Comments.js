import React, { useState, useEffect, useCallback, useRef } from 'react';
import { commentsApi } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../atoms/Spinner/Spinner';
import styles from './Comments.module.css';

const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
};

const getInitials = (username) => {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
};

const getAvatarColor = (username) => {
  if (!username) return '#555';
  const colors = [
    '#e53935', '#d81b60', '#8e24aa', '#5e35b1',
    '#1e88e5', '#00acc1', '#00897b', '#43a047',
    '#fb8c00', '#f4511e',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// ── Icons ──────────────────────────────────────────────────────────────────

const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CommentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ── CommentInput ───────────────────────────────────────────────────────────

const CommentInput = ({ placeholder, onSubmit, onCancel, autoFocus = false, compact = false }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(autoFocus);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText('');
      setFocused(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={[styles.commentInputWrap, compact ? styles.commentInputCompact : ''].filter(Boolean).join(' ')}>
      <textarea
        ref={textareaRef}
        className={[styles.commentTextarea, focused ? styles.commentTextareaFocused : ''].filter(Boolean).join(' ')}
        placeholder={placeholder || 'Add a comment...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        rows={focused ? 3 : 1}
        maxLength={1000}
      />
      {focused && (
        <div className={styles.commentInputActions}>
          <span className={styles.charCount}>{text.length}/1000</span>
          <div className={styles.commentInputBtns}>
            {onCancel && (
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setText('');
                  setFocused(false);
                  onCancel();
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
            >
              {submitting ? <Spinner size="sm" /> : <><SendIcon /><span>Comment</span></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── RepliesSection ─────────────────────────────────────────────────────────

const RepliesSection = ({ commentId, replyCount, videoId, currentUsername, onNewReply }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadReplies = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await commentsApi.getReplies(commentId);
      setReplies(res.data.content || []);
      setLoaded(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [commentId, loaded]);

  const toggleReplies = async () => {
    if (!expanded) {
      await loadReplies();
    }
    setExpanded((p) => !p);
  };

  // Expose addReply so parent can push new reply to this list
  const addReply = useCallback((reply) => {
    setReplies((prev) => [...prev, reply]);
    setLoaded(true);
    setExpanded(true);
  }, []);

  // Pass addReply up to parent via callback
  useEffect(() => {
    if (onNewReply) onNewReply(addReply);
  }, [onNewReply, addReply]);

  const handleDeleteReply = async (replyId) => {
    try {
      await commentsApi.deleteComment(replyId);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch {
      // ignore
    }
  };

  const total = loaded ? replies.length : replyCount;

  if (total === 0 && !loaded) return null;

  return (
    <div className={styles.repliesSection}>
      {total > 0 && (
        <button className={styles.toggleRepliesBtn} onClick={toggleReplies}>
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          <span>{expanded ? 'Hide' : 'View'} {total} {total === 1 ? 'reply' : 'replies'}</span>
        </button>
      )}

      {loading && (
        <div className={styles.repliesLoading}>
          <Spinner size="sm" />
        </div>
      )}

      {expanded && !loading && (
        <div className={styles.repliesList}>
          {replies.map((reply) => (
            <div key={reply.id} className={styles.replyItem}>
              <div
                className={styles.avatar}
                style={{ background: getAvatarColor(reply.authorUsername), width: 28, height: 28, minWidth: 28, fontSize: 11 }}
              >
                {getInitials(reply.authorUsername)}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>@{reply.authorUsername}</span>
                  <span className={styles.commentDate}>{formatRelativeDate(reply.createdAt)}</span>
                </div>
                <p className={styles.commentText}>{reply.text}</p>
                {currentUsername && currentUsername === reply.authorUsername && (
                  <div className={styles.commentActions}>
                    <button
                      className={[styles.actionBtn, styles.deleteBtn].join(' ')}
                      onClick={() => handleDeleteReply(reply.id)}
                      title="Delete reply"
                    >
                      <DeleteIcon />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CommentItem ────────────────────────────────────────────────────────────

const CommentItem = ({ comment, videoId, currentUsername, isAuthenticated, onDelete }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const addReplyRef = useRef(null);

  const handleAddReplyRef = useCallback((fn) => {
    addReplyRef.current = fn;
  }, []);

  const handleReplySubmit = async (text) => {
    const res = await commentsApi.postComment(videoId, text, comment.id);
    const newReply = res.data;
    if (addReplyRef.current) {
      addReplyRef.current(newReply);
    }
    setShowReplyInput(false);
  };

  return (
    <div className={styles.commentItem}>
      <div
        className={styles.avatar}
        style={{ background: getAvatarColor(comment.authorUsername) }}
      >
        {getInitials(comment.authorUsername)}
      </div>

      <div className={styles.commentBody}>
        <div className={styles.commentHeader}>
          <span className={styles.commentAuthor}>@{comment.authorUsername}</span>
          <span className={styles.commentDate}>{formatRelativeDate(comment.createdAt)}</span>
        </div>

        <p className={styles.commentText}>{comment.text}</p>

        <div className={styles.commentActions}>
          {isAuthenticated && (
            <button
              className={styles.actionBtn}
              onClick={() => setShowReplyInput((p) => !p)}
            >
              <ReplyIcon />
              <span>Reply</span>
            </button>
          )}
          {currentUsername && currentUsername === comment.authorUsername && (
            <button
              className={[styles.actionBtn, styles.deleteBtn].join(' ')}
              onClick={() => onDelete(comment.id)}
              title="Delete comment"
            >
              <DeleteIcon />
              <span>Delete</span>
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className={styles.replyInputWrap}>
            <CommentInput
              placeholder={`Reply to @${comment.authorUsername}...`}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyInput(false)}
              autoFocus={true}
              compact={true}
            />
          </div>
        )}

        <RepliesSection
          commentId={comment.id}
          replyCount={comment.replyCount}
          videoId={videoId}
          currentUsername={currentUsername}
          onNewReply={handleAddReplyRef}
        />
      </div>
    </div>
  );
};

// ── Main Comments Component ────────────────────────────────────────────────

const Comments = ({ videoId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const currentUsername = user?.username || null;

  const fetchComments = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const res = await commentsApi.getComments(videoId, pageNum);
      const data = res.data;
      const fetched = data.content || [];
      if (append) {
        setComments((prev) => [...prev, ...fetched]);
      } else {
        setComments(fetched);
      }
      setHasMore(!data.last);
      setTotalElements(data.totalElements || 0);
      setPage(pageNum);
    } catch {
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments(0, false);
  }, [fetchComments]);

  const handleNewComment = async (text) => {
    const res = await commentsApi.postComment(videoId, text);
    const newComment = res.data;
    setComments((prev) => [newComment, ...prev]);
    setTotalElements((prev) => prev + 1);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalElements((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleLoadMore = () => {
    fetchComments(page + 1, true);
  };

  return (
    <div className={styles.commentsSection}>
      {/* Header */}
      <div className={styles.commentsHeader}>
        <h3 className={styles.commentsTitle}>
          <CommentIcon />
          <span>Comments</span>
          {totalElements > 0 && (
            <span className={styles.commentCount}>{totalElements}</span>
          )}
        </h3>
      </div>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <div className={styles.newCommentRow}>
          <div
            className={styles.avatar}
            style={{ background: getAvatarColor(currentUsername) }}
          >
            {getInitials(currentUsername)}
          </div>
          <CommentInput
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            onSubmit={handleNewComment}
          />
        </div>
      ) : (
        <div className={styles.loginPrompt}>
          <span>Please </span>
          <a href="/login" className={styles.loginLink}>sign in</a>
          <span> to comment</span>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="md" />
          <span>Loading comments...</span>
        </div>
      ) : error ? (
        <div className={styles.errorWrap}>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={() => fetchComments(0, false)}>
            Retry
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className={styles.emptyWrap}>
          <CommentIcon />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              videoId={videoId}
              currentUsername={currentUsername}
              isAuthenticated={isAuthenticated}
              onDelete={handleDeleteComment}
            />
          ))}

          {hasMore && (
            <button
              className={styles.loadMoreBtn}
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? <Spinner size="sm" /> : 'Load more comments'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Comments;
