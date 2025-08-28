// src/Pages/Tracing/CreateTrace.jsx
import { langfuse } from '../../lib/langfuse';
import { getDefaultLlmConnection } from '../../api/Settings/LLMApi';
import { publicKey, secretKey } from '../../lib/langfuse';

// Basic Auth를 위한 Base64 인코딩
const base64Credentials =
    publicKey && secretKey
        ? btoa(`${publicKey}:${secretKey}`)
        : '';

/**
 * 'New Trace' 버튼 클릭 시 실행되는 메인 함수입니다.
 * @param {string} projectId - Trace를 생성할 현재 프로젝트의 ID
 */
export const createTrace = async (projectId) => {
    try {
        const userInput = prompt("실행할 Input을 입력하세요:", "What are the benefits of using Langfuse?");
        if (!userInput) {
            console.log("Trace creation cancelled by user.");
            return null;
        }

        const defaultConnection = await getDefaultLlmConnection(base64Credentials);
        if (!defaultConnection) {
            alert("설정된 LLM Connection이 없습니다. Settings 메뉴에서 먼저 추가해주세요.");
            return null;
        }

        // ▼▼▼ Trace에 추가할 메타데이터를 변수로 정의합니다. ▼▼▼
        const traceMetadata = { 
            source: "Create Trace Button",
            environment: "development"
        };

        // 부모 Trace를 생성합니다.
        const trace = langfuse.trace({
            name: "realtime-llm-execution",
            userId: "user_realtime_test",
            input: userInput,
            tags: ["realtime-test", defaultConnection.model],
            metadata: traceMetadata, // 로컬 Trace 객체에도 메타데이터를 설정합니다.
        });

        // Playground와 동일한 '/api/chatCompletion' 엔드포인트로 LLM 실행 요청
        const response = await fetch('/api/chatCompletion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                projectId: projectId,
                traceId: trace.id,
                messages: [{ type: 'user', role: 'user', content: userInput }],
                modelParams: {
                    provider: defaultConnection.provider,
                    adapter: defaultConnection.adapter,
                    model: defaultConnection.model,
                    temperature: 0.7,
                },
                streaming: false,
                metadata: traceMetadata, // 👈 백엔드로 메타데이터를 전달합니다.
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }
        
        const completion = await response.json();

        trace.update({
            output: completion.content || "No output received.",
        });

        await langfuse.flush();

        alert(`실시간 실행 및 추적이 완료되었습니다. Trace ID: ${trace.id}`);
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