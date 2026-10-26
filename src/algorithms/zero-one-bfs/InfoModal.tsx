import { BrickWall, Ticket, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import GridView, { type GridCellState } from '../../components/viz/GridView';
import { cn } from '../../components/ui';
import { toneSoft, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** 2×4 maze: S A # C / # # F G. Walls cost 1 to step into, empty cells cost 0. */
const NAMES = [['S', 'A', 'B', 'C'], ['D', 'E', 'F', 'G']];
const WALLS = new Set(['B', 'D', 'E']);

/** dist: known distances; state: per-cell color; deque: [name, d][] from front to back; pushed: names just pushed */
function frame(
  dist: Record<string, number>,
  state: Record<string, GridCellState>,
  deque: [string, number][],
  pushed: string[],
  front: string,
  back: string,
) {
  const at = (r: number, c: number) => NAMES[r][c];
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <GridView
        rows={2}
        cols={4}
        cellSize="lg"
        wallStyle="hatched"
        isWall={(r, c) => WALLS.has(at(r, c))}
        cellState={(r, c) => state[at(r, c)] ?? 'idle'}
        cellText={(r, c) => {
          const n = at(r, c);
          return (
            <span className="flex flex-col items-center leading-tight">
              <span className="text-xs font-black opacity-80">{n}</span>
              {dist[n] !== undefined && <span className="font-mono font-black text-base">{dist[n]}</span>}
            </span>
          );
        }}
      />
      <div className="flex items-stretch gap-1.5 max-w-full overflow-x-auto">
        <span className="shrink-0 flex items-center px-2 rounded-lg bg-muted text-[11px] font-extrabold text-muted-foreground">{front}</span>
        {deque.length === 0 ? (
          <span className="self-center px-2 text-xs text-muted-foreground">{'∅'}</span>
        ) : deque.map(([n, d], i) => (
          <span
            key={`${n}-${i}`}
            className={cn(
              'shrink-0 rounded-lg border px-2 py-1 font-mono text-xs font-bold',
              pushed.includes(n) ? cn(toneSoft.candidate, 'border-state-candidate/60 ring-2 ring-state-candidate/40') : 'bg-card border-border',
            )}
          >
            {n} · {d}
          </span>
        ))}
        <span className="shrink-0 flex items-center px-2 rounded-lg bg-muted text-[11px] font-extrabold text-muted-foreground">{back}</span>
      </div>
    </div>
  );
}

export default function ZeroOneBFSInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const front = tr('앞', 'front');
  const back = tr('뒤', 'back');
  const f = (dist: Record<string, number>, state: Record<string, GridCellState>, deque: [string, number][], pushed: string[]) =>
    frame(dist, state, deque, pushed, front, back);

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={BrickWall}
      title="0-1 BFS"
      subtitle={tr('길 비용이 0 아니면 1일 때의 최단 거리', 'Shortest paths when every step costs 0 or 1')}
      summary={tr(
        '비용 0인 칸은 줄 맨 앞에, 비용 1인 칸은 줄 맨 뒤에 세우는 양쪽이 열린 줄(덱) 하나로, 우선순위 큐 없이 최단 거리를 구해요.',
        'Put cells reached for free at the front of a line open at both ends (a deque), and cells that cost 1 at the back. That one line gives shortest distances without a priority queue.',
      )}
      analogy={{
        icon: Ticket,
        title: tr('놀이공원 줄 서기', 'Lining up at a theme park'),
        body: tr(
          '공짜로 갈 수 있는 곳(비용 0)은 지금 나와 똑같이 가까우니 줄 맨 앞에 바로 끼워 줘요. 한 번 더 애써야 갈 수 있는 곳(비용 1)은 줄 맨 뒤에 서요. 그러면 줄 앞에는 언제나 가장 가까운 곳이 서 있어요.',
          'A place you reach for free (cost 0) is exactly as close as you, so it may cut to the very front. A place that takes one more effort (cost 1) goes to the back. That way the front of the line is always the closest place.',
        ),
      }}
      storyboard={[
        {
          visual: f({ S: 0 }, { S: 'candidate' }, [['S', 0]], ['S']),
          caption: tr(
            'S에서 G까지 벽을 최소 몇 개 부숴야 할까요? 빈 칸으로 가면 비용 0, 빗금 친 벽을 부수고 가면 비용 1이에요. 덱에 S(0)만 넣고 시작해요.',
            'How few walls must we break to get from S to G? Stepping into an empty cell costs 0, breaking into a hatched wall costs 1. Start with just S (0) in the deque.',
          ),
        },
        {
          visual: f({ S: 0, A: 0, D: 1 }, { S: 'current', A: 'candidate', D: 'candidate' }, [['A', 0], ['D', 1]], ['A', 'D']),
          caption: tr(
            'S를 꺼내요. 오른쪽 A는 빈 칸이라 0 + 0 = 0, 덱 앞에 넣어요. 아래 D는 벽이라 0 + 1 = 1, 덱 뒤에 넣어요.',
            'Take out S. A to the right is empty: 0 + 0 = 0, so it goes to the front. D below is a wall: 0 + 1 = 1, so it goes to the back.',
          ),
        },
        {
          visual: f({ S: 0, A: 0, D: 1, B: 1, E: 1 }, { S: 'visited', A: 'current', D: 'candidate', B: 'candidate', E: 'candidate' }, [['D', 1], ['B', 1], ['E', 1]], ['B', 'E']),
          caption: tr(
            '앞에 있던 A를 꺼내요. 이웃 B와 E는 둘 다 벽이라 0 + 1 = 1, 덱 뒤에 넣어요. 이제 덱에는 거리 1짜리만 남았어요.',
            'A was at the front, so it comes out next. Its neighbors B and E are walls: 0 + 1 = 1, both to the back. Now only distance-1 cells are left.',
          ),
        },
        {
          visual: f({ S: 0, A: 0, D: 1, B: 1, E: 1, C: 1, F: 1 }, { S: 'visited', A: 'visited', D: 'visited', B: 'current', E: 'candidate', C: 'candidate', F: 'candidate' }, [['F', 1], ['C', 1], ['E', 1]], ['C', 'F']),
          caption: tr(
            'D를 꺼내도 더 짧아지는 곳은 없어요. 다음 B를 꺼내면 옆의 C와 F는 빈 칸이라 1 + 0 = 1, 덱 앞에 끼워 넣어요.',
            'Taking out D improves nothing. Next comes B: its neighbors C and F are empty, 1 + 0 = 1, so they cut to the front.',
          ),
        },
        {
          visual: f({ S: 0, A: 0, D: 1, B: 1, E: 1, C: 1, F: 1, G: 1 }, { S: 'path', A: 'path', B: 'path', F: 'path', G: 'path', D: 'visited', C: 'visited', E: 'visited' }, [], []),
          caption: tr(
            'F를 꺼내면 G도 빈 칸이라 1 + 0 = 1, 맨 앞으로! 바로 꺼내서 끝이에요. 답은 1: 보라색 길처럼 벽 B 하나만 부수면 돼요.',
            'Take out F: G is empty, 1 + 0 = 1, straight to the front, and it comes out right away. The answer is 1: break only wall B, along the violet route.',
          ),
        },
      ]}
      steps={[
        tr('출발 칸의 거리를 0으로 적고 덱에 넣어요. 나머지는 ∞예요.', 'Write 0 for the start and put it in the deque. Everything else is ∞.'),
        tr('덱 앞에서 하나를 꺼내요.', 'Take one cell out of the front.'),
        tr('이웃까지 비용(0 또는 1)을 더한 값이 지금 적힌 거리보다 작으면 고쳐 적어요.', 'For each neighbor, if (this distance + step cost 0 or 1) beats what is written, update it.'),
        tr('비용이 0이었으면 덱 앞에, 1이었으면 덱 뒤에 넣어요. 덱이 빌 때까지 2번부터 반복해요.', 'If the cost was 0, push it to the front. If 1, to the back. Repeat from step 2 until the deque is empty.'),
      ]}
      useWhen={[
        tr('움직임 비용이 0과 1 두 가지뿐일 때 (벽 부수기, 방향 바꾸기 횟수, 무료 순간이동)', 'Every move costs either 0 or 1 (breaking walls, counting turns, free teleports)'),
        tr('다익스트라로는 조금 느릴 만큼 칸이 많을 때 (큰 격자)', 'There are so many cells that Dijkstra feels slow (big grids)'),
      ]}
      watchOut={[
        tr('비용이 2 이상인 길이 하나라도 있으면 쓸 수 없어요. 다익스트라를 쓰세요.', 'If any move costs 2 or more, it breaks. Use Dijkstra.'),
        tr('같은 칸이 덱에 두 번 들어갈 수 있어요. 꺼냈을 때 이미 더 짧게 확정된 칸이면 건너뛰세요.', 'A cell can enter the deque twice. If it is already settled with a shorter distance when popped, skip it.'),
        tr('방문 표시를 넣을 때 하면 틀려요. 거리가 줄어들 때마다 다시 넣을 수 있어야 해요.', 'Do not mark cells as visited when pushing. A cell must be pushable again whenever its distance drops.'),
      ]}
      complexity={{
        time: 'O(V+E)',
        space: 'O(V)',
        plain: tr(
          '칸(V)과 칸 사이 이동(E)을 몇 번씩만 보니, 격자가 2배가 되면 시간도 딱 2배예요. 1000×1000 격자(100만 칸)도 금방 끝나요.',
          'Each cell (V) and move (E) is looked at only a few times, so a grid twice as big takes exactly twice as long. Even a 1000×1000 grid (a million cells) is quick.',
        ),
      }}
    >
      <section className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className={cn('flex items-center gap-2 font-bold mb-1', toneText.current)}>
            <ArrowLeftToLine className="w-4 h-4" />{tr('비용 0 → 덱 앞', 'Cost 0 → front')}
          </p>
          <p className="text-muted-foreground">
            {tr('지금 칸과 거리가 같으니 바로 다음에 꺼내야 해요.', 'Same distance as the current cell, so it must come out next.')}
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className={cn('flex items-center gap-2 font-bold mb-1', toneText.candidate)}>
            <ArrowRightToLine className="w-4 h-4" />{tr('비용 1 → 덱 뒤', 'Cost 1 → back')}
          </p>
          <p className="text-muted-foreground">
            {tr('거리가 1 늘었으니 뒤에서 기다려요. 덱 안의 거리는 늘 d와 d + 1 두 가지뿐이라 순서가 저절로 맞아요.', 'One step farther, so it waits at the back. The deque only ever holds two distances, d and d + 1, so the order stays right.')}
          </p>
        </div>
      </section>
    </ConceptModal>
  );
}
