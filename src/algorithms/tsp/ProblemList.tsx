import { ExternalLink } from 'lucide-react';

const PROBLEMS = [
  { id: 10971, title: '외판원 순회 2', tier: 'Silver II', nLimit: 'N ≤ 10', bf: 'O(N!) 완전탐색 가능' },
  { id: 2098, title: '외판원 순회', tier: 'Gold I', nLimit: 'N ≤ 16', bf: 'O(N² 2^N) DP 필수' },
  { id: 16991, title: '외판원 순회 3', tier: 'Gold I', nLimit: 'N ≤ 16', bf: 'O(N² 2^N) 좌표 거리 DP' },
];

export default function ProblemList() {
  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col min-h-64">
      <div className="p-3 border-b bg-muted/30 flex-shrink-0">
        <h2 className="font-semibold tracking-tight text-sm">Related Problems (BOJ)</h2>
      </div>
      <div className="p-0 overflow-y-auto">
        <ul className="divide-y divide-border">
          {PROBLEMS.map((prob) => (
            <li key={prob.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm bg-muted/50 px-1 rounded">{prob.id}</span>
                  <span className="font-semibold text-sm">{prob.title}</span>
                  <a href={`https://acmicpc.net/problem/${prob.id}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold tracking-wide
                  ${prob.tier.startsWith('Gold') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' 
                                                 : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                  {prob.tier}
                </span>
              </div>
              <div className="flex gap-2 mt-2 text-xs font-medium text-muted-foreground">
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded shadow-sm">{prob.nLimit}</span>
                <span className="bg-muted px-1.5 py-0.5 rounded shadow-sm">{prob.bf}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
