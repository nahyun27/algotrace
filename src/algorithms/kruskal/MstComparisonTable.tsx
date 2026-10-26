import { useTr } from '../../i18n';

/** Kruskal vs Prim comparison, shown in both info modals. */
export default function MstComparisonTable() {
  const tr = useTr();
  const rows: [string, string, string][] = [
    [tr('탐색 기준', 'Works on'), tr('간선(Edge) 기준', 'Edges'), tr('노드(Vertex) 기준', 'Vertices')],
    [tr('자료구조', 'Data structure'), 'Union-Find', tr('우선순위 큐', 'Priority queue')],
    [tr('적합한 그래프', 'Best for'), tr('희소 그래프 (E ≪ V²)', 'Sparse graphs (E ≪ V²)'), tr('밀집 그래프 (E ≈ V², 배열 구현 시 O(V²))', 'Dense graphs (E ≈ V², O(V²) with an array)')],
    [tr('시간복잡도', 'Time'), 'O(E log E)', 'O(E log V)'],
    [tr('MST 결과', 'Resulting MST'), tr('동일', 'Same'), tr('동일', 'Same')],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="py-2 px-3 font-semibold text-muted-foreground">{tr('특징', 'Feature')}</th>
            <th className="py-2 px-3 font-bold">{tr('크루스칼', 'Kruskal')}</th>
            <th className="py-2 px-3 font-bold">{tr('프림', 'Prim')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([feat, k, p]) => (
            <tr key={feat}>
              <td className="py-2 px-3 font-medium text-muted-foreground">{feat}</td>
              <td className="py-2 px-3">{k}</td>
              <td className="py-2 px-3">{p}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
