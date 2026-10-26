import { Network, Waves, Route } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import TokenRow, { GraphWithRow, type Token } from '../../components/viz/TokenRow';
import type { VizState } from '../../components/viz/palette';
import { toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'BFS' | 'DFS';
  onStartVisualization?: () => void;
}

/** The same five-node tree for both modes, so the two visit orders are easy to compare */
const EDGES: MiniEdge[] = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E']];
const POS: Record<string, [number, number]> = { A: [180, 30], B: [115, 100], C: [245, 100], D: [55, 180], E: [305, 180] };

function graph(order: Record<string, string>, nodeState: Record<string, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = Object.entries(POS).map(([id, [x, y]]) => ({ id, x, y, label: id, note: order[id] }));
  return <MiniGraph nodes={nodes} edges={EDGES} nodeState={nodeState} edgeState={edgeState} height={215} />;
}

const chips = (ids: string[]): Token[] => ids.map(id => ({ label: id, state: 'candidate' }));

export default function BFSDFSInfoModal({ isOpen, onClose, mode, onStartVisualization }: InfoModalProps) {
  const tr = useTr();
  const isBFS = mode === 'BFS';

  const queue = (ids: string[]) => (
    <TokenRow title={tr('큐', 'Queue')} items={chips(ids)} before={tr('먼저 나감 ←', 'out first ←')} emptyText={tr('비었어요', 'empty')} />
  );
  // The top of the stack is drawn on the right, so the chip that comes out next is the last one
  const stack = (ids: string[]) => (
    <TokenRow title={tr('스택', 'Stack')} items={chips(ids)} after={tr('← 맨 위', '← top')} emptyText={tr('비었어요', 'empty')} />
  );

  const bfsFrames = [
    {
      visual: <GraphWithRow graph={graph({}, { A: 'current' })} row={queue(['A'])} />,
      caption: tr(
        '출발점 A를 큐(먼저 줄 선 사람이 먼저 나가는 줄)에 세워요.',
        'Put the start A into the queue (a line where whoever joined first leaves first).',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1' }, { A: 'visited', B: 'candidate', C: 'candidate' }, { 'A-B': 'candidate', 'A-C': 'candidate' })} row={queue(['B', 'C'])} />,
      caption: tr(
        '줄 맨 앞의 A를 꺼내 방문(1번째)해요. A의 이웃 B와 C를 줄 뒤에 세워요.',
        'Take A from the front and visit it (1st). Its neighbors B and C join the back of the line.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2' }, { A: 'visited', B: 'current', C: 'candidate', D: 'candidate' }, { 'A-B': 'visited', 'B-D': 'candidate' })} row={queue(['C', 'D'])} />,
      caption: tr(
        '맨 앞의 B를 꺼내 방문해요. B의 이웃 D는 줄 맨 뒤에 서요. 그래서 C가 D보다 먼저 나와요.',
        'Take B from the front and visit it. Its neighbor D joins the back, so C comes out before D.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2', C: '3' }, { A: 'visited', B: 'visited', C: 'current', D: 'candidate', E: 'candidate' }, { 'A-B': 'visited', 'A-C': 'visited', 'C-E': 'candidate' })} row={queue(['D', 'E'])} />,
      caption: tr(
        'C를 꺼내 방문하고 이웃 E를 줄 뒤에 세워요. A에서 한 걸음 거리인 B, C를 모두 끝냈어요.',
        'Visit C and put its neighbor E at the back. Everything one step from A (B and C) is now done.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2', C: '3', D: '4', E: '5' }, { A: 'path', B: 'path', C: 'path', D: 'path', E: 'path' }, { 'A-B': 'path', 'A-C': 'path', 'B-D': 'path', 'C-E': 'path' })} row={queue([])} />,
      caption: tr(
        '두 걸음 거리인 D, E까지 꺼내면 큐가 비어서 끝! 방문 순서는 A → B → C → D → E. 가까운 층부터 차례로 퍼졌어요.',
        'Take D and E (two steps away), the queue is empty, done. Visit order: A → B → C → D → E, spreading out one layer at a time.',
      ),
    },
  ];

  const dfsFrames = [
    {
      visual: <GraphWithRow graph={graph({}, { A: 'current' })} row={stack(['A'])} />,
      caption: tr(
        '출발점 A를 스택(접시 더미처럼 마지막에 올린 것을 먼저 꺼내는 통)에 올려요.',
        'Put the start A on the stack (like a pile of plates: the last one you put on comes off first).',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1' }, { A: 'visited', B: 'candidate', C: 'candidate' }, { 'A-B': 'candidate', 'A-C': 'candidate' })} row={stack(['C', 'B'])} />,
      caption: tr(
        'A를 꺼내 방문(1번째)하고 이웃 C, B를 올려요. B가 맨 위에 있어서 다음에 나와요.',
        'Take A off and visit it (1st), then pile up its neighbors C and B. B is on top, so it comes next.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2' }, { A: 'visited', B: 'current', C: 'candidate', D: 'candidate' }, { 'A-B': 'visited', 'B-D': 'candidate' })} row={stack(['C', 'D'])} />,
      caption: tr(
        '맨 위의 B를 꺼내 방문하고, B의 이웃 D를 맨 위에 올려요. C보다 D가 먼저예요. 한 갈래를 끝까지 파고들어요.',
        'Take B off the top and visit it, then put its neighbor D on top. D comes before C: we dig down one branch first.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2', D: '3' }, { A: 'visited', B: 'visited', D: 'current', C: 'candidate' }, { 'A-B': 'visited', 'B-D': 'visited' })} row={stack(['C'])} />,
      caption: tr(
        'D를 방문했는데 더 갈 곳이 없어요(막다른 길). 스택에 남아 있던 C로 되돌아가요.',
        'Visit D. There is nowhere further to go (a dead end), so we go back to C, still waiting on the stack.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2', D: '3', C: '4' }, { A: 'visited', B: 'visited', D: 'visited', C: 'current', E: 'candidate' }, { 'A-B': 'visited', 'B-D': 'visited', 'A-C': 'visited', 'C-E': 'candidate' })} row={stack(['E'])} />,
      caption: tr(
        'C를 꺼내 방문하고 이웃 E를 올려요.',
        'Take C off, visit it and put its neighbor E on top.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ A: '1', B: '2', D: '3', C: '4', E: '5' }, { A: 'path', B: 'path', C: 'path', D: 'path', E: 'path' }, { 'A-B': 'path', 'A-C': 'path', 'B-D': 'path', 'C-E': 'path' })} row={stack([])} />,
      caption: tr(
        'E까지 방문하면 스택이 비어서 끝! 방문 순서는 A → B → D → C → E. BFS(A → B → C → D → E)와 순서가 달라요.',
        'Visit E and the stack is empty, done. Visit order: A → B → D → C → E, different from BFS (A → B → C → D → E).',
      ),
    },
  ];

  const rows: [string, string, string][] = [
    [tr('도구', 'Tool'), tr('큐 (먼저 온 것 먼저)', 'Queue (first in, first out)'), tr('스택 또는 재귀 (마지막 것 먼저)', 'Stack or recursion (last in, first out)')],
    [tr('퍼지는 모양', 'Shape'), tr('물결처럼 가까운 곳부터', 'Ripples, nearest first'), tr('한 갈래를 끝까지, 막히면 되돌아옴', 'One branch to the end, then back up')],
    [tr('잘하는 일', 'Good at'), tr('가장 적은 걸음 수 구하기', 'Fewest steps to a place'), tr('모든 경우 따져 보기, 고리 찾기', 'Trying every option, finding cycles')],
  ];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={Network}
      title={isBFS ? tr('너비 우선 탐색 (BFS)', 'Breadth-first search (BFS)') : tr('깊이 우선 탐색 (DFS)', 'Depth-first search (DFS)')}
      subtitle={isBFS
        ? tr('가까운 곳부터 한 겹씩 넓게 둘러보기', 'Look around nearby first, one layer at a time')
        : tr('한 길을 끝까지 가 보고, 막히면 되돌아오기', 'Follow one path to the end, then back up')}
      summary={isBFS
        ? tr(
          '출발점에서 한 걸음 거리인 곳을 모두 보고, 그다음 두 걸음 거리인 곳을 보는 식으로 가까운 곳부터 넓게 퍼져 나가요.',
          'Visit everything one step from the start, then everything two steps away, and so on, spreading out from nearest to farthest.',
        )
        : tr(
          '갈 수 있는 길 하나를 골라 끝까지 깊이 들어가 보고, 막다른 길이면 바로 전 갈림길로 돌아와 다른 길을 가요.',
          'Pick one path and go as deep as you can. At a dead end, step back to the last fork and try another path.',
        )}
      analogy={isBFS
        ? {
          icon: Waves,
          title: tr('호수에 퍼지는 물결', 'Ripples on a pond'),
          body: tr(
            '잔잔한 호수에 돌을 던지면 물결이 가까운 곳부터 동그랗게 한 겹씩 퍼져요. BFS도 출발점에서 한 걸음, 두 걸음 거리 순서로 퍼져 나가요. 그래서 어떤 곳에 처음 닿았을 때의 걸음 수가 곧 가장 적은 걸음 수예요.',
            'Drop a stone in a still pond and the ripples spread in rings, nearest first. BFS spreads the same way: one step away, then two steps away. So the first time it reaches a place, that is the fewest steps to get there.',
          ),
        }
        : {
          icon: Route,
          title: tr('미로 탐험', 'Exploring a maze'),
          body: tr(
            '미로에서 갈림길이 나오면 한쪽을 골라 막힐 때까지 쭉 가요. 막히면 바로 전 갈림길로 돌아와 아직 안 가 본 길로 가요. DFS는 이렇게 "끝까지 가 보고, 안 되면 되돌아오기"를 반복해요.',
            'In a maze, at each fork you pick one way and keep going until you hit a wall. Then you walk back to the last fork and take a way you have not tried. DFS repeats exactly that: go all the way, and back up when stuck.',
          ),
        }}
      storyboard={isBFS ? bfsFrames : dfsFrames}
      steps={isBFS
        ? [
          tr('출발점을 큐에 넣고 "방문함" 표시를 해요.', 'Put the start in the queue and mark it as visited.'),
          tr('큐 맨 앞의 노드를 꺼내요.', 'Take the node at the front of the queue.'),
          tr('그 노드의 이웃 중 아직 방문 표시가 없는 것만 표시하고 큐 뒤에 넣어요.', 'Mark each of its neighbors that is not marked yet, and add it to the back of the queue.'),
          tr('큐가 빌 때까지 2번과 3번을 반복해요.', 'Repeat steps 2 and 3 until the queue is empty.'),
        ]
        : [
          tr('출발점을 스택에 올려요.', 'Put the start on the stack.'),
          tr('스택 맨 위의 노드를 꺼내요. 이미 방문했다면 그냥 넘어가요.', 'Take the node off the top. If it was already visited, skip it.'),
          tr('방문 표시를 하고, 아직 방문 안 한 이웃들을 스택에 올려요.', 'Mark it visited and put its unvisited neighbors on the stack.'),
          tr('스택이 빌 때까지 2번과 3번을 반복해요. 재귀 함수(자기 자신을 다시 부르는 함수)로 써도 똑같이 동작해요.', 'Repeat steps 2 and 3 until the stack is empty. A recursive function (one that calls itself) works the same way.'),
        ]}
      useWhen={isBFS
        ? [
          tr('미로나 지도에서 "최소 몇 번 만에 갈 수 있나"를 물을 때 (모든 길의 비용이 같을 때)', 'You need the fewest moves in a maze or map where every move costs the same'),
          tr('출발점에서 가까운 것부터 차례로 처리해야 할 때', 'Things must be handled in order of distance from the start'),
        ]
        : [
          tr('가능한 모든 경우를 하나씩 끝까지 따져 봐야 할 때 (백트래킹: 해 보고 아니면 되돌리기)', 'You must try every possibility to the end (backtracking: try, and undo if it fails)'),
          tr('연결된 덩어리 세기, 고리(사이클) 찾기처럼 "닿을 수 있나"만 알면 될 때', 'You only need to know what is reachable: counting connected groups, finding cycles'),
        ]}
      watchOut={isBFS
        ? [
          tr('방문 표시는 큐에 넣을 때 해야 해요. 꺼낼 때 하면 같은 노드가 여러 번 들어가요.', 'Mark a node when you put it in the queue. Marking it when you take it out lets it get in several times.'),
          tr('길마다 비용이 다르면 BFS의 걸음 수는 최단 거리가 아니에요. 그럴 땐 다익스트라를 써요.', 'If roads have different costs, the step count is not the shortest distance. Use Dijkstra then.'),
        ]
        : [
          tr('DFS가 처음 찾은 길은 가장 짧은 길이 아닐 수 있어요.', 'The first path DFS finds may not be the shortest one.'),
          tr('방문 표시를 빼먹으면 고리를 따라 영원히 빙빙 돌아요.', 'Forget the visited mark and it loops around a cycle forever.'),
          tr('재귀로 아주 깊이 들어가면(노드 수십만 개) 스택이 넘칠 수 있어요.', 'Very deep recursion (hundreds of thousands of nodes) can overflow the call stack.'),
        ]}
      complexity={{
        time: 'O(V + E)',
        space: 'O(V)',
        plain: tr(
          '모든 노드(V)와 간선(E)을 딱 한 번씩만 봐요. 그래프가 2배로 커지면 시간도 2배 정도라서, 노드가 100만 개여도 금방 끝나요.',
          'Every node (V) and edge (E) is looked at once. Double the graph and it takes about twice as long, so even a million nodes finish quickly.',
        ),
      }}
    >
      <section>
        <h3 className="text-lg font-extrabold tracking-tight mb-3">{tr('BFS와 DFS 한눈에 비교', 'BFS and DFS side by side')}</h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="py-2 px-3 font-semibold text-muted-foreground" />
                <th className={`py-2 px-3 font-bold ${toneText.current}`}>BFS</th>
                <th className={`py-2 px-3 font-bold ${toneText.visited}`}>DFS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(([feat, bfs, dfs]) => (
                <tr key={feat}>
                  <td className="py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">{feat}</td>
                  <td className="py-2.5 px-3">{bfs}</td>
                  <td className="py-2.5 px-3">{dfs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ConceptModal>
  );
}
