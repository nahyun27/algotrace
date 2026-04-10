import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Zap, Clock } from 'lucide-react';

interface DijkstraInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function DijkstraInfoModal({ isOpen, onClose, onStartVisualization }: DijkstraInfoModalProps) {
  const handleStart = () => { onClose(); onStartVisualization(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl bg-card text-card-foreground rounded-2xl shadow-2xl border pointer-events-auto overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <button onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto space-y-6">
                {/* Title */}
                <div className="pr-8">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Network className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight">다익스트라 알고리즘</h2>
                  </div>
                  <p className="text-sm text-muted-foreground ml-12">
                    Dijkstra's Algorithm — 단일 출발점 최단 경로 (SSSP)
                  </p>
                </div>

                <hr className="border-border" />

                {/* 문제 정의 */}
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black">1</span>
                    문제 정의
                  </h3>
                  <p className="text-sm leading-relaxed">
                    가중치가 <strong>음수가 아닌</strong> 방향/무방향 그래프에서
                    <strong>하나의 출발 노드</strong>에서 모든 다른 노드까지의 <strong>최단 거리</strong>를 구합니다.
                  </p>
                  <div className="bg-muted/50 rounded-xl p-4 text-sm font-mono border">
                    <p className="text-muted-foreground mb-1 text-xs font-sans font-semibold">예시 그래프</p>
                    <p>노드 5개 (0~4), 출발: 노드 0</p>
                    <p className="text-muted-foreground text-xs mt-2">
                      0→1(10), 0→2(3), 2→1(4), 2→4(2)<br/>
                      1→3(2), 2→3(8), 4→3(1), 3→4(5)
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 text-xs">
                      최단 거리: 0→0=0, 0→1=7, 0→2=3, 0→3=6, 0→4=5
                    </p>
                  </div>
                </section>

                <hr className="border-border" />

                {/* 핵심 아이디어 */}
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-black">2</span>
                    <Zap className="w-3.5 h-3.5 text-teal-500" />
                    핵심 아이디어
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm mb-1">🟢 탐욕 선택 (Greedy)</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        매 단계에서 <strong>현재 dist가 가장 작은</strong> 미방문 노드를 선택합니다.
                        음수 간선이 없으면 이 선택이 항상 최적입니다.
                      </p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
                      <p className="font-bold text-teal-700 dark:text-teal-300 text-sm mb-1">⚡ 우선순위 큐</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        min-heap으로 다음 처리할 노드를 O(log V)에 꺼내
                        전체를 O((V+E) log V)로 줄입니다.
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-4 text-xs leading-relaxed border">
                    <p className="font-semibold mb-2">완화(Relaxation) 연산</p>
                    <code className="font-mono text-sm">
                      if dist[u] + w(u,v) &lt; dist[v]:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;dist[v] = dist[u] + w(u,v)
                    </code>
                    <p className="text-muted-foreground mt-2">u를 거쳐 v에 가는 게 더 저렴하면 dist[v]를 갱신합니다.</p>
                  </div>
                </section>

                <hr className="border-border" />

                {/* 복잡도 */}
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center font-black">3</span>
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    복잡도
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                      <span className="text-xs text-muted-foreground font-semibold">시간</span>
                      <code className="text-sm font-bold font-mono text-amber-700 dark:text-amber-300">O((V+E) log V)</code>
                    </div>
                    <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl px-4 py-3">
                      <span className="text-xs text-muted-foreground font-semibold">공간</span>
                      <code className="text-sm font-bold font-mono text-sky-700 dark:text-sky-300">O(V)</code>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ <strong>음수 가중치</strong>가 있는 그래프에는 사용할 수 없습니다. 그 경우 Bellman-Ford 알고리즘을 사용하세요.
                  </p>
                </section>
              </div>

              <div className="border-t px-6 md:px-8 py-4 flex justify-end gap-3 bg-muted/20">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted/60 transition-colors">
                  닫기
                </button>
                <button onClick={handleStart}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm">
                  ▶ 시각화 시작하기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
