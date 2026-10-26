import { MapPin, Check, AlertTriangle, X, Hash, Recycle } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface TSPInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function TSPInfoModal({ isOpen, onClose, onStartVisualization }: TSPInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();

  const growth = [
    { n: 4,  count: '6',                                  note: tr('즉시 계산', 'Instant'), icon: Check, tone: 'path' as const },
    { n: 10, count: '362,880',                            note: tr('빠름', 'Fast'), icon: Check, tone: 'path' as const },
    { n: 15, count: tr('약 872억', '≈ 8.7 × 10¹⁰'),       note: tr('수십 분', 'Tens of minutes'), icon: AlertTriangle, tone: 'candidate' as const },
    { n: 20, count: tr('약 1.2 × 10¹⁷', '≈ 1.2 × 10¹⁷'), note: tr('수백 년', 'Centuries'), icon: X, tone: 'danger' as const },
  ];

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={MapPin}
      title={tr('외판원 순회 문제 (TSP)', 'Traveling Salesperson Problem (TSP)')}
      subtitle={tr(
        '조합 최적화의 대표 NP-hard 문제 (Traveling Salesperson Problem)',
        'The classic NP-hard problem of combinatorial optimization',
      )}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p><strong>N개 도시</strong>를 모두 한 번씩만 방문하고 출발 도시로 돌아오는 경로 중 총 이동 비용(거리)이 최소인 경로를 구하는 문제입니다.</p>
        ) : (
          <p>Visit each of the <strong>N cities</strong> exactly once and return to the starting city, choosing the route with the smallest total travel cost (distance).</p>
        )}
        <InfoCode caption={tr('예시: 도시 4개', 'Example: 4 cities')}>
          {tr('가능한 경로 수 = (4-1)! = 6가지', 'Possible routes = (4-1)! = 6')}
          {'\n\n0→1→2→3→0  |  0→1→3→2→0  |  0→2→1→3→0\n0→2→3→1→0  |  0→3→1→2→0  |  0→3→2→1→0'}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('왜 어려운가?', 'Why is it hard?')}>
        {lang === 'ko' ? (
          <p>완전 탐색(브루트포스)으로 풀면 경우의 수가 <strong>N!로 폭발적으로 증가</strong>합니다.</p>
        ) : (
          <p>With brute force the number of routes <strong>explodes as N!</strong>.</p>
        )}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs">
                <th className="px-4 py-2 text-left font-semibold">{tr('도시 수 N', 'Cities (N)')}</th>
                <th className="px-4 py-2 text-left font-semibold">{tr('경우의 수 (N-1)!', 'Routes (N-1)!')}</th>
                <th className="px-4 py-2 text-left font-semibold">{tr('비고', 'Notes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {growth.map(row => (
                <tr key={row.n} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-mono font-bold">{row.n}</td>
                  <td className={cn('px-4 py-2 font-mono', row.n >= 15 && `${toneText.danger} font-bold`)}>{row.count}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 align-top">
                      <row.icon className={cn('w-3.5 h-3.5 shrink-0', toneText[row.tone])} aria-hidden />
                      {row.note}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection n={3} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" icon={Hash} title={tr('비트마스크', 'Bitmask')}>
            {lang === 'ko' ? (
              <>N개 도시의 방문 여부를 <code className="font-mono">N비트 정수</code> 하나로 표현합니다. 예: <code className="font-mono">0b0111</code> → 도시 0, 1, 2 방문 완료</>
            ) : (
              <>Store which of the N cities have been visited in a single <code className="font-mono">N-bit integer</code>. E.g. <code className="font-mono">0b0111</code> → cities 0, 1, 2 visited</>
            )}
          </InfoCard>
          <InfoCard tone="visited" icon={Recycle} title={tr('동적 프로그래밍', 'Dynamic programming')}>
            {lang === 'ko' ? (
              <>부분 문제 <code className="font-mono">dp[mask][i]</code>의 결과를 저장해 중복 계산을 제거하고, (N-1)! 완전 탐색을 N²·2ᴺ 수준으로 줄입니다.</>
            ) : (
              <>Save the answer of each subproblem <code className="font-mono">dp[mask][i]</code> so it's never recomputed, cutting the factorial search down to N² × 2ᴺ.</>
            )}
          </InfoCard>
        </div>
      </InfoSection>

      <InfoSection n={4} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(N² × 2ᴺ)"
          space="O(N × 2ᴺ)"
          note={tr(
            'N=20이면 이조차 수 GB의 메모리가 필요해 실용적 한계는 N≈20 수준입니다.',
            'At N=20 even this needs gigabytes of memory, so the practical limit is around N≈20.',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
