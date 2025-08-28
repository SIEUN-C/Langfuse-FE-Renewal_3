// src/Pages/Tracing/CreateTrace.jsx
import { langfuse } from '../../lib/langfuse';

/**
 * input과 output을 받아 Langfuse에 Trace와 Generation(Observation)을 기록하는 함수입니다.
 * Langfuse 'Settings > Models'에 해당 모델의 비용 정보가 설정되어 있으면 비용이 자동으로 계산됩니다.
 *
 * @param {object} params - 기록할 데이터
 * @param {string} params.input - LLM에 제공된 입력값
 * @param {string} params.output - LLM으로부터 받은 결과값
 * @param {string} params.modelName - 사용된 모델 이름 (예: "gpt-3.5-turbo")
 * @param {string} params.traceName - 생성될 Trace의 이름 (선택 사항)
 */
export const logTrace = async ({ input, output, modelName, traceName = "logged-chat" }) => {
  try {
    // 1. 부모 Trace를 생성합니다. 전체 대화의 입출력을 모두 기록할 수 있습니다.
    const trace = langfuse.trace({
      name: traceName,
      userId: "user_from_log", // 실제 사용자 ID로 교체 필요
      input: input,
      output: output,
      metadata: { source: "manual-log" }
    });

    // 2. Trace 내부에 LLM 상호작용을 나타내는 Generation(Observation)을 생성합니다.
    //    model 매개변수에 Langfuse에 등록된 모델 이름을 전달하면 비용이 자동 계산됩니다.
    trace.generation({
      name: "chat-completion-log",
      model: modelName,
      input: [{ role: "user", content: input }], // 비용 계산을 위해 Langfuse가 사용하는 형식
      output: { role: "assistant", content: output },
    });

    // 3. 모든 데이터를 즉시 서버로 전송합니다.
    await langfuse.flush();

    alert(`Trace가 성공적으로 기록되었습니다. ID: ${trace.id}`);
    
    return trace.id;

  } catch (error) {
    console.error("Trace 기록 중 오류 발생:", error);
    alert("Trace 기록에 실패했습니다. 콘솔을 확인해주세요.");
    return null;
  }
};


// 이 함수는 Tracing 페이지의 'New Trace' 버튼을 위한 예시 호출 함수입니다.
// 실제 애플리케이션에서는 사용자의 입력과 LLM의 응답을 동적으로 받아와 logTrace를 호출하게 됩니다.
export const createTrace = async () => {
    // 예시 데이터
    const exampleInput = prompt("Trace에 기록할 Input을 입력하세요:", "What is Langfuse?");
    if (!exampleInput) return null;

    const exampleOutput = prompt("Trace에 기록할 Output을 입력하세요:", "Langfuse is an open source observability & analytics tool for LLM applications.");
    if (!exampleOutput) return null;

    // Langfuse의 'Settings > Models'에 등록된 모델 이름을 사용해야 비용이 자동 계산됩니다.
    const exampleModel = "gpt-3.5-turbo"; 

    return await logTrace({
        input: exampleInput,
        output: exampleOutput,
        modelName: exampleModel,
        traceName: "example-logged-trace"
    });
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