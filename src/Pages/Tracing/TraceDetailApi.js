// src/pages/Tracing/TraceDetailApi.js
// https://api.reference.langfuse.com/#tag/trace/get/api/public/traces/{traceId}
import { langfuse } from '../../lib/langfuse';

/**
 * ID를 기반으로 단일 트레이스의 상세 정보를 가져옵니다.
 */
export const fetchTraceDetails = async (traceId) => {
    try {
        const response = await langfuse.api.traceGet(traceId);
        return response;
    } catch (error) {
        // ▼▼▼ 오류 처리 로직을 더 견고하게 수정합니다 ▼▼▼

        // 디버깅을 위해 실제 오류 객체를 콘솔에 출력합니다.
        console.log("Polling error object:", error);

        // 오류 객체의 'response' 속성 또는 객체 자체에서 status 코드를 확인합니다.
        const status = error?.response?.status || error?.status;

        // status 코드가 404인 경우, 아직 Trace가 서버에 완전히 저장되지 않은 정상적인 대기 상태로 간주하고 null을 반환합니다.
        if (status === 404) {
            return null;
        }

        // 404가 아닌 다른 모든 오류(네트워크, 인증, 서버 내부 오류 등)는 사용자에게 알리기 위해 에러를 발생시킵니다.
        console.error(`Failed to fetch details for trace ${traceId}:`, error);
        throw new Error('트레이스 상세 정보를 불러오는 데 실패했습니다.');
    }
};