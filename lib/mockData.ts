/**
 * 백엔드 응답 구조 기반 Mock 데이터
 *
 * 사용:
 * - 백엔드가 다운됐을 때 임시로 화면 확인
 * - 새 컴포넌트 작업 시 안정적인 데이터로 빠른 iteration
 * - Storybook / 테스트 fixture
 */

import type { AnalyzeResponse } from "@/types/api";

export const SAMPLE_CODE = `def apply_discount(user, cart):
    if user.isPremium and cart.total > 50000:
        return 0.2
    return 0`;

export const MOCK_RESPONSE: AnalyzeResponse = {
  detected_language: "python",
  logic_ir: {
    language: "python",
    summary:
      "사용자가 프리미엄 회원이고 장바구니 총액이 50000을 초과할 경우 20%의 할인을 적용하고, 그렇지 않으면 할인을 적용하지 않는 로직이다.",
    inputs: ["cart.total", "user.isPremium"],
    states: [],
    derived_values: [
      {
        name: "discount",
        expression: "0.2 if user.isPremium and cart.total > 50000 else 0",
        meaning: "적용할 할인율",
      },
      {
        name: "is_discount_applicable",
        expression: "user.isPremium and cart.total > 50000",
        meaning: "할인이 적용 가능한지 여부",
      },
    ],
    branches: [
      {
        condition: "user.isPremium and cart.total > 50000",
        result: "discount = 0.2",
        plain_meaning: "사용자가 프리미엄 회원이고 장바구니 총액이 50000을 초과하면 20% 할인 적용",
      },
      {
        condition: "not (user.isPremium and cart.total > 50000)",
        result: "discount = 0",
        plain_meaning: "그렇지 않으면 할인 적용 안 함",
      },
    ],
    edge_cases: ["user.isPremium이 False일 때", "cart.total이 50000 이하일 때"],
    uncertainties: [],
  },
  visualizations: {
    flowchart: {
      title: "조건 분기 흐름도",
      type: "flowchart",
      mermaid: `flowchart TD
START([START])
C0{user.isPremium and cart.total > 50000}
R0[discount = 0.2]
START --> C0
C0 -->|True| R0
C1{not (user.isPremium and cart.total > 50000)}
R1[discount = 0]
R0 --> C1
C1 -->|True| R1
END([END])
R1 --> END`,
    },
    state_diagram: {
      title: "UI 상태 전이도",
      type: "stateDiagram",
      mermaid: `stateDiagram-v2
[*] --> Idle`,
    },
  },
  role_views: {
    pm: {
      primary_visualization: "flowchart",
      title: "프리미엄 회원 할인 정책",
      summary: "프리미엄 회원이 장바구니 총액 50000원을 초과할 경우 20% 할인이 적용되는 로직.",
      key_points: [
        "사용자가 프리미엄 회원인 경우에만 할인 적용 가능.",
        "장바구니 총액이 50000원을 초과해야 20% 할인 적용.",
        "프리미엄 회원이 아니거나 장바구니 총액이 50000원 이하일 경우 할인 없음.",
        "할인율은 20%로 고정되어 있으며, 조건이 충족되지 않으면 0%로 설정.",
      ],
      questions_to_confirm: [
        "현재 사용자가 프리미엄 회원인지 확인했는가?",
        "장바구니 총액이 50000원을 초과하는지 확인했는가?",
        "할인 적용 여부를 결정하기 위한 조건을 정확히 이해하고 있는가?",
      ],
    },
    designer: {
      primary_visualization: "flowchart",
      title: "프리미엄 회원 할인 적용 로직",
      summary: "프리미엄 회원이면서 장바구니 총액이 50000을 초과할 경우 20% 할인이 적용된다.",
      key_points: [
        "사용자가 프리미엄 회원인지 여부 확인",
        "장바구니 총액이 50000을 초과하는지 확인",
        "할인 적용 여부에 따라 UI에서 할인 금액 표시",
        "할인이 적용되지 않을 경우 할인 금액이 0으로 표시",
      ],
      questions_to_confirm: [
        "사용자가 프리미엄 회원인지 어떻게 확인할 수 있는가?",
        "장바구니 총액이 50000을 초과하는 경우 UI에서 어떻게 표시되는가?",
        "할인 적용 여부에 따라 사용자에게 어떤 메시지를 보여줄 것인가?",
      ],
    },
    qa: {
      primary_visualization: "flowchart",
      title: "프리미엄 회원 할인 적용 로직",
      summary:
        "프리미엄 회원이면서 장바구니 총액이 50000을 초과할 경우에만 20% 할인이 적용되는 로직입니다.",
      key_points: [
        "프리미엄 회원 여부(user.isPremium) 확인",
        "장바구니 총액(cart.total) 확인",
        "할인율(discount) 계산 로직",
        "경계값 및 예외 케이스 처리",
      ],
      questions_to_confirm: [
        "사용자가 프리미엄 회원인지 확인했는가?",
        "장바구니 총액이 50000을 초과하는지 확인했는가?",
        "user.isPremium이 False일 때의 할인 적용 로직은 어떻게 되는가?",
        "cart.total이 50000 이하일 때의 할인 적용 로직은 어떻게 되는가?",
      ],
    },
    cs: {
      primary_visualization: "flowchart",
      title: "프리미엄 회원 할인 적용 로직",
      summary: "프리미엄 회원이 장바구니 총액이 50000원을 초과할 경우 20% 할인이 적용됩니다.",
      key_points: [
        "프리미엄 회원만 할인 혜택을 받을 수 있습니다.",
        "장바구니의 총 금액이 50000원을 초과해야 할인이 적용됩니다.",
        "조건을 만족하지 않으면 할인 혜택이 없습니다.",
      ],
      questions_to_confirm: [
        "고객님이 프리미엄 회원이신가요?",
        "장바구니에 담긴 상품의 총 금액이 50000원을 초과하나요?",
        "할인 혜택에 대해 더 궁금한 점이 있으신가요?",
      ],
    },
  },
  warnings: ["상태 정보가 없어 기본 다이어그램으로 대체되었습니다."],
  confidence: 0.9,
};

/** 백엔드 호출을 모방. 1.5초 후 mock 응답 반환 */
export async function analyzeMock(): Promise<AnalyzeResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return MOCK_RESPONSE;
}