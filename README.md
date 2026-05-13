# CoBi Frontend

> **Code → Visual → Team**
> 개발자가 작성한 코드를 PM·디자이너·QA·CS 등 비개발 직군이 빠르게 이해할 수 있도록, 조건 분기와 로직을 **인터랙티브 시각화**로 변환하는 AI 협업 어시스턴트의 프론트엔드입니다.

백엔드가 생성한 **Logic IR**, **Mermaid 다이어그램**, **직군별 View**를 받아 사용자가 이해하기 쉬운 분석 화면으로 조립합니다.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (Radix 기반)
- **Diagram**: Mermaid.js 11
- **Icons**: lucide-react
- **Animation**: tw-animate-css

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Environment Variables

루트에 `.env.local` 파일을 생성합니다.

```env
NEXT_PUBLIC_API_BASE_URL=https://cobi-backend-k8ff.onrender.com
```

로컬 백엔드를 띄워 개발할 경우:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Run Dev Server

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

### 4. Build & Start

```bash
npm run build
npm run start
```

---

## Backend Connection

- **Production API**: `https://cobi-backend-k8ff.onrender.com`
- **Endpoint**: `POST /api/analyze`
- **CORS**: 백엔드에 허용 설정 포함

백엔드 스펙은 [CoBi Backend README](https://github.com/suubinahn/CoBi-backend/blob/main/README.md)를 참고하세요.

---

## Project Structure

```text
cobi-frontend/
├─ app/                     # Next.js App Router
│  ├─ page.tsx              # 메인 페이지 (코드 입력 + 분석 트리거)
│  ├─ result/               # 분석 결과 페이지
│  ├─ layout.tsx
│  └─ globals.css
│
├─ components/
│  ├─ CodeInputPanel.tsx    # 코드 입력 + 언어 선택 + 자동 감지
│  ├─ Mermaidrenderer.tsx   # Mermaid → SVG 렌더러 (다크 테마)
│  ├─ common/
│  │  ├─ Header.tsx
│  │  └─ Footer.tsx
│  ├─ views/
│  │  ├─ IdleView.tsx       # 초기 화면 (Hero / Actions)
│  │  ├─ LoadingView.tsx    # 로딩 화면
│  │  ├─ ResultView.tsx     # 결과 화면 (탭바 + 다이어그램 + 직군별 View)
│  │  └─ RoleView.tsx       # 직군별 설명 패널
│  └─ ui/                   # shadcn/ui 컴포넌트
│
├─ lib/
│  ├─ api.ts                # 백엔드 호출 (analyze, AnalyzeError)
│  ├─ detectLanguage.ts     # 키워드 휴리스틱 기반 언어 감지
│  ├─ validateCode.ts       # 괄호 매칭 / Python 들여쓰기 검증
│  ├─ latestResult.ts       # 최근 분석 결과 영속화
│  └─ utils.ts              # cn() 등 공용 유틸
│
├─ types/
│  └─ api.ts                # 백엔드 스키마 1:1 매핑 타입
│
├─ components.json          # shadcn/ui 설정
└─ package.json
```

---

## Data Flow

```text
[ User ]
   │
   │  ① 코드 입력 + 직군 선택
   ▼
[ app/page.tsx ]
   │
   │  ② detectLanguage(code)      ← lib/detectLanguage.ts
   │  ③ validateCode(code, lang)  ← lib/validateCode.ts
   │  ④ sessionStorage 캐시 조회
   │
   ▼
[ lib/api.ts → POST /api/analyze ]
   │
   │  ⑤ AnalyzeResponse
   │     ├─ logic_ir
   │     ├─ visualizations { flowchart, state_diagram } (Mermaid 문자열)
   │     ├─ role_views { pm, designer, qa, cs }
   │     ├─ warnings
   │     └─ confidence
   │
   ▼
[ /result → components/views/ResultView.tsx ]
   │
   ├─ Flowchart Tab    → MermaidRenderer
   ├─ State Tab        → MermaidRenderer
   └─ Role Tabs (PM / Designer / QA / CS) → RoleView
```

---

## Key Features

### 코드 입력 & 언어 감지

- 10개 언어 지원: JavaScript / TypeScript / Python / Java / Go / Rust / C# / Ruby / Kotlin / PHP
- **Auto Detect** 모드: 키워드 패턴 가중치 기반 자동 감지 (`lib/detectLanguage.ts`)
- 사용자가 수동으로 언어를 override 가능
- 분석 전 괄호 매칭 / Python 들여쓰기 검증 (`lib/validateCode.ts`)

### 직군별 View

`PM` · `Designer` · `QA` · `CS` 중 원하는 직군을 선택할 수 있으며, 각 직군에 맞춤화된 설명과 핵심 포인트, 확인이 필요한 질문이 제공됩니다.

### Mermaid 다이어그램 렌더링

- **Flowchart**: 조건 분기 흐름 시각화
- **State Diagram**: 상태 전이 시각화
- 다크 테마 + JetBrains Mono 폰트 + 커스텀 컬러 변수 적용
- 렌더링 실패 시 fallback UI 제공

### 분석 캐싱

- `sessionStorage` 기반 캐시 (`cobi_analysis_*` 키)
- 동일 코드 + 동일 언어 요청 시 LLM 호출 없이 즉시 표시
- 동일 코드에 직군만 추가될 경우, 누락된 직군에 대해서만 부분 호출 (비용 절감)

### 신뢰도 & 경고

- `confidence` 값에 따라 3단계 시각화 (≥0.85 / ≥0.65 / 그 외)
- 백엔드가 반환한 `warnings` 목록을 접이식 패널로 표시

---

## Backend Schema 동기화

`types/api.ts`는 백엔드(`app/schemas/*.py`)의 Pydantic 스키마와 **1:1로 매칭**됩니다.
백엔드 스키마가 변경되면 반드시 함께 업데이트해야 합니다.

핵심 타입:

```ts
export interface AnalyzeResponse {
  detected_language: string;
  logic_ir: LogicIR;
  visualizations: Visualizations; // { flowchart, state_diagram }
  role_views: Partial<Record<RoleId, RoleView>>;
  warnings: string[];
  confidence: number; // 0.0 ~ 1.0
}

export type RoleId = 'pm' | 'designer' | 'qa' | 'cs';
```

---

## Scripts

| Command         | Description      |
| --------------- | ---------------- |
| `npm run dev`   | 개발 서버 실행   |
| `npm run build` | 프로덕션 빌드    |
| `npm run start` | 빌드 결과물 실행 |
| `npm run lint`  | ESLint 검사      |

---

## Deployment

- **Hosting**: Vercel
- **Backend**: Render (`cobi-backend-k8ff.onrender.com`)
- 첫 요청 시 백엔드 cold start로 지연이 발생할 수 있습니다 (Render free tier 특성).

---

## Notes

- Mermaid는 클라이언트 전용이므로 `MermaidRenderer`는 반드시 `"use client"`로 동작합니다.
- `dangerouslySetInnerHTML`은 Mermaid가 생성한 신뢰 가능한 SVG에만 사용됩니다.
- 디자인 톤: 다크 테마 (zinc 계열), 직군별 액센트 컬러 (PM=blue, Designer=pink, QA=emerald, CS=orange).

---
