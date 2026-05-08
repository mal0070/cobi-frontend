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
  meta: {
    functionName: "processOrder",
    branches: 4,
    complexity: "Low",
    summary: "주문 처리 로직 - 4개의 분기와 3가지 종료 상태",
    language: "javascript",
  },
  flowchart: {
    type: "flowchart",
    caption: "주문 처리 흐름도",
    code: `flowchart TD
    Start([Start]) --> CheckUser{userId 있음?}
    CheckUser -- No --> ErrorUser[로그인 필요]
    CheckUser -- Yes --> CheckAmount{amount > 0?}
    CheckAmount -- No --> ErrorAmount[잘못된 금액]
    CheckAmount -- Yes --> CheckLarge{amount > 1M?}
    CheckLarge -- Yes --> Pending[승인 대기]
    CheckLarge -- No --> Success[주문 완료]

    classDef errorNode fill:#fee,stroke:#f87171,color:#991b1b
    classDef successNode fill:#ecfdf5,stroke:#34d399,color:#065f46
    classDef pendingNode fill:#fef3c7,stroke:#fbbf24,color:#92400e

    class ErrorUser,ErrorAmount errorNode
    class Success successNode
    class Pending pendingNode`,
  },
  stateDiagram: {
    type: "stateDiagram",
    caption: "주문 상태 전이",
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Validating : submit
    Validating --> Pending : amount > 1M
    Validating --> Success : valid
    Validating --> Error : invalid input
    Success --> [*]
    Error --> Idle : retry
    Pending --> Success : approved
    Pending --> Error : rejected`,
  },
  pmView: {
    title: "비즈니스 로직 요약",
    scenarios: [
      {
        condition: "로그인하지 않은 사용자",
        result: "주문 차단",
        impact: "High",
        userMessage: "로그인이 필요합니다",
      },
      {
        condition: "금액이 0원 이하",
        result: "주문 차단",
        impact: "Medium",
        userMessage: "올바른 금액을 입력해주세요",
      },
      {
        condition: "100만원 초과 주문",
        result: "관리자 승인 대기",
        impact: "High",
        userMessage: "관리자 승인을 기다리고 있어요",
      },
      {
        condition: "정상 주문",
        result: "즉시 처리",
        impact: "Low",
        userMessage: "주문이 완료되었습니다",
      },
    ],
    metrics: {
      totalScenarios: 4,
      blockingCases: 2,
      successRate: "50%",
    },
  },
  designerView: {
    title: "사용자 화면 흐름",
    screens: [
      {
        state: "검증 중",
        condition: "주문 제출 직후",
        ui: "로딩 인디케이터",
        message: "주문을 처리하고 있어요",
      },
      {
        state: "에러 - 로그인",
        condition: "userId 없음",
        ui: "로그인 모달",
        message: "로그인 후 다시 시도해주세요",
      },
      {
        state: "에러 - 금액",
        condition: "amount ≤ 0",
        ui: "인풋 에러 메시지",
        message: "올바른 금액을 입력해주세요",
      },
      {
        state: "승인 대기",
        condition: "amount > 1,000,000",
        ui: "진행률 화면",
        message: "관리자 승인을 기다리고 있어요",
      },
      {
        state: "성공",
        condition: "검증 완료",
        ui: "주문 확인 페이지",
        message: "주문이 완료되었습니다",
      },
    ],
  },
  qaView: {
    title: "테스트 시나리오",
    testCases: [
      {
        id: "TC-001",
        title: "비로그인 주문 차단",
        priority: "Critical",
        steps: ["로그아웃 상태로 접속", "주문 제출", "결과 확인"],
        expected: "error / Login required",
        type: "Negative",
      },
      {
        id: "TC-002",
        title: "0원 주문 차단",
        priority: "High",
        steps: ["로그인", "금액 0으로 주문", "결과 확인"],
        expected: "error / Invalid amount",
        type: "Edge",
      },
      {
        id: "TC-003",
        title: "음수 금액 차단",
        priority: "High",
        steps: ["로그인", "금액 -1000으로 주문", "결과 확인"],
        expected: "error / Invalid amount",
        type: "Edge",
      },
      {
        id: "TC-004",
        title: "거액 승인 절차",
        priority: "Critical",
        steps: ["로그인", "금액 1,000,001원으로 주문", "결과 확인"],
        expected: "pending / Approval required",
        type: "Boundary",
      },
      {
        id: "TC-005",
        title: "정상 주문 처리",
        priority: "High",
        steps: ["로그인", "금액 50,000원으로 주문", "결과 확인"],
        expected: "success / Order processed",
        type: "Positive",
      },
    ],
    coverage: {
      branches: "100%",
      cases: 5,
      categories: ["Positive", "Negative", "Edge", "Boundary"],
    },
  },
};

/** 백엔드 연결 전 임시로 사용하는 분석 함수 */
export async function analyzeMock(): Promise<AnalyzeResponse> {
  // 실제 백엔드 응답을 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1800));
  return MOCK_RESPONSE;
}