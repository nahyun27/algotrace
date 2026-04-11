import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

type Paradigm    = "DP" | "Greedy" | "exploration";
type ProblemType = "Shortest Path" | "Traversal" | "Optimization" | "MST";

interface AlgoCard {
  id: string;
  name: string;
  korName: string;
  slug: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  paradigm: Paradigm;
  problemType: ProblemType;
  timeComplexity: string;
  spaceComplexity: string;
  comingSoon?: boolean;
}

const ALGORITHMS: AlgoCard[] = [
  {
    id: "tsp",
    name: "Traveling Salesperson",
    korName: "외판원 순회 (TSP)",
    slug: "tsp",
    description: "모든 도시를 한 번씩 방문하고 출발지로 돌아오는 최단 경로를 비트마스크 DP로 탐색합니다.",
    difficulty: "Hard",
    paradigm: "DP",
    problemType: "Optimization",
    timeComplexity: "O(N² · 2ᴺ)",
    spaceComplexity: "O(N · 2ᴺ)",
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    korName: "다익스트라",
    slug: "dijkstra",
    description: "음수 가중치가 없는 그래프에서 단일 시작점 최단 경로를 우선순위 큐로 구합니다.",
    difficulty: "Medium",
    paradigm: "Greedy",
    problemType: "Shortest Path",
    timeComplexity: "O((V+E) log V)",
    spaceComplexity: "O(V)",
  },
  {
    id: "astar",
    name: "A* Search",
    korName: "A* 탐색",
    slug: "astar",
    description: "휴리스틱 함수를 이용해 목표 노드까지의 최단 경로를 효율적으로 탐색합니다.",
    difficulty: "Medium",
    paradigm: "Greedy",
    problemType: "Shortest Path",
    timeComplexity: "O(E log V)",
    spaceComplexity: "O(V)",
  },
  {
    id: "bfsdfs",
    name: "BFS / DFS",
    korName: "너비/깊이 우선 탐색",
    slug: "bfsdfs",
    description: "그래프를 층별(BFS) 또는 경로별(DFS)로 탐색하는 가장 기본적인 알고리즘입니다.",
    difficulty: "Easy",
    paradigm: "exploration",
    problemType: "Traversal",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
  },
  {
    id: "bellmanford",
    name: "Bellman-Ford",
    korName: "벨만-포드",
    slug: "bellmanford",
    description: "음수 간선이 있는 그래프의 단일 출발점 최단 경로를 구하고 음수 사이클을 감지합니다.",
    difficulty: "Medium",
    paradigm: "DP",
    problemType: "Shortest Path",
    timeComplexity: "O(V·E)",
    spaceComplexity: "O(V)",
  },
  {
    id: "floydwarshall",
    name: "Floyd-Warshall",
    korName: "플로이드-워셜",
    slug: "floyd-warshall",
    description: "모든 노드 쌍의 최단거리를 3중 반복문 DP로 구합니다. 음수 간선 처리 및 음수 사이클 감지 가능.",
    difficulty: "Medium",
    paradigm: "DP",
    problemType: "Shortest Path",
    timeComplexity: "O(V³)",
    spaceComplexity: "O(V²)",
  },
  {
    id: "kruskal",
    name: "Kruskal's Algorithm",
    korName: "크루스칼 (MST)",
    slug: "kruskal",
    description: "간선을 가중치 오름차순으로 정렬 후 Union-Find로 사이클을 체크하며 최소 신장 트리(MST)를 구축합니다.",
    difficulty: "Medium",
    paradigm: "Greedy",
    problemType: "MST",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V)",
  },
  {
    id: "topological",
    name: "Topological Sort",
    korName: "위상정렬",
    slug: "topological",
    description: "DAG에서 선행 관계를 만족하는 노드 순서를 결정합니다. 칸의 알고리즘(BFS)과 DFS 방식 비교 가능.",
    difficulty: "Medium",
    paradigm: "exploration",
    problemType: "Traversal",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
  },
];

const difficultyStyles = {
  Easy:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  Medium: "bg-amber-100  text-amber-800  dark:bg-amber-900/50  dark:text-amber-300",
  Hard:   "bg-rose-100   text-rose-800   dark:bg-rose-900/50   dark:text-rose-300",
};

const paradigmTagStyles: Record<Paradigm, string> = {
  DP:     "bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300",
  Greedy: "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
  exploration:   "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

const problemTypeTagStyles: Record<ProblemType, string> = {
  "Shortest Path": "bg-blue-50   text-blue-600   dark:bg-blue-900/20   dark:text-blue-400",
  "Traversal":     "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  "Optimization":  "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  "MST":           "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
};

// ── Per-algorithm mini symbols ──────────────────────────────────────────────
function AlgoIcon({ id }: { id: string }) {
  const cls = "w-8 h-8";
  switch (id) {
    case "tsp":
      return (
        <svg viewBox="0 0 32 32" className={cls} fill="none">
          <circle cx="6"  cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="6"  r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="26" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 16h4M19 16h4M16 9v4M16 19v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 13l6-5M18 8l6 5M24 19l-6 5M10 19l6 5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity=".5"/>
        </svg>
      );
    case "dijkstra":
    case "astar":
    case "bellmanford":
    case "floydwarshall":
      return (
        <svg viewBox="0 0 32 32" className={cls} fill="none">
          <circle cx="6"  cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="6"  r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="26" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="26" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 15l5-7M19 7l4 1M24 13l0 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 17l14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
          <circle cx="22" cy="23" r="1.5" fill="currentColor" opacity=".6"/>
        </svg>
      );
    case "bfsdfs":
    case "topological":
      return (
        <svg viewBox="0 0 32 32" className={cls} fill="none">
          <circle cx="16" cy="5"  r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="8"  cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="24" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="4"  cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="28" cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 7.5l-6 5M16 7.5l6 5M8 17.5l-3 5M8 17.5l3 5M24 17.5l3 5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    case "kruskal":
      return (
        <svg viewBox="0 0 32 32" className={cls} fill="none">
          <circle cx="6"  cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="16" cy="4"  r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="26" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="10" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="22" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 13l2 8M25 13l-3 8M13 24h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 4L8 9M17 4L24 9" stroke="currentColor" strokeWidth="1.5" opacity=".4" strokeDasharray="2 2"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" className={cls} fill="none">
          <rect x="4"  y="4"  width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="18" y="4"  width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="4"  y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
  }
}

export default function Home() {
  const [query, setQuery]           = useState("");
  const [paradigm, setParadigm]     = useState<Paradigm | "">("");
  const [problemType, setProblemType] = useState<ProblemType | "">("");

  function resetFilters() {
    setParadigm("");
    setProblemType("");
  }

  const hasActiveFilters = paradigm !== "" || problemType !== "";

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ALGORITHMS.filter(a => {
      const matchQ        = a.name.toLowerCase().includes(q) || a.korName.toLowerCase().includes(q);
      const matchParadigm = paradigm === ""     || a.paradigm === paradigm;
      const matchType     = problemType === ""  || a.problemType === problemType;
      return matchQ && matchParadigm && matchType;
    });
  }, [query, paradigm, problemType]);

  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block mb-4 text-xs font-semibold tracking-widest uppercase bg-white/20 rounded-full px-3 py-1">
            Algorithm Visualizer
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">AlgoTrace</h1>
          <p className="mt-3 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
            복잡한 알고리즘을 한 단계씩 눈으로 이해하는 인터랙티브 시각화 플랫폼
          </p>
          <div className="mt-5 flex gap-3 flex-wrap text-sm font-medium text-white/70">
            <span>✦ 단계별 재생 제어</span>
            <span>✦ Top-down / Bottom-up 비교</span>
            <span>✦ 실시간 DP 테이블</span>
          </div>
        </div>
      </section>

      {/* ── Search + Filters ── */}
      <div className="flex items-center gap-3">
        {/* Search — flex:1 */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="알고리즘 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>

        {/* Paradigm select */}
        <div className="relative shrink-0 w-40">
          <select
            value={paradigm}
            onChange={e => setParadigm(e.target.value as Paradigm | "")}
            className="w-full h-11 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition cursor-pointer"
          >
            <option value="">패러다임 전체</option>
            <option value="DP">DP</option>
            <option value="Greedy">Greedy</option>
            <option value="exploration">탐색</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Problem type select */}
        <div className="relative shrink-0 w-40">
          <select
            value={problemType}
            onChange={e => setProblemType(e.target.value as ProblemType | "")}
            className="w-full h-11 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition cursor-pointer"
          >
            <option value="">문제 유형 전체</option>
            <option value="Shortest Path">Shortest Path</option>
            <option value="Traversal">Traversal</option>
            <option value="Optimization">Optimization</option>
            <option value="MST">MST</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Reset — only visible when a filter is active */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            aria-label="필터 초기화"
            className="shrink-0 h-11 w-11 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(algo => {
          const card = (
            <div
              className={`group h-full flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm p-5 transition-all duration-200 ${
                algo.comingSoon
                  ? "opacity-50 cursor-not-allowed select-none"
                  : "hover:-translate-y-1 hover:shadow-md hover:border-primary/40 cursor-pointer"
              }`}
            >
              {/* Top row: paradigm tag + problem type tag + coming soon */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${paradigmTagStyles[algo.paradigm]}`}>
                  {algo.paradigm}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${problemTypeTagStyles[algo.problemType]}`}>
                  {algo.problemType}
                </span>
                {algo.comingSoon && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-accent dark:text-muted-foreground">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex items-center gap-2.5 mb-0.5">
                <div className={`shrink-0 rounded-lg p-1.5 ${
                  algo.paradigm === 'DP'     ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' :
                  algo.paradigm === 'Greedy' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                               'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                }`}>
                  <AlgoIcon id={algo.id} />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{algo.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{algo.korName}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-3 mt-3">
                {algo.description}
              </p>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2 flex-wrap">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Time: <span className="text-foreground font-semibold">{algo.timeComplexity}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Space: <span className="text-foreground font-semibold">{algo.spaceComplexity}</span>
                  </span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${difficultyStyles[algo.difficulty]}`}>
                  {algo.difficulty}
                </span>
              </div>

              {!algo.comingSoon && (
                <div className="mt-3 text-xs font-semibold text-primary group-hover:gap-2 flex items-center gap-1 transition-all">
                  시각화 보기 <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              )}
            </div>
          );

          return algo.comingSoon ? (
            <div key={algo.id} className="h-full">{card}</div>
          ) : (
            <Link key={algo.id} to={`/algorithm/${algo.slug}`} className="block h-full">
              {card}
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
            <p className="text-3xl mb-3">🔍</p>
            <p>조건에 맞는 알고리즘이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
