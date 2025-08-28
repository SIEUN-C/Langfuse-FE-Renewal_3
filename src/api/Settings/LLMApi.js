// ---▼ 에러를 더 스마트하게 처리하는 헬퍼 함수 ▼---
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        // 응답이 JSON 형식이면, JSON 안의 에러 메시지를 사용
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }
        // 응답이 JSON이 아니면 (HTML 에러 페이지 등), 상태 코드로 에러 메시지를 생성
        throw new Error(`Server returned a non-JSON error: ${response.status} ${response.statusText}`);
    }
    // DELETE 요청처럼 응답 본문이 없는 성공 사례를 위해 확인
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response; // 본문이 없거나 JSON이 아닌 성공 응답은 그대로 반환
};

// GET: LLM Connection 목록 가져오기
export const getLlmConnections = async (page, limit, base64Credentials) => {
    const response = await fetch(`/api/public/llm-connections?page=${page}&limit=${limit}`, {
        headers: {
            'Authorization': `Basic ${base64Credentials}`
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return handleApiResponse(response);
};

// PUT: LLM Connection 생성 또는 수정 (Upsert)
export const saveLlmConnection = async (connectionData, base64Credentials) => {
    const response = await fetch('/api/public/llm-connections', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${base64Credentials}`
        },
        body: JSON.stringify({
            provider: connectionData.provider,
            adapter: connectionData.adapter,
            secretKey: connectionData.apiKey,
            baseURL: connectionData.baseUrl || null,
            withDefaultModels: connectionData.enableDefaultModels,
            customModels: connectionData.customModels,
            extraHeaders: connectionData.extraHeaders,
        })
    });
    return handleApiResponse(response);
};

// DELETE: LLM Connection 삭제
export const deleteLlmConnection = async (provider, base64Credentials) => {
    const encodedProvider = encodeURIComponent(provider);
    const response = await fetch(`/api/public/llm-connections/${encodedProvider}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Basic ${base64Credentials}`
        }
    });
    return handleApiResponse(response);
};

// ▼ 이 함수는 'CreateTrace.jsx'만을 위해 추가되었습니다.
// "전체 목록 말고, 그냥 기본값 하나만 줘" 라는 요청을 처리합니다.
/**
 * Langfuse에 설정된 첫 번째(기본) LLM Connection 정보를 가져옵니다.
 * @param {string} base64Credentials - 인증을 위한 Base64 인코딩된 자격 증명
 * @returns {Promise<{provider: string, model: string}|null>} provider와 model이 포함된 객체 또는 null
 */
export const getDefaultLlmConnection = async (base64Credentials) => {
    // 첫 페이지만 조회하여 첫 번째 연결 정보를 가져옵니다.
    const result = await getLlmConnections(1, 1, base64Credentials);

    if (result && result.data && result.data.length > 0) {
        const connection = result.data[0];
        // 해당 연결에 커스텀 모델이 정의되어 있으면 첫 번째 모델을 사용하고, 없으면 기본값으로 'gpt-3.5-turbo'를 사용합니다.
        const model = connection.customModels && connection.customModels.length > 0
            ? connection.customModels[0]
            : 'gpt-3.5-turbo';

        return {
            provider: connection.provider,
            model: model,
        };
    }
    // 설정된 연결이 없으면 null을 반환합니다.
    return null;
};