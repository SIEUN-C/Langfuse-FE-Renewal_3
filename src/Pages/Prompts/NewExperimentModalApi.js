// src/Pages/Prompts/NewExperimentModalApi.js

import { langfuse } from '../../lib/langfuse';

function unwrapTrpcJson(json) {
  return json?.result?.data?.json ?? json?.result?.data ?? json;
}

export const fetchAllPromptNames = async () => {
  try {
    const response = await langfuse.api.promptsList({});
    const prompts = response.data || [];
    const promptNames = [...new Set(prompts.map(p => p.name))];
    return promptNames;
  } catch (error) {
    console.error("Failed to fetch all prompt names:", error);
    return [];
  }
};

export const fetchVersionsForPrompt = async (promptName) => {
  if (!promptName) return [];
  try {
    const response = await langfuse.api.promptsList({ name: promptName });
    const promptInfo = response.data?.[0];
    return promptInfo?.versions || [];
  } catch (error) {
    console.error(`Failed to fetch versions for prompt "${promptName}":`, error);
    return [];
  }
};

export const fetchLlmConnections = async (projectId) => {
  if (!projectId) {
    console.warn("fetchLlmConnections를 호출하려면 projectId가 필요합니다.");
    return [];
  }
  try {
    const encodedInput = encodeURIComponent(JSON.stringify({ json: { projectId } }));
    const response = await fetch(`/api/trpc/llmApiKey.all?input=${encodedInput}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`LLM Connections API 호출에 실패했습니다 (상태 코드: ${response.status})`);
    }
    const jsonResponse = await response.json();
    const connections = unwrapTrpcJson(jsonResponse);
    return connections?.data || [];
  } catch (error) {
    console.error("LLM connections (API Keys)를 가져오는 데 실패했습니다:", error);
    return [];
  }
};

// --- ▼▼▼ [수정] API 경로를 'datasets.allDatasets'로, 파라미터를 서버 요구사항에 맞게 수정합니다. ▼▼▼ ---
/**
 * 프로젝트에 속한 모든 데이터셋의 이름을 가져옵니다.
 * @param {string} projectId - 조회할 프로젝트의 ID
 * @returns {Promise<string[]>} 데이터셋 이름 배열
 */
export const fetchAllDatasetNames = async (projectId) => {
  if (!projectId) {
    console.warn("fetchAllDatasetNames를 호출하려면 projectId가 필요합니다.");
    return [];
  }
  try {
    // 서버 오류 메시지에 따라 필수 파라미터(searchQuery)를 추가하고, limit 값을 100으로 수정합니다.
    const encodedInput = encodeURIComponent(JSON.stringify({
      json: {
        projectId,
        limit: 100,      // 최대값 100으로 수정
        searchQuery: "", // 빈 문자열이라도 필수이므로 추가
      }
    }));

    // API 경로(path)를 'datasets.allDatasets'으로 수정합니다.
    const response = await fetch(`/api/trpc/datasets.allDatasets?input=${encodedInput}`, {
      credentials: "include",
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Datasets API Response Error Body:", errorBody);
        throw new Error(`Datasets API 호출에 실패했습니다 (상태 코드: ${response.status})`);
    }

    const jsonResponse = await response.json();

    
    // --- ▼▼▼ [디버깅 추가] 서버로부터 받은 원본 데이터 확인 ▼▼▼ ---
    console.log("[디버깅] API 원본 응답:", JSON.stringify(jsonResponse, null, 2));
    // --- ▲▲▲ [디버깅 추가] 완료 ▲▲▲ ---





    const result = unwrapTrpcJson(jsonResponse);
    
    const datasets = result?.datasets || result || [];
    if (!Array.isArray(datasets)) {
        console.error("API로부터 받은 데이터가 배열 형태가 아닙니다:", datasets);
        return [];
    }

    return datasets.map(d => d.name);
  } catch (error) {
    console.error("Failed to fetch all dataset names:", error);
    return [];
  }
};
// --- ▲▲▲ [수정] 완료 ▲▲▲ ---