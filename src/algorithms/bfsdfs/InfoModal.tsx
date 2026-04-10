import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'BFS' | 'DFS';
}

export default function InfoModal({ isOpen, onClose, mode }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className={`p-6 text-white shrink-0 ${mode === 'BFS' ? 'bg-gradient-to-r from-sky-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    {mode === 'BFS' ? '너비 우선 탐색 (BFS)' : '깊이 우선 탐색 (DFS)'}
                  </h2>
                  <p className="text-sky-100 dark:text-emerald-100 text-sm font-medium">
                    {mode === 'BFS' ? '가까운 노드부터 차례대로 탐색' : '한 방향으로 갈 수 있을 때까지 깊게 탐색'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
                <section>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3">핵심 차이점</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                          <th className="py-2 pr-4">특징</th>
                          <th className="py-2 pr-4 text-sky-600 dark:text-sky-400">BFS</th>
                          <th className="py-2 text-emerald-600 dark:text-emerald-400">DFS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        <tr>
                          <td className="py-3 pr-4 font-medium">자료구조</td>
                          <td className="py-3 pr-4 font-bold text-sky-600 dark:text-sky-400">큐 (Queue)</td>
                          <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">스택 (Stack) 또는 재귀</td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-medium">방문 순서</td>
                          <td className="py-3 pr-4">시작점부터 거리가 가까운 순</td>
                          <td className="py-3">한 갈래를 끝까지 탐색 후 되돌아옴</td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-medium">주요 용도</td>
                          <td className="py-3 pr-4">가중치 없는 최단 경로, 영역 넓이</td>
                          <td className="py-3">경로 특징 저장, 사이클 판별, 백트래킹</td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-medium">단점</td>
                          <td className="py-3 pr-4">노드가 많을 수록 메모리(큐) 소모 큼</td>
                          <td className="py-3">최단 경로가 아닐 수 있음, 무한 루프 위험</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">시간 및 공간 복잡도</h3>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="font-bold w-32 shrink-0">시간 복잡도:</span>
                        <span>전체 노드(V)와 간선(E)을 모두 한 번씩 확인하므로 <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-black dark:text-white">O(V + E)</code> (인접 리스트 기준)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold w-32 shrink-0">공간 복잡도:</span>
                        <span>최악의 경우 큐/스택에 모든 노드가 들어가므로 <code className="bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded text-black dark:text-white">O(V)</code></span>
                      </li>
                    </ul>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Tip💡</h3>
                  <p className="leading-relaxed">
                    BFS와 DFS는 모두 모든 노드를 탐색하는 완전 탐색 기법입니다.
                    문제에 "최단 경로"라는 말이 있다면 대체로 <strong>BFS</strong>를,
                    "모든 경로를 탐색하여 특정 조건 만족 여부 파악" 이라면 재귀를 활용한 <strong>DFS(백트래킹)</strong>가 유리한 경우가 많습니다.
                  </p>
                </section>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900/50 shrink-0 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
