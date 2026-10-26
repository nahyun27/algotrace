import { Map as MapIcon, Compass, Sigma } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import type { VizState } from '../../components/viz/palette';
import { cn } from '../../components/ui';
import { toneBorder, toneText } from '../../components/ui/tone';
import { useTr } from '../../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const EDGES: MiniEdge[] = [['S', 'A', 2], ['S', 'B', 1], ['A', 'G', 2], ['B', 'D', 2]];

/** Five-node example. Notes show either "h=…" or "g+h=f". */
function frame(note: Record<string, string>, nodeState: Record<string, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = [
    { id: 'S', x: 70, y: 105, label: 'S', note: note.S },
    { id: 'A', x: 195, y: 40, label: 'A', note: note.A },
    { id: 'B', x: 170, y: 175, label: 'B', note: note.B },
    { id: 'D', x: 50, y: 195, label: 'D', note: note.D },
    { id: 'G', x: 315, y: 105, label: 'G', note: note.G },
  ];
  return <MiniGraph nodes={nodes} edges={EDGES} nodeState={nodeState} edgeState={edgeState} />;
}

const H = { S: 'h=4', A: 'h=2', B: 'h=4', D: 'h=6', G: 'h=0' };

export default function AStarInfoModal({ isOpen, onClose, onStartVisualization }: InfoModalProps) {
  const tr = useTr();

  const terms = [
    { key: 'g', desc: tr('출발점에서 여기까지 실제로 온 거리', 'The real distance travelled from the start to here') },
    { key: 'h', desc: tr('여기서 목표까지 남은 거리의 어림값 (휴리스틱)', 'A guess of the distance left to the goal (the heuristic)') },
    { key: 'f = g + h', desc: tr('"이 지점을 지나면 전체 길이가 대략 이 정도"라는 예상. 이 값이 작은 곳부터 봐요.', '"Going through here, the whole trip is about this long." Smallest f goes first.'), main: true },
  ];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={MapIcon}
      title={tr('A* (A-Star) 알고리즘', 'A* (A-star) search')}
      subtitle={tr('목표 방향을 어림하며 찾는 최단 경로', 'Shortest paths, steered toward the goal')}
      summary={tr(
        '"지금까지 온 거리 + 목표까지 남은 거리 어림값"이 가장 작은 곳부터 살펴보면, 엉뚱한 방향은 건너뛰고 목표로 곧장 가는 최단 경로를 찾아요.',
        'Always look next at the place where "distance so far + a guess of the distance left" is smallest. You skip the wrong directions and head straight to the goal along a shortest path.',
      )}
      analogy={{
        icon: Compass,
        title: tr('나침반을 든 산책', 'Walking with a compass'),
        body: tr(
          '친구 집이 동쪽에 있다는 걸 알면, 갈림길에서 동쪽으로 향하는 길부터 가 보죠. 서쪽 골목은 가깝더라도 나중으로 미뤄요. 다익스트라가 사방으로 고르게 퍼지는 물결이라면, A*는 목표 쪽으로 쭉 뻗는 손전등 빛이에요.',
          'If you know your friend lives to the east, at each fork you try the roads heading east first and leave the west alleys for later, even when they are close. Dijkstra is a ripple spreading evenly. A* is a flashlight beam aimed at the goal.',
        ),
      }}
      storyboard={[
        {
          visual: frame(H, {}),
          caption: tr(
            'S에서 G로 가요. 각 지점 아래 h는 G까지 남은 거리를 어림한 값이에요(예: 직선거리). 실제 남은 거리보다 크게만 어림하지 않으면 돼요.',
            'Go from S to G. The h under each place is a guess of the distance left to G (for example, the straight-line distance). It just must never be more than the real distance.',
          ),
        },
        {
          visual: frame({ ...H, S: '0+4=4' }, { S: 'current' }),
          caption: tr(
            'S는 지금까지 0만큼 왔고(g = 0), 남은 어림값이 4라서 f = 0 + 4 = 4예요.',
            'S has come 0 so far (g = 0) and its guess is 4, so f = 0 + 4 = 4.',
          ),
        },
        {
          visual: frame({ ...H, S: '0+4=4', A: '2+2=4', B: '1+4=5' }, { S: 'visited', A: 'candidate', B: 'candidate' }, { 'S-A': 'candidate', 'S-B': 'candidate' }),
          caption: tr(
            'S의 이웃을 계산해요. A는 2 + 2 = 4, B는 1 + 4 = 5예요.',
            'Score the neighbors of S. A is 2 + 2 = 4, B is 1 + 4 = 5.',
          ),
        },
        {
          visual: frame({ ...H, S: '0+4=4', A: '2+2=4', B: '1+4=5', G: '4+0=4' }, { S: 'visited', A: 'current', B: 'candidate', G: 'candidate' }, { 'S-A': 'visited', 'A-G': 'candidate' }),
          caption: tr(
            'S에서는 B(1)가 더 가깝지만, f가 더 작은 A(4)를 먼저 봐요. A를 거치면 G는 2 + 2 = 4만큼 와서 f = 4 + 0 = 4예요.',
            'B (1) is closer to S, but A has the smaller f (4), so A goes first. Through A, G is 2 + 2 = 4 away, so f = 4 + 0 = 4.',
          ),
        },
        {
          visual: frame({ ...H, S: '0+4=4', A: '2+2=4', B: '1+4=5', G: '4+0=4' }, { S: 'path', A: 'path', G: 'path', B: 'candidate' }, { 'S-A': 'path', 'A-G': 'path' }),
          caption: tr(
            'G의 f(4)가 B의 f(5)보다 작으니 G를 꺼내고 끝! 최단 경로는 S → A → G, 길이 4예요. B와 D는 끝까지 살펴볼 필요가 없었어요.',
            "G's f (4) beats B's (5), so G comes out and we are done. The shortest path is S → A → G, length 4. B and D never had to be explored.",
          ),
        },
      ]}
      steps={[
        tr('출발점을 g = 0으로 우선순위 큐(작은 값부터 꺼내 주는 대기열)에 넣어요.', 'Put the start in a priority queue (a waiting line that hands out the smallest value first) with g = 0.'),
        tr('큐에서 f = g + h가 가장 작은 지점을 꺼내요. 그게 목표면 끝이에요.', 'Take out the place with the smallest f = g + h. If it is the goal, you are done.'),
        tr('꺼낸 지점의 이웃마다 "여기를 거치면 g가 더 작아질까?"를 확인하고, 작아지면 g와 f를 고쳐 큐에 넣어요.', 'For each neighbor ask "is g smaller through here?" If so, update g and f and push it into the queue.'),
        tr('목표가 나올 때까지 2번과 3번을 반복해요.', 'Repeat steps 2 and 3 until the goal comes out.'),
      ]}
      useWhen={[
        tr('출발점과 도착점이 하나씩 정해져 있을 때 (지도 길찾기, 게임 캐릭터 이동)', 'There is one start and one goal (map directions, moving a game character)'),
        tr('목표까지 남은 거리를 잘 어림할 수 있을 때 (좌표가 있는 지도, 격자)', 'You can guess the distance left well (maps with coordinates, grids)'),
      ]}
      watchOut={[
        tr('h가 실제 남은 거리보다 크면(과대평가) 더 긴 길을 답으로 낼 수 있어요.', 'If h is ever more than the real distance left (an overestimate), you can get a longer path as the answer.'),
        tr('h를 전부 0으로 두면 다익스트라와 똑같아져요. 어림이 정확할수록 덜 헤매요.', 'With h = 0 everywhere it is exactly Dijkstra. The better the guess, the less it wanders.'),
        tr('모든 지점까지의 거리가 필요하면 A*보다 다익스트라가 맞아요.', 'If you need distances to every place, use Dijkstra instead.'),
      ]}
      complexity={{
        time: 'O((V+E) log V)',
        space: 'O(V)',
        plain: tr(
          '가장 나쁜 경우는 다익스트라와 같아요. 지점(V)과 길(E)이 2배면 시간은 2배보다 조금 더. 하지만 어림이 좋으면 목표와 상관없는 지점은 거의 안 봐서 보통 훨씬 빨라요.',
          'In the worst case it matches Dijkstra: double the places (V) and roads (E) and it takes a bit more than twice as long. With a good guess it barely touches places away from the goal, so it is usually much faster.',
        ),
      }}
    >
      <section>
        <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Sigma className="w-4 h-4" />
          </span>
          {tr('세 글자만 기억하세요', 'Three letters to remember')}
        </h3>
        <div className="flex flex-col gap-2">
          {terms.map(t => (
            <div
              key={t.key}
              className={cn('flex items-center gap-4 rounded-2xl border bg-card px-4 py-3', t.main ? toneBorder.path : 'border-border')}
            >
              <span className={cn('font-mono font-black shrink-0 w-24', t.main ? toneText.path : 'text-foreground')}>{t.key}</span>
              <span className="text-muted-foreground">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </ConceptModal>
  );
}
