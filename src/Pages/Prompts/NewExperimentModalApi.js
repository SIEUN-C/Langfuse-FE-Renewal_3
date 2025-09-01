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








//dataset 리스트 목록 api 추가 전 코드
// // src/Pages/Prompts/NewExperimentModalApi.js

// import { langfuse } from '../../lib/langfuse';

// // --- ▼▼▼ 수정된 부분 시작 ▼▼▼ ---

// // tRPC API 응답은 한 단계 감싸여 있을 수 있어, 실제 데이터 부분을 추출하는 헬퍼 함수입니다.
// // Playground 등 다른 곳에서도 사용하는 방식과 일관성을 맞춥니다.
// function unwrapTrpcJson(json) {
//   return json?.result?.data?.json ?? json?.result?.data ?? json;
// }

// // --- ▲▲▲ 수정된 부분 끝 ▲▲▲ ---


// /**
//  * 프로젝트에 있는 모든 프롬프트의 이름을 가져옵니다.
//  * @returns {Promise<string[]>} 프롬프트 이름 배열
//  */
// export const fetchAllPromptNames = async () => {
//   try {
//     // promptsList를 필터 없이 호출하여 모든 프롬프트를 가져옵니다.
//     const response = await langfuse.api.promptsList({});
//     const prompts = response.data || [];
//     // 중복을 제거하고 이름만 추출하여 반환합니다.
//     const promptNames = [...new Set(prompts.map(p => p.name))];
//     return promptNames;
//   } catch (error)
// {
//     console.error("Failed to fetch all prompt names:", error);
//     return [];
//   }
// };

// /**
//  * 특정 프롬프트의 모든 버전 번호 목록을 가져옵니다.
//  * @param {string} promptName - 조회할 프롬프트의 이름
//  * @returns {Promise<number[]>} 버전 번호 배열
//  */
// export const fetchVersionsForPrompt = async (promptName) => {
//   if (!promptName) return [];
//   try {
//     // promptsList를 이름으로 필터링하여 해당 프롬프트 정보를 가져옵니다.
//     const response = await langfuse.api.promptsList({ name: promptName });
//     const promptInfo = response.data?.[0];
//     return promptInfo?.versions || [];
//   } catch (error) {
//     console.error(`Failed to fetch versions for prompt "${promptName}":`, error);
//     return [];
//   }
// };


// /**
//  * [수정] 프로젝트에 설정된 모든 LLM API Keys(Connections)를 가져옵니다.
//  * @param {string} projectId - 조회할 프로젝트의 ID
//  * @returns {Promise<Object[]>} LLM Connection 객체 배열
//  */
// export const fetchLlmConnections = async (projectId) => {
//   // --- ▼▼▼ 수정된 부분 시작 ▼▼▼ ---

//   // projectId가 없으면 API를 호출하지 않고 빈 배열을 반환합니다.
//   if (!projectId) {
//     console.warn("fetchLlmConnections를 호출하려면 projectId가 필요합니다.");
//     return [];
//   }

//   try {
//     // Playground에서 LLM Connection을 가져오는 방식과 동일하게 tRPC 엔드포인트를 직접 호출합니다.
//     const encodedInput = encodeURIComponent(JSON.stringify({ json: { projectId } }));
//     const response = await fetch(`/api/trpc/llmApiKey.all?input=${encodedInput}`, {
//       // vite.config.js의 프록시 설정을 통해 http://localhost:3000/api/trpc/llmApiKey.all로 요청이 전달됩니다.
//       // Langfuse 백엔드와 인증을 위해 쿠키를 포함시킵니다.
//       credentials: "include",
//     });

//     if (!response.ok) {
//       throw new Error(`LLM Connections API 호출에 실패했습니다 (상태 코드: ${response.status})`);
//     }

//     const jsonResponse = await response.json();
//     // tRPC 응답에서 실제 데이터가 있는 경로를 찾아 추출합니다.
//     const connections = unwrapTrpcJson(jsonResponse);

//     // API 응답 구조에 따라 실제 connection 목록은 data 필드에 있습니다.
//     return connections?.data || [];
//   } catch (error) {
//     console.error("LLM connections (API Keys)를 가져오는 데 실패했습니다:", error);
//     return []; // 에러 발생 시 빈 배열을 반환하여 UI 오류를 방지합니다.
//   }
//   // --- ▲▲▲ 수정된 부분 끝 ▲▲▲ ---
// };