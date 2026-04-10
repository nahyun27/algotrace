import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

interface AlgoCard {
  id: string;
  name: string;
  korName: string;
  slug: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Graph" | "DP" | "Pathfinding";
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
    category: "DP",
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
    category: "Graph",
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
    category: "Pathfinding",
    timeComplexity: "O(E log V)",
    spaceComplexity: "O(V)",
    comingSoon: true,
  },
  {
    id: "bfsdfs",
    name: "BFS / DFS",
    korName: "너비/깊이 우선 탐색",
    slug: "bfsdfs",
    description: "그래프를 층별(BFS) 또는 경로별(DFS)로 탐색하는 가장 기본적인 알고리즘입니다.",
    difficulty: "Easy",
    category: "Graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    comingSoon: true,
  },
];

const CATEGORIES = ["All", "Graph", "DP", "Pathfinding"] as const;
type Category = typeof CATEGORIES[number];

const difficultyStyles = {
  Easy:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  Medium: "bg-amber-100  text-amber-800  dark:bg-amber-900/50  dark:text-amber-300",
  Hard:   "bg-rose-100   text-rose-800   dark:bg-rose-900/50   dark:text-rose-300",
};

const categoryStyles: Record<string, string> = {
  Graph:       "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  DP:          "bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300",
  Pathfinding: "bg-teal-100   text-teal-700   dark:bg-teal-900/40   dark:text-teal-300",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ALGORITHMS.filter(a => {
      const matchCat = activeCategory === "All" || a.category === activeCategory;
      const matchQ   = a.name.toLowerCase().includes(q) || a.korName.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block mb-4 text-xs font-semibold tracking-widest uppercase bg-white/20 rounded-full px-3 py-1">
            Algorithm Visualizer
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            AlgoVis
          </h1>
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

      {/* ── Search + Category Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="알고리즘 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(algo => {
          const card = (
            <div
              className={`group flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm p-5 transition-all duration-200 ${
                algo.comingSoon
                  ? "opacity-50 cursor-not-allowed select-none"
                  : "hover:-translate-y-1 hover:shadow-md hover:border-primary/40 cursor-pointer"
              }`}
            >
              {/* Top row: category + coming soon */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryStyles[algo.category]}`}>
                  {algo.category}
                </span>
                {algo.comingSoon && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="font-bold text-base leading-tight">{algo.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">{algo.korName}</p>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-3">
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
            <div key={algo.id}>{card}</div>
          ) : (
            <Link key={algo.id} to={`/algorithm/${algo.slug}`} className="block">
              {card}
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
            <p className="text-3xl mb-3">🔍</p>
            <p>"{query}" 에 해당하는 알고리즘이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
