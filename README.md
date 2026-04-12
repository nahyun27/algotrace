# AlgoTrace

> Interactive algorithm visualizer
> 복잡한 알고리즘을 한 단계씩 눈으로 이해하는 인터랙티브 시각화 플랫폼


[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue?style=for-the-badge&logo=vercel)](https://algotrace-eosin.vercel.app/)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)


![AlgoTrace Home](public/screenshots/home.png)

---

## 소개

알고리즘의 실행 흐름을 단계별로 시각화하는 인터랙티브 학습 사이트입니다.

그래프 탐색, DP 테이블 갱신, 소스 코드 하이라이팅이 스텝마다 동기화되어
알고리즘의 흐름을 직관적으로 이해할 수 있습니다.
커스텀 그래프 에디터로 직접 그래프를 그려 실행할 수도 있습니다.

---

## 데모

![Kruskal MST Demo](public/screenshots/demo.gif)

---


## 주요 기능

### 단계별 시각화
- **이전 / 다음 / 자동재생** 으로 알고리즘 실행 흐름을 한 스텝씩 제어
- 각 스텝마다 **그래프, 테이블, 코드** 가 동기화되어 업데이트
- 현재 스텝에서 무슨 일이 일어나는지 **한 줄 설명** 제공

### 방향 그래프 렌더링
- 방문 여부, 현재 위치, 이동 대상을 **색상으로 구분**
- 간선 가중치, 방향 화살표 표시

### 커스텀 그래프 에디터
- 커스텀 그래프 에디터로 **직접 노드/간선 추가** 후 시각화 실행

### 알고리즘별 특화 시각화
- **TSP** — `dp[mask][city]` 2D 테이블, Top-down / Bottom-up 토글 비교
- **다익스트라** — 거리 배열 + 우선순위 큐 상태 실시간 표시
- **A\*** — g(x), h(x), f(x) 스코어 테이블, 휴리스틱 방향 점선
- **벨만-포드** — 라운드별 갱신 횟수 바 차트, 음수 사이클 감지
- **플로이드-워셜** — N×N 행렬 전체 갱신, 경유 노드 k 강조
- **BFS / DFS** — 큐/스택 실시간 시각화, 방문 순서 비교
- **위상정렬** — 칸의 알고리즘(진입차수) + DFS 방식 비교
- **크루스칼 / 프림** — Union-Find 트리/배열 뷰, 정렬된 간선 목록

### 소스 코드 뷰어
- 현재 실행 중인 **코드 라인 하이라이팅**
- 코드 전체 복사 버튼
- 알고리즘 변형(Top-down / Bottom-up) 전환 시 코드도 함께 전환

### 학습 지원
- 알고리즘별 **"~란?" 모달** — 문제 정의, 핵심 아이디어, 복잡도
- **관련 백준 문제** — 난이도, N 범위, 복잡도 정보 포함
- 카테고리 / 패러다임별 **검색 및 필터**

### UX
- **다크모드** 지원
- **반응형** — 모바일에서도 동작
- 좁은 화면에서 **햄버거 메뉴 + 코드 드로어** 로 전환

---


## 구현된 알고리즘

| 알고리즘 | 카테고리 | 패러다임 | 시간복잡도 | 난이도 |
|---|---|---|---|---|
| BFS / DFS | 그래프 탐색 | Traversal | O(V+E) | Easy |
| 다익스트라 | 최단경로 | Greedy | O((V+E) log V) | Medium |
| 벨만-포드 | 최단경로 | DP | O(VE) | Medium |
| 플로이드-워셜 | 최단경로 | DP | O(V³) | Medium |
| A* | 최단경로 | Greedy | O(E log V) | Medium |
| 위상정렬 | 그래프 탐색 | Traversal | O(V+E) | Medium |
| 크루스칼 / 프림 | MST | Greedy | O(E log E) | Medium |
| TSP (외판원 순회) | 최적화 | DP | O(N² × 2^N) | Hard |

---

## 시작하기

**요구사항: Node.js 20.19+ 또는 22.12+**

```bash
git clone https://github.com/nahyun27/algotrace.git
cd algotrace
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 열기

---

## 기술 스택

| 역할 | 기술 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 빌드 | Vite |
| 스타일링 | Tailwind CSS |
| 애니메이션 | Framer Motion |
| 라우팅 | React Router |
| 배포 | Vercel |


## 기여

새로운 알고리즘을 기여하고 싶다면:

1. `src/algorithms/<name>/` 폴더 생성
2. `solver.ts` — Step 배열 반환하는 함수 구현
3. `types.ts` — Step 타입 정의
4. `src/pages/AlgorithmPage/` 에 라우트 추가
5. 홈 카드 목록에 등록
