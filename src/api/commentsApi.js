// src/api/commentsApi.js
import { langfuse } from '../lib/langfuse';

// ... 기존 fetchComments, createComment 함수 ...
export const fetchComments = async ({ objectType, objectId }) => {
  try {
    const response = await langfuse.api.commentsGet({ objectType, objectId });
    return response.data.map(comment => ({
      id: comment.id,
      author: comment.authorUserId || 'Unknown User',
      timestamp: new Date(comment.createdAt).toLocaleString(),
      content: comment.content,
    }));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw new Error('댓글을 불러오는 데 실패했습니다.');
  }
};

export const createComment = async ({ objectType, objectId, content }) => {
    try {
        const response = await langfuse.api.commentCreate({
            objectType,
            objectId,
            content,
        });
        return response;
    } catch (error) {
        console.error("Failed to create comment:", error);
        throw new Error('댓글을 작성하는 데 실패했습니다.');
    }
}

/**
 * 댓글을 삭제합니다.
 * @param {object} params
 * @param {string} params.commentId - 삭제할 댓글의 ID
 */
export const deleteComment = async ({ commentId }) => {
    try {
        // langfuse SDK를 사용하여 댓글 삭제 API를 호출합니다.
        await langfuse.api.commentDelete({ commentId });
    } catch (error) {
        console.error("Failed to delete comment:", error);
        throw new Error('댓글을 삭제하는 데 실패했습니다.');
    }
};