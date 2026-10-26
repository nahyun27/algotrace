import { Grid3x3, Navigation, Ruler } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import GridView, { type GridCellState } from '../../components/viz/GridView';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const ROWS = 3;
const COLS = 6;
const START = { r: 1, c: 0 };
const GOAL = { r: 1, c: 5 };
/** Manhattan distance to the goal */
const h = (r: number, c: number) => Math.abs(r - GOAL.r) + Math.abs(c - GOAL.c);
/** g along the straight middle row (no walls in this example) */
const g = (r: number, c: number) => Math.abs(r - START.r) + Math.abs(c - START.c);

type Mark = 'idle' | 'current' | 'candidate-soft' | 'visited-soft' | 'path';

/**
 * Frame of the 3×6 example. `marks` gives a state per "r,c"; touched cells show f = g + h,
 * untouched cells show h only when `showH` is set.
 */
function frame(marks: Record<string, Mark>, showH = false) {
  const state = (r: number, c: number): GridCellState => marks[`${r},${c}`] ?? 'idle';
  const text = (r: number, c: number) => {
    const s = marks[`${r},${c}`];
    if (s && s !== 'idle') return <span className="font-mono font-black text-sm">{g(r, c) + h(r, c)}</span>;
    return showH ? <span className="font-mono font-bold text-sm text-muted-foreground">{h(r, c)}</span> : null;
  };
  return (
    <GridView rows={ROWS} cols={COLS} cellSize="lg" cellState={state} cellText={text} start={START} goal={GOAL} markerStyle="badge" />
  );
}

const key = (r: number, c: number) => `${r},${c}`;
/** cells beside the middle row up to column `upTo` are waiting (amber) */
function sides(upTo: number): Record<string, Mark> {
  const m: Record<string, Mark> = {};
  for (let c = 0; c <= upTo; c++) { m[key(0, c)] = 'candidate-soft'; m[key(2, c)] = 'candidate-soft'; }
  return m;
}
function row(from: number, to: number, s: Mark): Record<string, Mark> {
  const m: Record<string, Mark> = {};
  for (let c = from; c <= to; c++) m[key(1, c)] = s;
  return m;
}

export default function GridAStarInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Grid3x3}
      title={tr('A* (격자 기반)', 'A* on a grid')}
      subtitle={tr('목표까지 남은 칸 수를 어림하며 찾는 최단 경로', 'Shortest paths on a grid, guided by "cells left to go"')}
      summary={tr(
        '각 칸마다 "지금까지 걸은 칸 수 + 목표까지 남은 칸 수 어림"을 더해 그 합이 가장 작은 칸부터 걸어 보면, 목표 쪽으로 곧장 가는 최단 경로를 찾아요.',
        'For each cell add "steps taken so far + a guess of steps left", and always walk from the cell with the smallest total. You head straight for the goal along a shortest path.',
      )}
      analogy={{
        icon: Navigation,
        title: tr('출구 표지판이 보이는 미로', 'A maze where you can see the exit sign'),
        body: tr(
          '미로 안에서도 출구가 어느 쪽인지 보인다면, 출구 쪽으로 난 통로부터 들어가 보죠. 막히면 그때 다른 통로를 봐요. 처음부터 모든 통로를 똑같이 돌아보는 것보다 훨씬 덜 헤매요.',
          'If you can see which way the exit is, you try the passages that lead that way first, and only look elsewhere when you hit a wall. You wander far less than checking every passage equally.',
        ),
      }}
      storyboard={[
        {
          visual: frame({}, true),
          caption: tr(
            'S에서 G로 가요. 칸에 적힌 수는 h, 벽을 무시하고 상하좌우로 G까지 몇 칸인지 센 값이에요(맨해튼 거리). S는 가로로 5칸이라 5예요.',
            'Go from S to G. Each number is h: how many up/down/left/right steps to G, ignoring walls (the Manhattan distance). S is 5 steps across, so 5.',
          ),
        },
        {
          visual: frame({ [key(1, 0)]: 'current', [key(0, 0)]: 'candidate-soft', [key(2, 0)]: 'candidate-soft', [key(1, 1)]: 'candidate-soft' }),
          caption: tr(
            '이제 칸의 수는 f = g + h예요. S 옆 세 칸은 모두 1칸 걸었어요(g = 1). 오른쪽 칸은 1 + 4 = 5, 위아래 칸은 1 + 6 = 7이에요.',
            'Now the numbers are f = g + h. The three cells next to S are 1 step away (g = 1). The right one is 1 + 4 = 5, the ones above and below are 1 + 6 = 7.',
          ),
        },
        {
          visual: frame({ ...sides(1), [key(1, 0)]: 'visited-soft', [key(1, 1)]: 'current', [key(1, 2)]: 'candidate-soft' }),
          caption: tr(
            'f가 가장 작은 5짜리 칸으로 가요. 그 오른쪽 칸은 2 + 3 = 5, 위아래는 2 + 5 = 7이에요. 또 오른쪽이 제일 작아요.',
            'Walk to the cell with the smallest f, 5. Its right neighbor is 2 + 3 = 5, above and below are 2 + 5 = 7. Right is smallest again.',
          ),
        },
        {
          visual: frame({ ...sides(4), ...row(0, 3, 'visited-soft'), [key(1, 4)]: 'current', [key(1, 5)]: 'candidate-soft' }),
          caption: tr(
            '같은 이유로 계속 오른쪽으로 가요. 가운데 줄은 f가 계속 5, 옆 칸들은 7이라 옆으로 샐 일이 없어요.',
            'For the same reason it keeps going right. The middle row stays at f = 5 while the side cells are 7, so it never drifts sideways.',
          ),
        },
        {
          visual: frame({ ...sides(4), ...row(0, 5, 'path') }),
          caption: tr(
            'G 도착! 보라색이 최단 경로(5칸)예요. 6칸만 꺼내 봤어요. 다익스트라였다면 S에서 4칸 이내인 13칸을 다 본 뒤에야 G에 닿아요.',
            'Reached G! Violet is the shortest path (5 steps). Only 6 cells were taken out. Dijkstra would first go through all 13 cells within 4 steps of S.',
          ),
        },
      ]}
      steps={[
        tr('모든 칸의 h(목표까지 남은 칸 수 어림)를 정해요. 격자에선 맨해튼 거리를 써요.', 'Give every cell an h (a guess of steps left). On a grid, use the Manhattan distance.'),
        tr('S를 g = 0으로 우선순위 큐(작은 값부터 꺼내 주는 대기열)에 넣어요.', 'Put S in a priority queue (a waiting line that hands out the smallest value first) with g = 0.'),
        tr('f = g + h가 가장 작은 칸을 꺼내 상하좌우 이웃의 g를 1 늘려 적고 큐에 넣어요. 벽은 건너뛰어요.', 'Take out the cell with the smallest f. Its up/down/left/right neighbors get g + 1 and go into the queue. Skip walls.'),
        tr('G를 꺼내면 끝이에요. 어디서 왔는지 거꾸로 따라가면 경로가 나와요.', 'When G comes out you are done. Follow where each cell came from, backwards, to get the path.'),
      ]}
      useWhen={[
        tr('미로나 게임 맵처럼 칸으로 된 지도에서 길을 찾을 때', 'Finding a way through a maze or a tile-based game map'),
        tr('출발 칸과 목표 칸이 하나씩 정해져 있을 때', 'There is exactly one start cell and one goal cell'),
      ]}
      watchOut={[
        tr('대각선 이동을 허용하면 맨해튼 거리는 너무 커져요. 그땐 체비쇼프나 옥타일 거리를 써요.', 'If diagonal moves are allowed, Manhattan distance overestimates. Use Chebyshev or octile distance instead.'),
        tr('벽이 많으면 어림이 빗나가서 탐색하는 칸이 늘어나요. 그래도 답은 정확해요.', 'With many walls the guess is off and more cells get explored, but the answer is still correct.'),
        tr('f가 같은 칸이 여럿이면 고르는 순서에 따라 탐색한 칸 수가 달라질 수 있어요.', 'When several cells tie on f, the order you pick them changes how many cells get explored.'),
      ]}
      complexity={{
        time: 'O((V+E) log V)',
        space: 'O(V)',
        plain: tr(
          '격자에서 V는 칸 수, E는 칸 사이 통로 수예요. 가장 나쁜 경우엔 다익스트라처럼 모든 칸을 보지만, 보통은 목표 쪽 칸 위주로만 봐서 100×100 격자도 순식간이에요.',
          'On a grid V is the number of cells and E the moves between them. At worst it visits every cell like Dijkstra, but usually it stays near the goal direction, so a 100×100 grid is instant.',
        ),
      }}
    >
      <section>
        <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Ruler className="w-4 h-4" />
          </span>
          {tr('맨해튼 거리 계산법', 'Computing the Manhattan distance')}
        </h3>
        <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
          <code className="block font-mono font-bold text-center">h = |r − goal.r| + |c − goal.c|</code>
          <p className="text-muted-foreground">
            {tr(
              '세로로 몇 칸, 가로로 몇 칸인지 더한 값이에요. 바둑판 같은 도시에서 건물을 뚫지 않고 걷는 거리와 같아요. 벽이 있으면 실제로는 더 걸어야 하니 절대 실제보다 크지 않아요. 그래서 A*가 최단 경로를 보장해요.',
              'Rows apart plus columns apart: the walking distance in a city laid out like a chessboard. Walls only make the real walk longer, so it is never more than the real distance. That is why A* still guarantees a shortest path.',
            )}
          </p>
        </div>
      </section>
    </ConceptModal>
  );
}
