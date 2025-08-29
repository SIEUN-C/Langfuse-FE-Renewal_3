// DuplicatePromptModalApi.js

/**
 * 프롬프트를 복제하는 API 호출 함수
 * @param {string} sourcePromptId - 복제의 원본이 되는 프롬프트 버전의 고유 DB ID
 * @param {string} newName - 새로 생성될 프롬프트의 이름
 * @param {boolean} copyAllVersions - 모든 버전을 복사할지 여부
 * @param {string} projectId - API를 호출할 프로젝트의 ID
 * @returns {Promise<Object>} 생성된 프롬프트 정보
 */
export const duplicatePrompt = async (sourcePromptId, newName, copyAllVersions, projectId) => {
  // [수정] projectId를 마지막 인자로 받도록 변경

  // [추가] projectId가 없으면 에러를 발생시킵니다.
  if (!projectId) {
    throw new Error("Project ID is required to duplicate a prompt.");
  }

  try {
    const isSingleVersion = !copyAllVersions;

    const input = {
      json: {
        projectId, // [수정] 인자로 받은 projectId 사용
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

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData[0]?.error?.json?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data[0].result.data.json;
  } catch (error) {
    console.error("Failed to duplicate prompt:", error);
    throw error;
  }
};