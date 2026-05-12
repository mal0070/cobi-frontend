/**
 * 백엔드 응답 구조 기반 Mock 데이터
 *
 * 사용:
 * - 백엔드가 다운됐을 때 임시로 화면 확인
 * - 새 컴포넌트 작업 시 안정적인 데이터로 빠른 iteration
 * - Storybook / 테스트 fixture
 */

import type { AnalyzeResponse } from "@/types/api";

export const SAMPLE_CODE = `function processOrder(order) {
  if (!order.userId) {
    return { status: 'error', message: 'Login required' };
  }

  if (order.amount <= 0) {
    return { status: 'error', message: 'Invalid amount' };
  }

  if (order.amount > 1000000) {
    return { status: 'pending', message: 'Approval required' };
  }

  return { status: 'success', message: 'Order processed' };
}`;

export const MOCK_RESPONSE: AnalyzeResponse = {
  detected_language: "javascript",
  logic_ir: {
    language: "javascript",
    summary:
      "주문 처리 함수로, 사용자 인증 여부 → 금액 유효성 → 금액 한도를 순차적으로 검증하여 오류·보류·성공 상태를 반환한다.",
    inputs: ["order.userId", "order.amount"],
    states: [],
    derived_values: [
      {
        name: "status",
        expression: "'error' | 'pending' | 'success'",
        meaning: "주문 처리 결과 상태",
      },
      {
        name: "message",
        expression: "'Login required' | 'Invalid amount' | 'Approval required' | 'Order processed'",
        meaning: "상태에 대한 설명 메시지",
      },
    ],
    branches: [
      {
        condition: "!order.userId",
        result: "{ status: 'error', message: 'Login required' }",
        plain_meaning: "userId가 없으면 로그인 필요 오류 반환",
      },
      {
        condition: "order.amount <= 0",
        result: "{ status: 'error', message: 'Invalid amount' }",
        plain_meaning: "금액이 0 이하이면 유효하지 않은 금액 오류 반환",
      },
      {
        condition: "order.amount > 1000000",
        result: "{ status: 'pending', message: 'Approval required' }",
        plain_meaning: "금액이 100만 초과이면 승인 대기 상태 반환",
      },
      {
        condition: "그 외",
        result: "{ status: 'success', message: 'Order processed' }",
        plain_meaning: "모든 조건 통과 시 주문 처리 성공 반환",
      },
    ],
    edge_cases: [
      "order.userId가 falsy(null, undefined, 0, '')인 모든 경우",
      "order.amount가 정확히 0인 경우",
      "order.amount가 정확히 1000000인 경우 (한도 미초과로 success 처리됨)",
    ],
    uncertainties: [],
  },
  visualizations: {
    flowchart: {
      title: "주문 처리 분기 흐름도",
      type: "flowchart",
      mermaid: `flowchart TD
START([START])
C0{"!order.userId"}
R0["status: 'error'\\nLogin required"]
C1{"order.amount <= 0"}
R1["status: 'error'\\nInvalid amount"]
C2{"order.amount > 1000000"}
R2["status: 'pending'\\nApproval required"]
R3["status: 'success'\\nOrder processed"]
END([END])
START --> C0
C0 -->|True| R0
C0 -->|False| C1
C1 -->|True| R1
C1 -->|False| C2
C2 -->|True| R2
C2 -->|False| R3
R0 --> END
R1 --> END
R2 --> END
R3 --> END`,
    },
    state_diagram: {
      title: "주문 상태 전이도",
      type: "stateDiagram",
      mermaid: `stateDiagram-v2
[*] --> Error : userId 없음
[*] --> Error : amount ≤ 0
[*] --> Pending : amount > 1000000
[*] --> Success : 정상 주문
Error --> [*]
Pending --> [*]
Success --> [*]`,
    },
  },
  role_views: {
    pm: {
      primary_visualization: "flowchart",
      title: "주문 처리 정책",
      summary: "주문 시 로그인 여부·금액 유효성·100만 원 한도를 순서대로 검증하여 오류, 승인 대기, 성공 중 하나를 반환하는 로직.",
      key_points: [
        "비로그인 사용자는 주문을 처리할 수 없음.",
        "주문 금액은 반드시 0보다 커야 함.",
        "100만 원 초과 주문은 자동 승인 대기 상태로 전환됨.",
        "세 조건을 모두 통과해야 최종 성공 처리됨.",
      ],
      questions_to_confirm: [
        "100만 원 한도는 비즈니스 정책으로 확정된 값인가?",
        "승인 대기(pending) 상태의 주문은 누가 어떤 프로세스로 처리하는가?",
        "로그인 여부 외에 추가 인증(권한, 계정 상태 등)이 필요한가?",
      ],
    },
    designer: {
      primary_visualization: "flowchart",
      title: "주문 처리 결과 UI",
      summary: "주문 결과는 error·pending·success 세 가지 상태로 나뉘며, 각각 다른 메시지와 UI 처리가 필요하다.",
      key_points: [
        "오류(error) 상태: 인라인 에러 메시지 또는 토스트로 사용자에게 안내.",
        "승인 대기(pending) 상태: 별도 대기 화면 또는 진행 표시기 필요.",
        "성공(success) 상태: 주문 완료 확인 화면으로 이동.",
        "각 상태에 대응하는 CTA(버튼/링크)가 명확히 구분되어야 함.",
      ],
      questions_to_confirm: [
        "pending 상태일 때 사용자에게 예상 처리 시간을 안내해야 하는가?",
        "error 메시지를 그대로 노출할지, 번역·가공할지 정해졌는가?",
        "성공 후 이동할 화면(주문 내역 등)이 설계되어 있는가?",
      ],
    },
    qa: {
      primary_visualization: "flowchart",
      title: "주문 처리 로직 테스트",
      summary: "userId 유무, amount 경계값(0, 1000000), 초과값에 대한 분기를 각각 검증해야 하는 로직.",
      key_points: [
        "userId falsy 케이스: null, undefined, 빈 문자열, 0 등 모두 테스트.",
        "amount 경계값: 0(error), 1(success), 1000000(success), 1000001(pending) 확인.",
        "정상 케이스: userId 존재 + 0 < amount ≤ 1000000 → success.",
        "반환 객체의 status·message 필드 값이 정확한지 검증.",
      ],
      questions_to_confirm: [
        "order.amount에 음수, 소수, 문자열이 들어오는 케이스도 처리해야 하는가?",
        "order 객체 자체가 null/undefined인 경우 방어 처리가 있는가?",
        "pending 상태로 넘어간 주문의 후속 처리 시나리오도 테스트 범위에 포함되는가?",
      ],
    },
    cs: {
      primary_visualization: "flowchart",
      title: "주문 처리 안내",
      summary: "주문은 로그인 상태, 금액 유효성, 금액 한도에 따라 처리 결과가 달라집니다.",
      key_points: [
        "로그인하지 않은 상태에서는 주문이 접수되지 않습니다.",
        "주문 금액은 0원보다 커야 합니다.",
        "100만 원을 초과하는 주문은 내부 승인 후 처리됩니다.",
        "정상 조건을 충족하면 즉시 주문이 완료됩니다.",
      ],
      questions_to_confirm: [
        "고객님, 현재 로그인된 상태로 주문을 시도하셨나요?",
        "입력하신 주문 금액이 올바른지 확인해 주시겠어요?",
        "100만 원 초과 주문의 경우 승인 처리 기간이 얼마나 걸리는지 안내가 필요하신가요?",
      ],
    },
  },
  warnings: [],
  confidence: 0.95,
};

/** 백엔드 호출을 모방. 1.5초 후 mock 응답 반환 */
export async function analyzeMock(): Promise<AnalyzeResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return MOCK_RESPONSE;
}