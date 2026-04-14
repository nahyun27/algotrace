import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowRight, Clock, Activity, BarChart3, Waypoints, Network, Route, Share2 } from 'lucide-react';

type Paradigm    = "DP" | "Greedy" | "exploration";
type ProblemType = "Shortest Path" | "Traversal" | "Optimization" | "MST" | "Sorting";

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
  keywords?: string[];
}

const ALGORITHMS: AlgoCard[] = [
  { id: "tsp", name: "Traveling Salesperson", korName: "외판원 순회", slug: "tsp", description: "Find the shortest possible route that visits every city and returns to the origin.", difficulty: "Hard", paradigm: "DP", problemType: "Optimization", timeComplexity: "O(N²·2ᴺ)", spaceComplexity: "O(N·2ᴺ)" },
  { id: "dijkstra", name: "Dijkstra", korName: "다익스트라", slug: "dijkstra", description: "Computes the shortest path from a single source to all other nodes in a weighted graph.", difficulty: "Medium", paradigm: "Greedy", problemType: "Shortest Path", timeComplexity: "O((V+E)logV)", spaceComplexity: "O(V)" },
  { id: "astar", name: "A* Search", korName: "A* 탐색", slug: "astar", description: "Efficiently finds the shortest path using a heuristic function to guide the search.", difficulty: "Hard", paradigm: "Greedy", problemType: "Shortest Path", timeComplexity: "O(E logV)", spaceComplexity: "O(V)" },
  { id: "bfsdfs", name: "BFS / DFS", korName: "너비/깊이 우선 탐색", slug: "bfsdfs", description: "Fundamental graph traversal techniques using Queues (BFS) and Stacks (DFS).", difficulty: "Easy", paradigm: "exploration", problemType: "Traversal", timeComplexity: "O(V+E)", spaceComplexity: "O(V)" },
  { id: "bellmanford", name: "Bellman-Ford", korName: "벨만-포드", slug: "bellmanford", description: "Calculates shortest paths while detecting negative weight cycles in a graph.", difficulty: "Medium", paradigm: "DP", problemType: "Shortest Path", timeComplexity: "O(V·E)", spaceComplexity: "O(V)" },
  { id: "floydwarshall", name: "Floyd-Warshall", korName: "플로이드-워셜", slug: "floyd-warshall", description: "Finds all-pairs shortest paths using a dynamic programming approach.", difficulty: "Medium", paradigm: "DP", problemType: "Shortest Path", timeComplexity: "O(V³)", spaceComplexity: "O(V²)" },
  { id: "kruskal", name: "Kruskal / Prim", korName: "크루스칼 / 프림", slug: "kruskal", description: "Constructs a Minimum Spanning Tree (MST) for connected weighted graphs.", difficulty: "Hard", paradigm: "Greedy", problemType: "MST", timeComplexity: "O(ElogE)", spaceComplexity: "O(V+E)" },
  { id: "topological", name: "Topological Sort", korName: "위상정렬", slug: "topological", description: "Determines a linear ordering of vertices in a Directed Acyclic Graph (DAG).", difficulty: "Medium", paradigm: "exploration", problemType: "Traversal", timeComplexity: "O(V+E)", spaceComplexity: "O(V+E)" },
  { id: "sorting", name: "Sorting Suite", korName: "정렬 알고리즘", slug: "sorting", description: "Visual comparisons of popular sorting techniques: Bubble, Merge, Quick, etc.", difficulty: "Easy", paradigm: "exploration", problemType: "Sorting", timeComplexity: "O(nlogn)", spaceComplexity: "O(n)", keywords: ['bubble','merge','quick','heap','sort'] },
];

const paradigmColors: Record<Paradigm, string> = {
  DP: 'from-blue-500 to-cyan-500',
  Greedy: 'from-orange-500 to-amber-500',
  exploration: 'from-violet-500 to-purple-500',
};

const diffBadge: Record<string, string> = {
  Easy:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Hard:   'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

function AlgoIcon({ id }: { id: string }) {
  const cls = "w-5 h-5";
  switch (id) {
    case "tsp": return <Route className={cls} />;
    case "dijkstra": case "astar": case "bellmanford": case "floydwarshall": return <Waypoints className={cls} />;
    case "bfsdfs": case "topological": return <Network className={cls} />;
    case "kruskal": return <Share2 className={cls} />;
    case "sorting": return <BarChart3 className={cls} />;
    default: return <Activity className={cls} />;
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [paradigm, setParadigm] = useState<Paradigm | "">("");
  const [problemType, setProblemType] = useState<ProblemType | "">("");

  const resetFilters = () => { setQuery(""); setParadigm(""); setProblemType(""); };
  const hasActiveFilters = query !== "" || paradigm !== "" || problemType !== "";

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ALGORITHMS.filter(a => {
      const matchQ = a.name.toLowerCase().includes(q) || a.korName.toLowerCase().includes(q) || (a.keywords?.some(k => k.toLowerCase().includes(q)) ?? false);
      return matchQ && (paradigm === "" || a.paradigm === paradigm) && (problemType === "" || a.problemType === problemType);
    });
  }, [query, paradigm, problemType]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col w-full pb-20">
      
      {/* ── Full Width Hero Section ── */}
      <section className="relative pt-10 pb-6 w-full">
        {/* Full-bleed background gradient blending to transparent */}
        <div className="absolute inset-0 w-[100vw] left-1/2 -translate-x-1/2 bg-gradient-to-b from-card via-card/50 to-transparent z-[-1] pointer-events-none" />
        
        {/* Subtle Background Accent */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-primary/5 blur-[80px] rounded-full pointer-events-none mix-blend-screen z-[-1]" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6"
          >
            {/* Main Content (Left) */}
            <div className="space-y-4 text-center md:text-left max-w-2xl w-full">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-border/50 bg-background/50 shadow-sm mb-1">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 leading-none">
                  Algorithm Visualization
                </span>
              </div>
              
              <div className="flex items-end justify-center md:justify-start gap-3 md:gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-foreground">
                  Algo<span className="opacity-40">Trace</span>
                </h1>
                
                <div className="flex -space-x-2 mb-0.5 md:mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                      <div className={`w-full h-full bg-gradient-to-br ${i === 1 ? 'from-blue-500' : i === 2 ? 'from-purple-500' : i === 3 ? 'from-rose-500' : 'from-emerald-500'} to-transparent opacity-80`} />
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                Interactive step-by-step visualizer for core algorithms.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Container ── */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-4 md:space-y-8 mt-2 md:mt-4">
        {/* Control Bar (Search + Filters) */}
        <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="sticky top-6 z-30"
      >
        <div className="bg-card/80 backdrop-blur-md p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-md border border-border/40 flex flex-col md:flex-row gap-1.5 md:gap-2">
          {/* Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, category..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-10 md:h-12 pl-9 md:pl-11 pr-4 rounded-lg md:rounded-xl bg-background/50 border-none text-xs md:text-sm placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="h-px md:h-8 md:w-px bg-border/60 self-center mx-1" />

          {/* Type Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1.5 py-1">
            <div className="flex items-center gap-1.5 mr-1 md:mr-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground/40 hidden md:block" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 whitespace-nowrap hidden md:inline">Filter</span>
            </div>
            
            {(['Shortest Path', 'Traversal', 'MST', 'Sorting', 'Optimization'] as const).map(label => {
              const active = problemType === label;
              return (
                <button 
                  key={label} 
                  onClick={() => setProblemType(active ? '' : label as ProblemType)}
                  className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                    active 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                      : 'hover:bg-muted text-muted-foreground/70 active:scale-95'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="ml-1 md:ml-2 px-2.5 py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Algorithm Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map(algo => (
            <motion.div
              layout
              key={algo.id}
              variants={item}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group h-full"
            >
              <Link 
                to={algo.comingSoon ? "#" : `/algorithm/${algo.slug}`}
                className={`flex flex-col h-full rounded-xl md:rounded-2xl border border-border/40 bg-card/80 shadow-md shadow-black/5 dark:shadow-[0_8px_30px_rgba(99,102,241,0.12)] backdrop-blur-md p-3.5 md:p-5 transition-all duration-300 ${
                  algo.comingSoon 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5'
                }`}
              >
                {/* Header: Icon + Title + Difficulty */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className={`shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br ${paradigmColors[algo.paradigm]} flex items-center justify-center text-white shadow-sm`}>
                      <AlgoIcon id={algo.id} />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold tracking-tight group-hover:text-primary transition-colors leading-tight">
                        {algo.name}
                      </h3>
                      <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground opacity-60 mt-0.5">
                        {algo.korName}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 ml-2 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-wider border ${diffBadge[algo.difficulty]}`}>
                    {algo.difficulty}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <p className="text-[11px] md:text-xs text-foreground/70 leading-relaxed font-medium">
                    {algo.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-bold text-muted-foreground/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {algo.timeComplexity}
                    </div>
                  </div>
                  
                  {!algo.comingSoon && (
                    <div className="p-1 md:p-1.5 rounded-md bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-bold">No results found for your query.</p>
            <button 
              onClick={resetFilters}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Reset Search
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>

    </div>
  );
}
