// PromptsNewApi.js
import axios from 'axios';

/**
 * [tRPC] 새로운 프롬프트를 생성하거나 새 버전을 만듭니다.
 * @param {object} params - 프롬프트 생성에 필요한 파라미터 객체
 * @param {string} projectId - API를 호출할 프로젝트의 ID
 */
export const createPromptOrVersion = async (params, projectId) => { // [수정] projectId를 두 번째 인자로 받도록 변경
  // [수정] projectId가 없으면 에러를 발생시켜 API 호출을 막습니다.
  if (!projectId) {
    throw new Error("Project ID is missing. Cannot create prompt.");
  }

  const {
    promptName,
    promptType,
    chatContent,
    textContent,
    config,
    labels,
    commitMessage,
  } = params;

  const activeLabels = Object.entries(labels)
    .filter(([, isActive]) => isActive)
    .map(([label]) => label);

  const payload = {
    json: {
      projectId: projectId, // [수정] 인자로 전달받은 projectId를 사용
      name: promptName,
      type: promptType.toLowerCase(),
      prompt: promptType === 'Text'
        ? textContent
        : chatContent
            .filter(msg => msg.role !== 'Placeholder')
            .map(({ role, content }) => ({ role: role.toLowerCase(), content: content || '' })),
      config: JSON.parse(config),
      labels: activeLabels,
      commitMessage: commitMessage ? commitMessage : null,
    },
    meta: {
      values: {
        commitMessage: ["undefined"]
      }
    }
  };

  try {
    await axios.post('/api/trpc/prompts.create', payload);
  } catch (error) {
    console.error("Failed to create prompt via tRPC:", error);
    // [수정] 에러 메시지를 좀 더 구체적으로 전달합니다.
    const errorMessage = error.response?.data?.error?.message || "An unknown error occurred while creating the prompt.";
    throw new Error(errorMessage);
  }
};