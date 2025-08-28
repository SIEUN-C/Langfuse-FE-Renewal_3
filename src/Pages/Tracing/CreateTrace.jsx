// src/Pages/Tracing/CreateTrace.jsx
import { langfuse } from '../../lib/langfuse';
import { getDefaultLlmConnection } from 'api/Settings/LLMApi';
import { publicKey, secretKey } from '../../lib/langfuse';

// Basic Auth를 위한 Base64 인코딩
const base64Credentials =
    publicKey && secretKey
        ? btoa(`${publicKey}:${secretKey}`)
        : '';

/**
 * 'New Trace' 버튼 클릭 시 실행되는 메인 함수입니다.
 * 사용자에게 상세 정보를 입력받아 실시간으로 LLM을 실행하고 모든 관련 지표를 추적합니다.
 * @param {string} projectId - Trace를 생성할 현재 프로젝트의 ID
 * @returns {Promise<string|null>} 생성된 Trace의 ID 또는 실패 시 null
 */
export const createTrace = async (projectId) => {
    try {
        // 1. 사용자로부터 상세 정보 입력받기
        const userInput = prompt("실행할 Input을 입력하세요:", "What are the benefits of using Langfuse?");
        if (!userInput) return null;

        const sessionId = prompt("Trace에 할당할 Session ID를 입력하세요 (선택 사항):", `session-${Date.now()}`);
        const tagsInput = prompt("Trace에 할당할 태그를 입력하세요 (쉼표로 구분, 선택 사항):", "realtime-test,frontend-generated");
        const version = prompt("Trace에 할당할 Version을 입력하세요 (선택 사항):", "1.0.0");
        const release = prompt("Trace에 할당할 Release를 입력하세요 (선택 사항):", "production-v2");
        const environment = prompt("Trace에 할당할 Environment를 입력하세요 (선택 사항):", "development");
        
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        // 2. Langfuse에 설정된 기본 LLM Connection 정보 가져오기
        const defaultConnection = await getDefaultLlmConnection(base64Credentials);
        if (!defaultConnection) {
            alert("설정된 LLM Connection이 없습니다. Settings 메뉴에서 먼저 추가해주세요.");
            return null;
        }

        const traceMetadata = { 
            source: "Create Trace Button",
            environment: environment || undefined,
        };
        
        // 3. 클라이언트에서 먼저 Trace의 뼈대를 생성합니다. (이전의 안정적인 방식으로 복귀)
        const trace = langfuse.trace({
            name: "realtime-llm-execution-final",
            userId: "user_realtime_test",
            sessionId: sessionId || undefined,
            input: userInput,
            tags: tags,
            version: version || undefined,
            release: release || undefined,
            metadata: traceMetadata,
        });

        // 4. Latency 측정을 시작하고, 백엔드에 LLM 실행 및 'Generation' 생성을 요청합니다.
        const startTime = Date.now();

        const response = await fetch('/api/chatCompletion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                projectId: projectId,
                traceId: trace.id, // 생성된 Trace의 ID를 전달하여 Generation을 연결
                messages: [{ type: 'user', role: 'user', content: userInput }],
                modelParams: {
                    provider: defaultConnection.provider,
                    adapter: defaultConnection.adapter,
                    model: defaultConnection.model,
                    temperature: 0.7,
                },
                streaming: false,
            }),
        });
        
        const endTime = Date.now();
        const latencyInSeconds = (endTime - startTime) / 1000;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || errorData.message || `API Error: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        const completion = await response.json();

        // 5. 백엔드로부터 받은 결과와 직접 측정한 Latency로 클라이언트의 Trace 정보를 최종 업데이트합니다.
        trace.update({
            output: completion.content || "No output received.",
            latency: latencyInSeconds,
        });

        // 6. 모든 데이터를 Langfuse 서버로 전송합니다.
        await langfuse.flush();

        alert(`실시간 실행 및 추적이 완료되었습니다. Trace ID: ${trace.id}`);
        
        // 7. Polling을 시작할 수 있도록 생성된 Trace ID를 반환합니다.
        return trace.id;

    } catch (error) {
        console.error("실시간 Trace 생성 중 오류 발생:", error);
        alert(`오류가 발생했습니다: ${error.message}`);
        return null;
    }
};

// updateTrace 함수는 기존 기능을 유지합니다.
export const updateTrace = async (trace, callback) => {
    if (!trace || !trace.id) {
        alert("업데이트할 유효한 Trace 객체가 전달되지 않았습니다.");
        return;
    }
    try {
        trace.update({
            metadata: {
                tag: "long-running-test-updated",
                updatedAt: new Date().toISOString()
            },
        });
        
        await langfuse.flush();
        alert(`Trace가 업데이트되었습니다. ID: ${trace.id}`);
        if (callback) {
            callback();
        }
    } catch (error) {
        console.error("Trace 업데이트 중 오류 발생:", error);
        alert("Trace 업데이트에 실패했습니다. 콘솔을 확인해주세요.");
    }
};
