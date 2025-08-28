// src/Pages/Tracing/CreateTrace.jsx
import { langfuse } from '../../lib/langfuse';
import { executeTraceCompletion } from '../../api/tracingApi';
// LLM Connection API와 인증 정보를 import 합니다.
import { getDefaultLlmConnection } from '../../api/Settings/LLMApi';
import { publicKey, secretKey } from '../../lib/langfuse';

// Basic Auth를 위한 Base64 인코딩
const base64Credentials =
    publicKey && secretKey
        ? btoa(`${publicKey}:${secretKey}`)
        : '';

/**
 * Langfuse에 설정된 기본 LLM Connection을 사용하여 Trace를 생성하는 함수
 * @returns {Promise<string|null>} 생성된 Trace의 ID 또는 실패 시 null
 */
export const createTrace = async () => {
  try {
    // 1. Langfuse에 설정된 기본 LLM Connection 정보를 가져옵니다.
    console.log("Fetching default LLM connection...");
    const defaultConnection = await getDefaultLlmConnection(base64Credentials);

    // 2. 설정된 연결이 없으면 사용자에게 알리고 함수를 종료합니다.
    if (!defaultConnection) {
      alert("No LLM Connection found in Langfuse settings. Please configure a connection first.");
      return null;
    }
    console.log("Using default connection:", defaultConnection);

    // 3. 부모 Trace 객체를 생성합니다.
    const trace = langfuse.trace({
      name: "chat-with-default-model",
      userId: "user_0824_default",
      metadata: { from: "Default LLM Connection" },
      tags: ["default-model-test"],
    });

    // 4. 가져온 기본 모델 정보로 백엔드에 LLM 완성을 요청합니다.
    const completion = await executeTraceCompletion({
        projectId: "default-project", // 실제 프로젝트 ID로 교체 필요
        traceId: trace.id,
        provider: defaultConnection.provider,
        model: defaultConnection.model,
        messages: [{ role: "user", content: `Hello, this trace was generated using the default model: ${defaultConnection.model}` }],
    });

    // 5. 결과로 Trace를 업데이트하고 서버로 전송합니다.
    trace.update({
        output: completion.output || "No content returned from backend.",
    });
    await langfuse.flush();

    alert(`'${defaultConnection.model}' 모델을 사용하여 Trace를 생성했습니다. ID: ${trace.id}`);
    
    return trace.id;

  } catch (error) {
    console.error("기본 LLM Connection을 사용한 Trace 생성 중 오류 발생:", error);
    alert(`Trace 생성에 실패했습니다: ${error.message}`);
    return null;
  }
};

// updateTrace 함수는 기존과 동일하게 유지합니다.
export const updateTrace = async (trace, callback) => {
    // ... (기존 코드와 동일)
};