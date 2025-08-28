// ---▼ 에러를 더 스마트하게 처리하는 헬퍼 함수 ▼---
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        // 응답이 JSON 형식이면, JSON 안의 에러 메시지를 사용
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            // 서버 에러 상세 내용 콘솔에 출력
            console.error('Server error details:', errorData);
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
    // 요청에 보낼 데이터 객체를 먼저 정의
    const body = {
        provider: connectionData.provider,
        adapter: connectionData.adapter,
        baseURL: connectionData.baseUrl || null, // 값이 없으면 null로 보냄
        withDefaultModels: connectionData.enableDefaultModels,
        customModels: connectionData.customModels,
        extraHeaders: connectionData.extraHeaders,
    };

    // 사용자가 새 API 키를 입력했을 때만 secretKey 필드를 추가함
    // 이렇게 하면 키를 변경하지 않을 때는 secretKey 필드 자체가 요청에 포함되지 않음
    if (connectionData.apiKey) {
        body.secretKey = connectionData.apiKey;
    }

    const response = await fetch('/api/public/llm-connections', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${base64Credentials}`
        },
        body: JSON.stringify(body)
    });
    return handleApiResponse(response);
};

// DELETE: LLM Connection 삭제 (미구현)
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