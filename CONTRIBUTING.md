# 기여 가이드

AlgoTrace에 알고리즘을 추가하거나 화면을 고칠 때 따르는 규칙입니다.

## 개발 환경

```bash
npm ci
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run lint
```

## 구조

```
src/
  algorithms/
    catalog.ts          알고리즘 메타데이터 타입 (AlgorithmMeta, 분류)
    registry.ts         분류 목록 + 모든 meta.ts 자동 수집
    <알고리즘>/
      meta.ts           이 알고리즘의 카탈로그 항목 (자동 등록)
      solver.ts         단계(step) 배열을 만드는 순수 함수
      types.ts          단계 타입, 기본 예제
      GraphCanvas.tsx 등 알고리즘 전용 시각화
      CodeViewer.tsx    CodePanel + 줄 하이라이트 규칙
      InfoModal.tsx     개념 모달 (InfoModal 셸 사용)
      ProblemList.tsx   백준 연습 문제
  pages/algorithms/     알고리즘별 페이지 (lazy 로딩)
  components/
    algorithm/          페이지 공통 부품 (usePlayback, AlgorithmHeader, StepBanner, RightPanel …)
    viz/                시각화 공통 부품 (palette, Legend …)
    ui/                 버튼, 세그먼트, 배지, 패널, 모달
  i18n/                 한/영 전환 (useTr, makeTr)
```

## 새 알고리즘 추가하기

1. **솔버** — `src/algorithms/<slug>/solver.ts`
   - 입력을 받아 단계 배열을 돌려주는 순수 함수로 만듭니다. 같은 입력이면 항상 같은 단계가 나와야 합니다.
   - 마지막 파라미터는 `lang: Lang = 'ko'`이고, 설명 문구는 `const tr = makeTr(lang)`의 `tr('한국어', 'English')`로 씁니다.
   - 단계마다 `type`(영문 대문자 코드), `description`, `codeLine`을 넣습니다.
2. **테스트** — `src/algorithms/<slug>/solver.test.ts`
   - 정답: 마지막 단계의 결과가 단순한 참조 구현과 같습니다.
   - 불변식: 모든 단계에 설명이 있고, 마지막 단계가 종료 타입입니다.
   - 언어 독립: `'ko'`와 `'en'`의 단계 수와 타입 순서가 같습니다.
3. **페이지** — `src/pages/algorithms/<이름>Page.tsx`
   - `usePlayback`, `AlgorithmHeader`, `StepBanner`, `StepController`, `RightPanel`을 씁니다. `DijkstraPage.tsx`가 가장 짧은 예시입니다.
   - 단계 목록은 `useMemo(() => generate(input, lang), [input, lang])`로 만듭니다. 사용자가 만든 입력은 단계가 아니라 입력 자체를 상태로 저장해야 언어를 바꿀 때 설명이 다시 만들어집니다.
4. **등록** — `src/algorithms/<slug>/meta.ts`
   ```ts
   import { Search } from 'lucide-react';
   import { defineAlgorithm } from '../catalog';

   export default defineAlgorithm({
     slug: 'binary-search', category: 'search', order: 1, icon: Search,
     name: { ko: '이분 탐색', en: 'Binary search' },
     description: { ko: '…', en: '…' },
     difficulty: 'easy', time: 'O(log n)', space: 'O(1)', keywords: ['binary', 'search'],
     load: () => import('../../pages/algorithms/BinarySearchPage'),
   });
   ```
   이 파일만 있으면 사이드바, 홈, 라우팅에 자동으로 나타납니다. `registry.ts`는 고치지 않습니다.
5. **코드 · 개념 · 연습 문제** — `CodeViewer`(CodePanel), `InfoModal`(문제 정의 · 핵심 아이디어 · 복잡도), `ProblemList`(백준 2~4개)를 만듭니다.

## 화면 규칙

- **색은 상태 토큰만** 씁니다. 같은 색은 모든 알고리즘에서 같은 뜻입니다.

  | 의미 | 톤 |
  | --- | --- |
  | 지금 처리 중 | `current` (파랑) |
  | 비교 · 검토 중 | `candidate` (주황) |
  | 확정 · 방문 완료 | `visited` (초록) |
  | 최종 답 | `path` (보라) |
  | 실패 · 충돌 · 사이클 | `danger` (빨강) |
  | 아직 손대지 않음 | `idle` |

  SVG는 `components/viz/palette.ts`의 `NODE_COLORS` · `EDGE_COLORS`를 `style`로, HTML은 `components/ui/tone.ts`의 클래스를 씁니다. hex 색과 Tailwind 기본 팔레트(`emerald-500` 등)는 쓰지 않습니다.
- **글자는 11px 이상**으로 씁니다.
- **이모지와 대시 구분자는 쓰지 않습니다.** 시각적 표시가 필요하면 lucide 아이콘을 쓰고, 문장 중간의 —, –, " - "는 문장을 나누거나 콜론, 쉼표, 괄호로 바꿉니다. 화살표(→)와 이름 안의 하이픈(Floyd-Warshall, 0-1 BFS)은 괜찮습니다.
- **모든 문구는 한/영 둘 다** 씁니다. 굵은 글씨가 섞인 문장은 문장 단위로 `lang === 'ko' ? … : …`로 나눕니다.
- 다크 모드를 코드에서 직접 확인하지 않습니다. 토큰이 테마를 따라갑니다.

## 완료 기준

- [ ] 솔버가 결정적이고, `lang`을 끝 파라미터로 받는다
- [ ] 정답 · 불변식 · 언어 독립 테스트가 있고, 기본 예제의 답이 백준 예제 출력과 같다
- [ ] `meta.ts` 하나로 사이드바 · 홈 · 라우팅에 나타난다
- [ ] 페이지가 공통 부품(`usePlayback`, `AlgorithmHeader`, `StepBanner`, `RightPanel`)을 쓴다
- [ ] 모든 단계의 `codeLine`이 코드 패널에서 알맞은 줄을 하이라이트한다
- [ ] 개념 모달의 복잡도가 `meta.ts` 표기와 같다
- [ ] 연습 문제의 티어 · 제약을 백준에서 확인했다
- [ ] 하드코딩 색이 없고, 글자가 11px 이상이다
- [ ] 한 · 영, 라이트 · 다크, 데스크톱 · 모바일 화면을 확인했고 콘솔 에러가 없다
- [ ] `npx tsc -b`, `npm run lint`, `npm test`, `npm run build`가 모두 통과한다
