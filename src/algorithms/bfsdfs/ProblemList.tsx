import { ExternalLink } from 'lucide-react';

const PROBLEMS = [
  { id: 1260, title: 'DFS와 BFS',       tier: 'Silver II', nLimit: 'N ≤ 1,000', note: '가장 기본적인 구현' },
  { id: 2178, title: '미로 탐색',       tier: 'Silver I',  nLimit: 'N,M ≤ 100', note: 'BFS(최단경로)' },
  { id: 1012, title: '유기농 배추',     tier: 'Silver II', nLimit: 'T, N ≤ 50', note: 'DFS/BFS 연결요소 탐색' },
  { id: 2667, title: '단지번호붙이기',  tier: 'Silver I',  nLimit: 'N ≤ 25',    note: '방문 영역 넓이 구하기' },
];

export default function ProblemList() {
  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col min-h-64">
      <div className="p-3 border-b bg-muted/30 flex-shrink-0">
        <h2 className="font-semibold tracking-tight text-sm">Related Problems (BOJ)</h2>
      </div>
      <div className="p-0 overflow-y-auto">
        <ul className="divide-y divide-border">
          {PROBLEMS.map(prob => (
            <li key={prob.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm bg-muted/50 px-1 rounded">{prob.id}</span>
                  <span className="font-semibold text-sm">{prob.title}</span>
                  <a href={`https://acmicpc.net/problem/${prob.id}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold tracking-wide border
                  ${'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                >
                  {prob.tier}
                </span>
              </div>
              <div className="flex gap-2 mt-2 text-xs font-medium text-muted-foreground">
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded shadow-sm">{prob.nLimit}</span>
                <span className="bg-muted px-1.5 py-0.5 rounded shadow-sm">{prob.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
