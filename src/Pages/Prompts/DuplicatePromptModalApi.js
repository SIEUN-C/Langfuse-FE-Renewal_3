// src/Pages/Prompts/DuplicatePromptModalApi.js

/**
 * 프롬프트를 복제하는 API 호출 함수
 * @param {string} sourcePromptId - 복제의 원본이 되는 프롬프트의 고유 DB ID
 * @param {string} newName - 새로 생성될 프롬프트의 이름
 * @param {boolean} copyAllVersions - 모든 버전을 복사할지 여부 (true: all, false: single)
 * @param {string} projectId - API를 호출할 프로젝트의 ID
 * @returns {Promise<Object>} 생성된 프롬프트 정보
 */
export const duplicatePrompt = async (sourcePromptId, newName, copyAllVersions, projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required to duplicate a prompt.");
  }

  try {
    const isSingleVersion = !copyAllVersions;

    const input = {
      json: {
        projectId,
        promptId: sourcePromptId,
        name: newName,
        isSingleVersion,
      },
    };

    const url = `/api/trpc/prompts.duplicatePrompt`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data[0]?.error?.json?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // [수정] tRPC 응답이 배열인지 단일 객체인지 확인하고 데이터를 추출합니다.
    const resultData = Array.isArray(data) ? data[0] : data;

    if (!resultData || !resultData.result || !resultData.result.data) {
        // 성공 응답(2xx)이지만 예상한 데이터 구조가 아닌 경우,
        // single version 복제 성공 후의 TypeError를 방지합니다.
        // 이 경우는 성공으로 간주하고, 상세 페이지로 이동할 수 있도록 빈 객체 또는 기본값을 반환합니다.
        console.log("Prompt duplicated successfully, but response format was unexpected.", resultData);
        // navigate 함수가 name 속성을 기대하므로, newName을 포함한 객체를 반환해줍니다.
        return { name: newName };
    }

    return resultData.result.data.json;
  } catch (error) {
    console.error("Failed to duplicate prompt:", error);
    throw error;
  }
};