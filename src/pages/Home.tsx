import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Check, Clock, Play, Code2, PencilRuler, X } from 'lucide-react';
import { ALGORITHMS, ACTIVE_CATEGORIES as CATEGORIES, DIFFICULTY_LABEL, getCategory, type CategoryId, type Difficulty } from '../algorithms/registry';
import { useLang, useTr } from '../i18n';
import { cn } from '../components/ui';
import { toneSoft, toneSolid } from '../components/ui/tone';
import { useProgress } from '../progress/useProgress';
import { NODE_COLORS, EDGE_COLORS, type VizState } from '../components/viz/palette';

const difficultyDots: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

/* ─────────────── Hero illustration: a tiny Dijkstra that plays on loop ─────────────── */

const HERO_NODES = [
  { x: 40,  y: 110 },
  { x: 130, y: 40 },
  { x: 140, y: 170 },
  { x: 240, y: 70 },
  { x: 250, y: 175 },
  { x: 330, y: 120 },
];
const HERO_EDGES: [number, number, number][] = [
  [0, 1, 4], [0, 2, 2], [1, 3, 5], [2, 1, 1], [2, 4, 7], [3, 5, 3], [4, 5, 1], [3, 4, 2],
];
// Each frame: per-node state, highlighted edges
const HERO_FRAMES: { nodes: VizState[]; edges: Record<string, VizState> }[] = [
  { nodes: ['current', 'idle', 'idle', 'idle', 'idle', 'idle'], edges: {} },
  { nodes: ['visited', 'candidate', 'candidate', 'idle', 'idle', 'idle'], edges: { '0-1': 'candidate', '0-2': 'candidate' } },
  { nodes: ['visited', 'candidate', 'current', 'idle', 'idle', 'idle'], edges: { '0-2': 'visited' } },
  { nodes: ['visited', 'current', 'visited', 'idle', 'candidate', 'idle'], edges: { '0-2': 'visited', '2-1': 'visited', '2-4': 'candidate' } },
  { nodes: ['visited', 'visited', 'visited', 'current', 'candidate', 'idle'], edges: { '0-2': 'visited', '2-1': 'visited', '1-3': 'visited' } },
  { nodes: ['visited', 'visited', 'visited', 'visited', 'current', 'candidate'], edges: { '0-2': 'visited', '2-1': 'visited', '1-3': 'visited', '3-4': 'visited', '3-5': 'candidate' } },
  { nodes: ['path', 'path', 'path', 'path', 'path', 'path'], edges: { '0-2': 'path', '2-1': 'path', '1-3': 'path', '3-4': 'path', '4-5': 'path' } },
];

function HeroGraph() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setFrame(f => (f + 1) % HERO_FRAMES.length), 1100);
    return () => clearInterval(t);
  }, []);
  const f = HERO_FRAMES[frame];

  return (
    <svg viewBox="0 0 370 215" className="w-full h-auto overflow-visible" aria-hidden>
      {HERO_EDGES.map(([u, v, w]) => {
        const s = f.edges[`${u}-${v}`] ?? 'idle';
        const a = HERO_NODES[u], b = HERO_NODES[v];
        return (
          <g key={`${u}-${v}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              strokeWidth={s === 'idle' ? 2 : 4} strokeLinecap="round"
              strokeOpacity={s === 'idle' ? 0.35 : 1}
              style={{ stroke: EDGE_COLORS[s], transition: 'all .4s' }} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 7} textAnchor="middle" fontSize={11} fontWeight={700}
              className="font-mono" style={{ fill: 'var(--muted-foreground)' }}>{w}</text>
          </g>
        );
      })}
      {HERO_NODES.map((n, i) => {
        const c = NODE_COLORS[f.nodes[i]];
        return (
          <g key={i} transform={`translate(${n.x},${n.y})`}>
            <circle r={19} strokeWidth={3} style={{ fill: c.fill, stroke: c.stroke, transition: 'all .4s' }} />
            <text textAnchor="middle" dy=".35em" fontSize={14} fontWeight={800} style={{ fill: c.text, transition: 'all .4s' }}>{i}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────── Page ─────────────── */

export default function Home() {
  const { lang } = useLang();
  const tr = useTr();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const { isCompleted } = useProgress();
  const doneCount = ALGORITHMS.filter(a => isCompleted(a.slug)).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALGORITHMS.filter(a => {
      const matchQ = !q
        || a.name.ko.toLowerCase().includes(q)
        || a.name.en.toLowerCase().includes(q)
        || a.keywords.some(k => k.includes(q));
      return matchQ && (category === 'all' || a.category === category);
    });
  }, [query, category]);

  const features = [
    { icon: Play,        title: tr('한 단계씩 재생', 'Play step by step'),  desc: tr('재생·일시정지·되감기로 알고리즘의 매 순간을 멈춰 볼 수 있어요.', 'Play, pause and scrub through every moment of the algorithm.') },
    { icon: Code2,       title: tr('코드와 동기화', 'Synced with code'),     desc: tr('지금 실행 중인 코드 줄이 실시간으로 하이라이트돼요.', 'The line of code being executed lights up in real time.') },
    { icon: PencilRuler, title: tr('직접 만들어 보기', 'Build your own'),     desc: tr('그래프와 입력을 직접 바꿔 보며 결과가 어떻게 달라지는지 확인해요.', 'Edit graphs and inputs to see how the result changes.') },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-state-current/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-state-path/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {tr('인터랙티브 알고리즘 시각화', 'Interactive algorithm visualizer')}
            </span>
            <h1 className="mt-4 text-[2rem] leading-[1.15] sm:text-5xl font-black tracking-tight text-balance">
              {lang === 'ko' ? (
                <>알고리즘을 <span className="text-primary">한 단계씩</span><br className="hidden sm:block" /> 눈으로 이해해요</>
              ) : (
                <>Understand algorithms <span className="text-primary">one step</span><br className="hidden sm:block" /> at a time</>
              )}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty">
              {tr(
                '최단 경로, 그래프 탐색, 동적 계획법, 정렬까지. 노드가 어떻게 선택되고 값이 어떻게 바뀌는지 코드와 함께 따라가 보세요.',
                'Shortest paths, graph traversal, dynamic programming and sorting — follow how each node is chosen and every value changes, right next to the code.',
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/algorithm/dijkstra" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all">
                <Play className="w-4 h-4" fill="currentColor" />
                {tr('다익스트라로 시작하기', 'Start with Dijkstra')}
              </Link>
              <a href="#algorithms" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-card font-bold hover:bg-muted transition-colors">
                {tr('전체 알고리즘 보기', 'Browse all algorithms')}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="viz-surface rounded-3xl border border-border p-5 sm:p-7 shadow-card"
          >
            <HeroGraph />
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 space-y-12">
        {/* ── Features ── */}
        <section className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold tracking-tight">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        {/* ── Catalogue ── */}
        <section id="algorithms" className="scroll-mt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight">{tr('알고리즘 둘러보기', 'Explore algorithms')}</h2>
                <span className={cn('inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-bold', doneCount > 0 ? toneSoft.visited : toneSoft.neutral)}>
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  {tr(`${doneCount} / ${ALGORITHMS.length} 완료`, `${doneCount} / ${ALGORITHMS.length} completed`)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr(`${ALGORITHMS.length}개의 알고리즘을 시각화로 배워 보세요.`, `${ALGORITHMS.length} algorithms ready to visualize.`)}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hint" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={tr('이름이나 키워드로 검색', 'Search by name or keyword')}
                className="w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-card text-sm placeholder:text-hint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-shadow"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label={tr('검색어 지우기', 'Clear search')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-hint hover:text-foreground hover:bg-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {([{ id: 'all' as const, label: tr('전체', 'All') }, ...CATEGORIES.map(c => ({ id: c.id, label: c.name[lang] }))]).map(c => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={cn(
                    'shrink-0 h-9 px-4 rounded-full text-sm font-bold border transition-colors',
                    active ? 'bg-foreground text-background border-foreground' : 'bg-card border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <motion.div layout className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((algo, i) => {
                const Icon = algo.icon;
                const cat = getCategory(algo.category);
                return (
                  <motion.div
                    layout
                    key={algo.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <Link
                      to={`/algorithm/${algo.slug}`}
                      className="group flex flex-col h-full rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={cn('w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform', cat.gradient)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground" title={DIFFICULTY_LABEL[algo.difficulty][lang]}>
                          <span className="flex gap-0.5">
                            {[1, 2, 3].map(d => (
                              <span key={d} className={cn('w-1.5 h-3.5 rounded-full', d <= difficultyDots[algo.difficulty] ? 'bg-primary' : 'bg-muted')} />
                            ))}
                          </span>
                          {DIFFICULTY_LABEL[algo.difficulty][lang]}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                        <span className="min-w-0">{algo.name[lang]}</span>
                        {isCompleted(algo.slug) && (
                          <span title={tr('학습 완료', 'Completed')} aria-label={tr('학습 완료', 'Completed')} className={cn('shrink-0 w-5 h-5 rounded-full flex items-center justify-center', toneSolid.visited)}>
                            <Check className="w-3 h-3" strokeWidth={3.5} />
                          </span>
                        )}
                      </h3>
                      {lang === 'ko' && <p className="text-xs font-semibold text-hint">{algo.name.en}</p>}
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{algo.description[lang]}</p>

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {algo.time}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          {tr('시작하기', 'Open')}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Search className="w-6 h-6 text-hint" />
              </div>
              <p className="font-bold">{tr('검색 결과가 없어요', 'No algorithms found')}</p>
              <button onClick={() => { setQuery(''); setCategory('all'); }} className="text-sm font-bold text-primary hover:underline">
                {tr('필터 초기화', 'Reset filters')}
              </button>
            </div>
          )}
        </section>

        <footer className="pt-6 pb-4 border-t border-border flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <span>© AlgoTrace</span>
          <a href="https://github.com/nahyun27/algotrace" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
