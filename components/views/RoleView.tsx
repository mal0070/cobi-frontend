import type { LogicIR, RoleId, RoleView as RoleViewType } from '@/types/api';
import { CsView } from './role/CsView';
import { DesignerView } from './role/DesignerView';
import { PmView } from './role/PmView';
import { QaView } from './role/QaView';

interface Props {
  data: RoleViewType;
  role: RoleId;
  /** 직군별 View가 logic_ir의 branches/edge_cases/uncertainties 등을 활용 */
  logicIR: LogicIR;
  /** sessionStorage 키 식별용 */
  storageKey?: string;
}

/**
 * 직군별 View 라우터
 *
 * 각 직군은 협업 상황이 다르므로 전용 컴포넌트로 분기:
 * - PM: 정책 매트릭스 테이블 + 검증
 * - Designer: 상태 카드 갤러리
 * - QA: 인터랙티브 체크리스트 (Pass/Fail/Skip)
 * - CS: 응대 스크립트 아코디언
 *
 * `key={storageKey}` 패턴: storageKey가 바뀌면 컴포넌트를 리마운트시켜
 * lazy initializer가 재실행되도록 함 (effect 내 setState 회피).
 * key는 React 내부 식별자이므로 반드시 JSX에 직접 전달해야 함 (spread 금지).
 */
export function RoleView({ data, role, logicIR, storageKey }: Props) {
  // 공통 props에서 key는 제외 - key는 spread로 넘기면 안 됨
  const commonProps = {
    data,
    logicIR,
    storageKey,
  };

  switch (role) {
    case 'pm':
      return <PmView key={storageKey} {...commonProps} />;
    case 'designer':
      return <DesignerView key={storageKey} {...commonProps} />;
    case 'qa':
      return <QaView key={storageKey} {...commonProps} />;
    case 'cs':
      return <CsView key={storageKey} {...commonProps} />;
    default:
      // 미지원 role 안전장치
      return null;
  }
}
