// src/api/promptsApi.js

import axios from 'axios';
// import { langfuse } from 'lib/langfuse'; // langfuse 관련 코드가 없으므로 주석 처리 또는 제거

/**
 * [tRPC] 프롬프트 목록 전체를 가져옵니다.
 * @param {string} projectId - 프로젝트 ID를 인자로 받습니다.
 */
export const fetchPrompts = async (projectId) => { // [수정] projectId를 인자로 받도록 변경
  // [수정] projectId가 없으면 API를 호출하지 않고 빈 배열을 반환하여 에러 방지
  if (!projectId) return [];

  try {
    const params = {
      json: {
        projectId: projectId, // [수정] 인자로 받은 projectId 사용
        page: 0,
        limit: 50,
        filter: [],
        orderBy: { column: "createdAt", order: "DESC" },
        searchQuery: null,
      },
      meta: {
        values: {
          searchQuery: ["undefined"]
        }
      }
    };
    const url = `/api/trpc/prompts.all?input=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await axios.get(url);
    const promptsFromServer = response.data.result.data.json.prompts;

    return promptsFromServer.map((prompt) => ({
      id: prompt.name,
      name: prompt.name,
      versions: prompt.version,
      type: prompt.type,
      observations: 0,
      latestVersionCreatedAt: new Date(prompt.createdAt).toLocaleString(),
      tags: prompt.tags || [],
    }));

  } catch (error) {
    console.error("Failed to fetch prompts via tRPC:", error);
    throw new Error(error.response?.data?.error?.message || "Failed to fetch prompts.");
  }
};

/**
 * 인라인 참조에 사용할 수 있는 텍스트 프롬프트 목록을 가져옵니다.
 * @param {string} projectId - 프로젝트 ID를 인자로 받습니다.
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export const fetchPromptLinkOptions = async (projectId) => { // [수정] projectId를 인자로 받도록 변경
  if (!projectId) return [];

  try {
    const input = {
      json: { projectId }, // [수정] 인자로 받은 projectId 사용
    };

    const url = `/api/trpc/prompts.getPromptLinkOptions?input=${encodeURIComponent(JSON.stringify(input))}`;
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const prompts = data.result?.data?.json;

    if (!Array.isArray(prompts)) {
      console.error("API response is not an array:", data);
      return [];
    }

    return prompts;

  } catch (error) {
    console.error("Failed to fetch prompt link options:", error);
    return [];
  }
};

/**
 * [tRPC] 특정 프롬프트의 모든 버전 정보를 가져옵니다. (상세 페이지용)
 * @param {string} promptName - 프롬프트 이름
 * @param {string} projectId - 프로젝트 ID
 */
export const fetchPromptVersions = async (promptName, projectId) => { // [수정] projectId를 인자로 받도록 변경
  if (!projectId) return [];

  try {
    const params = { json: { name: promptName, projectId: projectId } }; // [수정] 인자로 받은 projectId 사용
    const url = `/api/trpc/prompts.allVersions?input=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await axios.get(url);
    const versionsResponse = response.data.result.data.json.promptVersions;

    return versionsResponse.map((v) => ({
      id: v.version,
      label: v.commitMessage || `Version ${v.version}`,
      labels: v.labels,
      details: v.updatedAt ? new Date(v.updatedAt).toLocaleString() : 'N/A',
      author: v.creator,
      prompt: Array.isArray(v.prompt) ? {
        user: v.prompt.find(p => p.role === 'user')?.content ?? '',
        system: v.prompt.find(p => p.role === 'system')?.content,
      } : { user: v.prompt },
      config: v.config,
      tags: v.tags,
      commitMessage: v.commitMessage,
      useprompts: { python: "# Python code snippet", jsTs: "// JS/TS code snippet" },
    })).sort((a, b) => b.id - a.id);

  } catch (error) {
    console.error(`Failed to fetch versions for prompt ${promptName}:`, error);
    throw new Error(error.response?.data?.error?.message || `Failed to fetch versions for '${promptName}'.`);
  }
};

/**
 * [tRPC] 특정 이름의 프롬프트를 모든 버전을 삭제하여 제거합니다.
 * @param {string} promptName - 프롬프트 이름
 * @param {string} projectId - 프로젝트 ID
 */
export const deletePrompt = async (promptName, projectId) => { // [수정] projectId를 인자로 받도록 변경
  if (!projectId) throw new Error("Project ID is required to delete a prompt.");

  try {
    const versions = await getAllPromptVersions(promptName, projectId); // [수정] projectId 전달
    if (versions.length === 0) {
      console.log(`"${promptName}" 프롬프트에 삭제할 버전이 없습니다.`);
      return;
    }

    for (const version of versions) {
      // deletePromptVersion이 완료될 때까지 기다린 후, 다음 버전 삭제를 진행합니다.
      await deletePromptVersion(version.id, projectId);
    }

  } catch (error) {
    throw error;
  }
};

const getAllPromptVersions = async (promptName, projectId) => {
  const params = { json: { name: promptName, projectId } };
  const url = `/api/trpc/prompts.allVersions?input=${encodeURIComponent(JSON.stringify(params))}`;
  const response = await axios.get(url);
  // API 응답에 버전의 고유 ID가 'id' 필드에 있다고 가정합니다. (만약 다른 이름이라면 그 이름으로 변경해야 합니다)
  return response.data?.result?.data?.json?.promptVersions || [];
};

const deletePromptVersion = async (promptVersionId, projectId) => {
  try {
    // API 요청 본문(payload)이 서버의 요구사항과 일치하는지 확인합니다.
    // 보통 'promptVersionId' 또는 'versionId'와 같은 키를 사용합니다.
    await axios.post('/api/trpc/prompts.deleteVersion', {
      json: {
        promptVersionId,
        projectId,
      },
    });
  } catch (error) {
    console.error(`Failed to delete prompt version ${promptVersionId}:`, error);
    const errorMessage = error.response?.data?.error?.message || `Failed to delete prompt version.`;
    throw new Error(errorMessage);
  }
};

/**
 * [tRPC] 프롬프트의 태그를 업데이트합니다.
 * @param {string} promptName - 프롬프트 이름
 * @param {string[]} tags - 업데이트할 태그 배열
 * @param {string} projectId - 프로젝트 ID
 */
export const updatePromptTags = async (promptName, tags, projectId) => { // [수정] projectId를 인자로 받도록 변경
  if (!projectId) throw new Error("Project ID is required to update tags.");

  try {
    await axios.post('/api/trpc/prompts.updateTags', {
      json: {
        projectId: projectId, // [수정] 인자로 받은 projectId 사용
        name: promptName,
        tags,
      },
    });
  } catch (error) {
    console.error(`Failed to update tags for prompt ${promptName}:`, error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update tags.');
  }
};