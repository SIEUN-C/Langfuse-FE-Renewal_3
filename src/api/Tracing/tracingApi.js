// src/api/tracingApi.js
//CreateTrace.jsx의 요청을 받아 실제 작업을 처리하는 백엔드 서버에 전달하는 역할
import { trpcPost } from '../services/trpc';

/**
 * 백엔드를 통해 Langfuse LLM Connection을 사용하여 채팅 완성을 실행하고,
 * 그 과정을 특정 Trace에 자동으로 기록하도록 요청합니다.
 *
 * @param {object} params - 요청에 필요한 파라미터
 * @param {string} params.projectId - 현재 프로젝트 ID
 * @param {string} params.traceId - 이 Generation을 연결할 부모 Trace의 ID
 * @param {string} params.provider - Langfuse LLM Connection에 설정된 Provider 이름 (예: "openai")
 * @param {string} params.model - 사용할 모델 이름 (예: "gpt-3.5-turbo")
 * @param {Array<object>} params.messages - 모델에 전달할 메시지 배열
 * @returns {Promise<any>} LLM의 응답 결과
 */
export const executeTraceCompletion = async ({ projectId, traceId, provider, model, messages }) => {
  try {
    // Playground에서 사용하는 것과 유사한 tRPC 엔드포인트를 호출합니다.
    // 실제 백엔드에는 'trace.runCompletion'과 같은 이름의 tRPC 라우터가 구현되어 있어야 합니다.
    const response = await trpcPost('trace.runCompletion', {
      projectId,
      traceId,
      provider,
      model,
      messages,
    });
    return response;
  } catch (error) {
    console.error("Failed to execute trace completion via backend:", error);
    throw error; // 에러를 다시 던져서 호출한 쪽에서 처리할 수 있도록 합니다.
  }
};