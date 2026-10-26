import { GitMerge, Layers, ArrowUpFromLine, Lightbulb } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips, InfoSteps } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface LCAInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function LCAInfoModal({ isOpen, onClose, onStartVisualization }: LCAInfoModalProps) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={GitMerge}
      title={tr('최소 공통 조상 (LCA)', 'Lowest common ancestor (LCA)')}
      subtitle={tr('Binary lifting (희소 배열)', 'Binary lifting (sparse table)')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>루트가 있는 트리에서 두 노드 u, v의 <strong>공통 조상</strong> 중 <strong>가장 깊은</strong> 노드를 찾습니다. 쿼리가 많을 때 한 칸씩 올라가면 쿼리마다 O(N)이 걸려요.</p>
        ) : (
          <p>In a rooted tree, find the <strong>deepest</strong> node that is an <strong>ancestor of both</strong> u and v. Climbing one parent at a time costs O(N) per query, which is too slow for many queries.</p>
        )}
        <InfoCode caption={tr('BOJ 11437 예제 트리 (루트 1)', 'BOJ 11437 sample tree (root 1)')}>
          {tr('부모 → 자식', 'parent → children')}
          {'\n1 → 2, 3      2 → 4, 5, 6    3 → 7, 8\n4 → 9, 10     5 → 11, 12     7 → 13, 14\n11 → 15\n\n'}
          LCA(6, 11) = 2, LCA(10, 9) = 4, LCA(8, 13) = 3, LCA(8, 15) = 1
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" icon={Layers} title={tr('2^k번째 조상 표', 'Table of 2^k-th ancestors')}>
            {tr(
              'up[k][v]는 v에서 2^k칸 위의 조상이에요. 2^k칸은 2^(k-1)칸을 두 번 오르는 것이니 up[k][v] = up[k-1][up[k-1][v]]로 채워요.',
              'up[k][v] is the ancestor 2^k levels above v. Climbing 2^k is climbing 2^(k-1) twice, so up[k][v] = up[k-1][up[k-1][v]].',
            )}
          </InfoCard>
          <InfoCard tone="candidate" icon={ArrowUpFromLine} title={tr('이진수로 점프', 'Jump in binary')}>
            {tr(
              '어떤 거리든 2의 거듭제곱의 합이에요. 깊이 차이의 켜진 비트마다 한 번씩 점프하면 O(log N)번에 높이를 맞출 수 있어요.',
              'Any distance is a sum of powers of two. One jump per set bit of the depth difference levels the nodes in O(log N) jumps.',
            )}
          </InfoCard>
        </div>
        <InfoSteps
          steps={[
            tr('DFS로 각 노드의 깊이 depth[v]와 부모 up[0][v]를 구해요.', 'DFS from the root to get each depth[v] and parent up[0][v].'),
            tr('k = 1부터 up[k][v] = up[k-1][up[k-1][v]]로 표를 채워요.', 'Fill up[k][v] = up[k-1][up[k-1][v]] for k = 1, 2, ...'),
            tr('더 깊은 쪽을 깊이 차이만큼 올려 높이를 맞춰요. 같아지면 그 노드가 답이에요.', 'Lift the deeper node by the depth difference. If the two meet, that node is the answer.'),
            tr('큰 k부터 up[k][u] ≠ up[k][v]일 때만 둘 다 올려요. 끝나면 부모 up[0][u]가 LCA예요.', 'From the largest k down, lift both only while up[k][u] ≠ up[k][v]. The parent up[0][u] is then the LCA.'),
          ]}
        />
        <p className="text-muted-foreground text-[13px]">
          <Lightbulb className={cn('w-3.5 h-3.5 inline align-[-2px] mr-1', toneText.candidate)} aria-hidden />
          {tr(
            '조상이 같을 때 올라가지 않는 이유: 같은 조상은 공통 조상이지만 가장 낮은 것인지 알 수 없어요. 다른 동안만 올라가면 LCA 바로 아래에서 멈춥니다.',
            'Why not jump when the ancestors match? A shared ancestor is common but maybe not the lowest. Jumping only while they differ stops right below the LCA.',
          )}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(N log N)"
          space="O(N log N)"
          note={tr(
            '시간은 전처리(표 채우기) 기준이고, 쿼리 하나는 O(log N)이에요.',
            'Time is for the preprocessing (filling the table). Each query then takes O(log N).',
          )}
        />
      </InfoSection>
    </InfoModal>
  );
}
