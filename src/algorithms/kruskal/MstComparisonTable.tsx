import { Scale } from 'lucide-react';
import { useTr } from '../../i18n';

/**
 * Kruskal vs Prim in plain words, shown at the bottom of both concept modals.
 * Both use the same four-island example, so the answer (total 7) is the same.
 */
export default function MstComparisonTable() {
  const tr = useTr();
  const rows: [string, string, string][] = [
    [tr('어떻게 키우나', 'How it grows'), tr('어디든 가장 싼 다리부터 놓아요', 'Cheapest bridge anywhere, first'), tr('한 덩어리에서 가장 싼 이웃으로 뻗어요', 'One blob reaching its cheapest neighbor')],
    [tr('필요한 도구', 'Helper'), tr('Union-Find (누가 어느 팀인지 적은 명부)', 'Union-Find (a roster of who is on which team)'), tr('우선순위 큐 (가장 싼 후보를 바로 꺼내는 상자)', 'Priority queue (hands you the cheapest candidate)')],
    [tr('잘 맞는 경우', 'Best when'), tr('간선이 적을 때, 간선 목록이 주어질 때', 'Few edges, or you are given an edge list'), tr('간선이 아주 많을 때 (거의 모든 점끼리 연결)', 'Lots of edges (nearly every pair connected)')],
    [tr('결과', 'Result'), tr('총비용이 같은 최소 신장 트리', 'A minimum spanning tree with the same total'), tr('총비용이 같은 최소 신장 트리', 'A minimum spanning tree with the same total')],
  ];
  return (
    <section>
      <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
        <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4" />
        </span>
        {tr('크루스칼과 프림 비교', 'Kruskal and Prim compared')}
      </h3>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="py-2 px-3" />
              <th className="py-2 px-3 font-bold">{tr('크루스칼', 'Kruskal')}</th>
              <th className="py-2 px-3 font-bold">{tr('프림', 'Prim')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(([feat, k, p]) => (
              <tr key={feat}>
                <td className="py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">{feat}</td>
                <td className="py-2.5 px-3">{k}</td>
                <td className="py-2.5 px-3">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
