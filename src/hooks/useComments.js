// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import { fetchComments, createComment, deleteComment } from '../api/commentsApi';

/**
 * 댓글 관련 로직을 관리하는 커스텀 훅
 * @param {'TRACE' | 'OBSERVATION'} objectType - 댓글을 달 대상의 타입
 * @param {string} objectId - 댓글을 달 대상의 ID
 */
export const useComments = (objectType, objectId) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 댓글 목록을 불러오는 함수
  const loadComments = useCallback(async () => {
    if (!objectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedComments = await fetchComments({ objectType, objectId });
      setComments(fetchedComments);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [objectType, objectId]);

  // objectId가 변경될 때마다 댓글을 새로 불러옵니다.
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 댓글 추가 함수
  const addComment = async (content) => {
    if (!objectId) return { success: false, error: 'Object ID is missing.' };
    try {
      await createComment({ objectType, objectId, content });
      await loadComments(); // 추가 후 목록 새로고침
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 댓글 삭제 함수
  const removeComment = async (commentId) => {
    if (!objectId) return { success: false, error: 'Object ID is missing.' };
    try {
      await deleteComment({ commentId });
      await loadComments(); // 삭제 후 목록 새로고침
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { comments, isLoading, error, addComment, removeComment };
};