import { Backpack, Tent } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import { InfoCode } from '../../components/algorithm/InfoModal';
import { MiniTable } from '../../components/viz/MiniTable';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneSoft } from '../../components/ui/tone';
import { useTr, type Tr } from '../../i18n';

interface KnapsackInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** Three items, capacity 4. Best: items 2 + 3 (1 kg + 3 kg) worth 2 + 4 = 6. */
const ITEMS = [{ w: 2, v: 3 }, { w: 1, v: 2 }, { w: 3, v: 4 }];
const FULL = [
  [0, 0, 0, 0, 0],
  [0, 0, 3, 3, 3],
  [0, 2, 3, 5, 5],
  [0, 2, 3, 5, 6],
];

/** Table filled in reading order up to (r, c); later cells are still empty. */
function upTo(r: number, c: number) {
  return FULL.map((row, i) => row.map((v, j) => (i < r || (i === r && j <= c) ? v : null)));
}

function frame(
  tr: Tr,
  values: (number | null)[][],
  states: Record<string, VizState>,
  activeItem?: number,
) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex flex-wrap justify-center gap-1.5">
        {ITEMS.map((it, i) => (
          <span key={i} className={cn('rounded-lg px-2 py-0.5 text-xs font-bold', activeItem === i + 1 ? toneSoft.current : toneSoft.neutral)}>
            {tr(`물건${i + 1}: ${it.w}kg, ${it.v}점`, `Item ${i + 1}: ${it.w} kg, worth ${it.v}`)}
          </span>
        ))}
      </div>
      <MiniTable
        corner={tr('물건 \\ 무게', 'items \\ kg')}
        rowLabels={[tr('없음', 'none'), '1', '2', '3']}
        colLabels={[0, 1, 2, 3, 4]}
        values={values}
        cellState={(r, c) => states[`${r},${c}`] ?? (values[r][c] === null ? 'idle' : 'visited')}
      />
    </div>
  );
}

export default function KnapsackInfoModal({ isOpen, onClose, onStartVisualization }: KnapsackInfoModalProps) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Backpack}
      title={tr('0/1 배낭 문제', '0/1 knapsack')}
      subtitle={tr('물건마다 넣거나 말거나, 두 가지 선택', 'Each item is either taken or left behind')}
      summary={tr(
        '"가방이 c kg까지 버틸 때 앞의 물건들로 얻는 최고 가치"를 작은 가방부터 표에 적어 두고, 그 답을 다시 꺼내 써서 큰 가방의 답을 만들어요.',
        'Write down "the best value the first few items give for a bag that holds c kg", starting with tiny bags, and reuse those answers to build the answer for the big bag.',
      )}
      analogy={{
        icon: Tent,
        title: tr('캠핑 배낭 싸기', 'Packing for a camping trip'),
        body: tr(
          '배낭은 4kg까지만 들 수 있고, 물건마다 무게와 쓸모(점수)가 달라요. 물건을 하나씩 보면서 "이걸 넣을까, 뺄까?"를 정하는데, 넣으면 그 무게만큼 자리가 줄어요. 매번 처음부터 다 따져 보는 대신, "3kg짜리 가방이었다면 최고 몇 점?" 같은 작은 답을 메모해 두고 꺼내 써요.',
          'Your backpack holds only 4 kg, and every item has a weight and a usefulness score. You look at items one by one and decide "pack it or leave it"; packing it uses up its weight. Instead of rethinking everything each time, you keep notes like "with a 3 kg bag, the best score is…" and reuse them.',
        ),
      }}
      storyboard={[
        {
          visual: frame(tr, upTo(0, 4), {}),
          caption: tr(
            '칸 dp[i][c] = "물건 1~i만 써서, c kg까지 담을 때의 최고 점수"예요. 물건이 하나도 없으면(첫 줄) 어떤 가방이든 0점이에요.',
            'Cell dp[i][c] = "the best score using only items 1..i with room for c kg". With no items (first row), every bag scores 0.',
          ),
        },
        {
          visual: frame(tr, upTo(1, 4), { '1,2': 'current' }, 1),
          caption: tr(
            '물건1(2kg, 3점)만 있을 때: 가방이 2kg 이상이면 넣을 수 있으니 3점, 0~1kg 가방엔 안 들어가서 0점이에요.',
            'With only item 1 (2 kg, worth 3): any bag of 2 kg or more can hold it, so 3. Bags of 0 to 1 kg cannot, so 0.',
          ),
        },
        {
          visual: frame(tr, upTo(2, 3), { '2,3': 'current', '1,3': 'candidate', '1,2': 'candidate' }, 2),
          caption: tr(
            '물건2(1kg, 2점), 가방 3kg: 안 넣으면 바로 위 칸 3점. 넣으면 남은 2kg 칸(위 줄)의 3점 + 2점 = 5점. 5가 더 크니 5를 적어요.',
            'Item 2 (1 kg, worth 2), bag of 3 kg: skip it and you get the cell above, 3. Take it and you get the 2 kg cell above (3) + 2 = 5. 5 is bigger, so write 5.',
          ),
        },
        {
          visual: frame(tr, upTo(3, 4), { '3,4': 'current', '2,4': 'candidate', '2,1': 'candidate' }, 3),
          caption: tr(
            '물건3(3kg, 4점), 가방 4kg: 안 넣으면 위 칸 5점. 넣으면 남은 1kg 칸의 2점 + 4점 = 6점. 6이 더 커요!',
            'Item 3 (3 kg, worth 4), bag of 4 kg: skip it and get 5 from above. Take it and get the 1 kg cell (2) + 4 = 6. 6 wins!',
          ),
        },
        {
          visual: frame(tr, upTo(3, 4), { '3,4': 'path', '2,1': 'path' }),
          caption: tr(
            '답은 오른쪽 아래 6점이에요. 거꾸로 따라가면 값이 바뀐 줄의 물건(3과 2)을 넣었다는 걸 알 수 있어요. 1kg + 3kg = 4kg, 2점 + 4점 = 6점.',
            'The answer is the bottom-right 6. Walking back, the rows where the value changed tell us items 3 and 2 were packed: 1 kg + 3 kg = 4 kg, 2 + 4 = 6.',
          ),
        },
      ]}
      steps={[
        tr('이 방법을 동적 계획법이라고 해요. 작은 문제의 답을 표에 적어 두고, 큰 문제를 풀 때 다시 꺼내 쓰는 거예요.', 'This is called dynamic programming: write down the answers to small problems in a table and reuse them for bigger ones.'),
        tr('표의 첫 줄(물건 없음)은 모두 0으로 채워요.', 'Fill the first row (no items) with 0.'),
        tr('물건 하나씩, 가방 무게 0부터 K까지 칸을 채워요. 후보는 둘: 안 넣기(바로 위 칸), 넣기(위 줄에서 물건 무게만큼 왼쪽 칸 + 물건 점수).', 'For each item, fill the cells for bag sizes 0 to K. Two choices: skip it (the cell above), or take it (the cell above, the item\'s weight to the left, plus its score).'),
        tr('둘 중 큰 값을 적어요. 물건이 가방보다 무거우면 "안 넣기"만 가능해요.', 'Write the bigger one. If the item is heavier than the bag, only "skip" is possible.'),
        tr('오른쪽 아래 칸이 답이에요. 거꾸로 올라가며 값이 바뀐 줄을 찾으면 어떤 물건을 넣었는지 알 수 있어요.', 'The bottom-right cell is the answer. Walk back up; rows where the value changes are the items you packed.'),
      ]}
      useWhen={[
        tr('물건을 쪼갤 수 없고, 각각 한 번씩만 넣을 수 있을 때', 'Items cannot be split and each can be used once'),
        tr('제한(무게, 시간, 예산) 안에서 점수 합을 최대로 만들고 싶을 때', 'You want the largest total score within a limit (weight, time, budget)'),
        tr('제한값 K가 수만 이하 정도로 크지 않을 때', 'The limit K is modest, up to tens of thousands or so'),
      ]}
      watchOut={[
        tr('"가치/무게가 높은 것부터 넣기"는 틀릴 수 있어요. 위 예시에서도 그렇게 하면 6점이 안 나와요.', '"Take the best value per kg first" can fail. In the example above it does not reach 6.'),
        tr('1차원 배열로 줄일 때는 무게를 큰 쪽부터 거꾸로 채워야 같은 물건을 두 번 넣지 않아요.', 'When squeezing it into a 1-D array, fill from the largest weight down, or an item gets packed twice.'),
        tr('K가 수억처럼 크면 표가 너무 커져서 다른 방법이 필요해요.', 'If K is huge (hundreds of millions), the table gets too big and you need another method.'),
      ]}
      complexity={{
        time: 'O(NK)',
        space: 'O(NK)',
        plain: tr(
          '칸 하나마다 비교 한 번이라, 칸 수(물건 N × 용량 K)만큼 걸려요. 물건 100개, 용량 10만이면 칸이 1000만 개로 1초 안에 끝나요. 용량이 2배면 시간도 2배예요.',
          'Each cell is one comparison, so the work equals the number of cells (N items × K capacity). 100 items and capacity 100,000 means 10 million cells: under a second. Double the capacity and it takes twice as long.',
        ),
      }}
    >
      <InfoCode caption={tr('한 줄로 쓰면 (점화식)', 'In one line (the recurrence)')}>
        {tr(
          'dp[i][c] = max( dp[i-1][c],            # 안 넣기\n                 dp[i-1][c-w] + v )     # 넣기 (w ≤ c일 때)',
          'dp[i][c] = max( dp[i-1][c],            # skip\n                 dp[i-1][c-w] + v )     # take (if w ≤ c)',
        )}
      </InfoCode>
    </ConceptModal>
  );
}
