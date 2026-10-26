import { ListOrdered, GraduationCap, Undo2 } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import Storyboard from '../../components/algorithm/Storyboard';
import MiniGraph, { type MiniEdge, type MiniNode } from '../../components/viz/MiniGraph';
import TokenRow, { GraphWithRow } from '../../components/viz/TokenRow';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** A → C, B → C, C → D, B → E: C has to wait for both A and B */
const EDGES: MiniEdge[] = [['A', 'C'], ['B', 'C'], ['C', 'D'], ['B', 'E']];
const POS: Record<string, [number, number]> = { A: [50, 40], B: [50, 170], C: [180, 95], D: [310, 95], E: [180, 200] };

function graph(notes: Record<string, string>, nodeState: Record<string, VizState>, edgeState: Record<string, VizState> = {}) {
  const nodes: MiniNode[] = Object.entries(POS).map(([id, [x, y]]) => ({ id, x, y, label: id, note: notes[id] }));
  return <MiniGraph nodes={nodes} edges={EDGES} directed nodeState={nodeState} edgeState={edgeState} height={245} />;
}

const ALL_PATH: Record<string, VizState> = { A: 'path', B: 'path', C: 'path', D: 'path', E: 'path' };
const ALL_PATH_EDGES: Record<string, VizState> = { 'A-C': 'path', 'B-C': 'path', 'C-D': 'path', 'B-E': 'path' };

export default function TopoInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();

  const row = (title: string, ids: string[], state: VizState = 'visited', before?: string) => (
    <TokenRow title={title} items={ids.map(id => ({ label: id, state }))} before={before} emptyText={tr('아직 없어요', 'nothing yet')} />
  );
  const result = (ids: string[], state: VizState = 'visited') => row(tr('결과', 'Result'), ids, state);
  const finished = (ids: string[]) => row(tr('끝난 순서', 'Finished'), ids);

  const kahnFrames = [
    {
      visual: <GraphWithRow graph={graph({ A: '0', B: '0', C: '2', D: '1', E: '1' }, { A: 'candidate', B: 'candidate' })} row={result([])} />,
      caption: tr(
        '노드 아래 숫자는 "나보다 먼저 끝나야 하는 일의 개수"(진입 차수)예요. 0인 A와 B는 지금 바로 할 수 있어요.',
        'The number under each node is how many tasks must finish before it (its in-degree). A and B are at 0, so they can start right away.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ C: '1', D: '1', E: '1' }, { A: 'current', B: 'candidate' }, { 'A-C': 'current' })} row={result(['A'])} />,
      caption: tr(
        'A를 결과에 적고 A에서 나가는 화살표(파란색)를 지워요. C의 숫자가 2 → 1이 돼요. B가 아직 안 끝나서 C는 더 기다려요.',
        'Write A in the result and cross out its outgoing arrow (blue). C drops from 2 to 1. B is not done yet, so C keeps waiting.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ C: '0', D: '1', E: '0' }, { A: 'visited', B: 'current', C: 'candidate', E: 'candidate' }, { 'A-C': 'visited', 'B-C': 'current', 'B-E': 'current' })} row={result(['A', 'B'])} />,
      caption: tr(
        'B를 적고 B의 화살표 두 개(파란색)를 지우면 C는 1 → 0, E도 1 → 0이 돼요. 이제 C와 E도 할 수 있어요.',
        'Write B and cross out its two arrows (blue): C goes 1 → 0 and E goes 1 → 0. Now C and E are ready too.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({ D: '0', E: '0' }, { A: 'visited', B: 'visited', C: 'current', D: 'candidate', E: 'candidate' }, { 'A-C': 'visited', 'B-C': 'visited', 'B-E': 'visited', 'C-D': 'current' })} row={result(['A', 'B', 'C'])} />,
      caption: tr(
        'C를 적고 C → D 화살표를 지우면 D도 1 → 0이 돼요.',
        'Write C and cross out C → D. D drops from 1 to 0.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({}, ALL_PATH, ALL_PATH_EDGES)} row={result(['A', 'B', 'C', 'E', 'D'], 'path')} />,
      caption: tr(
        '남은 E와 D까지 적으면 끝! A → B → C → E → D. 모든 화살표가 앞에서 뒤로 향하는 순서예요.',
        'Write the remaining E and D and we are done: A → B → C → E → D. Every arrow points from earlier to later.',
      ),
    },
  ];

  const dfsFrames = [
    {
      visual: <GraphWithRow graph={graph({}, { A: 'candidate', C: 'candidate', D: 'visited' }, { 'A-C': 'current', 'C-D': 'current' })} row={finished(['D'])} />,
      caption: tr(
        'A에서 화살표를 따라 끝까지 가요: A → C → D. D는 더 나갈 화살표가 없으니 가장 먼저 "끝남"이에요.',
        'From A, follow the arrows as far as they go: A → C → D. D has no way out, so it is the first to finish.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({}, { A: 'visited', C: 'visited', D: 'visited' }, { 'A-C': 'visited', 'C-D': 'visited' })} row={finished(['D', 'C', 'A'])} />,
      caption: tr(
        '되돌아오면서 C도 더 갈 곳이 없으니 끝, A도 끝이에요. 끝난 순서: D, C, A.',
        'Walking back, C has nowhere else to go, so it finishes, then A. Finished so far: D, C, A.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({}, { A: 'visited', C: 'visited', D: 'visited', B: 'visited', E: 'visited' }, { 'A-C': 'visited', 'C-D': 'visited', 'B-E': 'visited', 'B-C': 'current' })} row={finished(['D', 'C', 'A', 'E', 'B'])} />,
      caption: tr(
        '아직 안 간 B에서 다시 출발해요. C는 이미 끝났으니 건너뛰고 E로 가요. E가 끝나고, 마지막으로 B가 끝나요.',
        'Start again from B, which we have not visited. C is already finished, so skip it and go to E. E finishes, then B.',
      ),
    },
    {
      visual: <GraphWithRow graph={graph({}, ALL_PATH, ALL_PATH_EDGES)} row={row(tr('거꾸로', 'Reversed'), ['B', 'E', 'A', 'C', 'D'], 'path')} />,
      caption: tr(
        '끝난 순서를 거꾸로 읽으면 B → E → A → C → D. 칸 방식과 답이 달라도 둘 다 맞아요. 정답이 여러 개일 수 있어요.',
        'Read the finish order backwards: B → E → A → C → D. It differs from Kahn’s answer, yet both are correct. There can be many valid orders.',
      ),
    },
  ];

  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={ListOrdered}
      title={tr('위상 정렬', 'Topological sort')}
      subtitle={tr('"이걸 하려면 저게 먼저"를 지키는 순서 정하기', 'Ordering tasks so every "this needs that first" is respected')}
      summary={tr(
        '먼저 끝내야 할 일이 하나도 남지 않은 일부터 하나씩 꺼내 줄 세우면, 모든 순서 규칙을 지키는 순서가 나와요.',
        'Keep taking out a task that has nothing left to wait for, and the line you build respects every "do this first" rule.',
      )}
      analogy={{
        icon: GraduationCap,
        title: tr('선수 과목 지키며 수강 신청하기', 'Planning courses with prerequisites'),
        body: tr(
          '"자료구조"를 들으려면 "프로그래밍 기초"를 먼저 들어야 하는 것처럼, 과목마다 먼저 들어야 하는 과목이 있어요. 지금 들을 수 있는 과목(선수 과목을 다 들은 과목)부터 하나씩 듣다 보면 졸업까지의 순서가 완성돼요.',
          'Some courses need others first, like Data Structures needing Intro to Programming. Keep taking any course whose prerequisites are all done, and you end up with a valid order all the way to graduation.',
        ),
      }}
      storyboard={kahnFrames}
      steps={[
        tr('각 일마다 "먼저 끝나야 하는 일의 개수"(진입 차수: 나에게 들어오는 화살표 수)를 세요.', 'For each task, count how many tasks must come before it (its in-degree: the arrows coming in).'),
        tr('개수가 0인 일을 모두 큐(대기 줄)에 넣어요.', 'Put every task with count 0 into a queue (a waiting line).'),
        tr('큐에서 하나를 꺼내 결과에 적고, 거기서 나가는 화살표를 지워요. 그래서 0이 된 일은 큐에 넣어요.', 'Take one out, write it in the result and cross out its outgoing arrows. Any task that drops to 0 joins the queue.'),
        tr('큐가 빌 때까지 3번을 반복해요. 이 방식을 칸(Kahn) 알고리즘이라고 불러요.', "Repeat step 3 until the queue is empty. This method is called Kahn's algorithm."),
      ]}
      useWhen={[
        tr('선수 과목, 작업 일정처럼 "A가 끝나야 B를 할 수 있다"는 규칙이 여러 개 있을 때', 'There are many "B can only start after A" rules, like course prerequisites or project tasks'),
        tr('빌드 도구나 패키지 설치처럼 필요한 것부터 먼저 준비해야 할 때', 'Things must be prepared in dependency order, like build steps or package installs'),
      ]}
      watchOut={[
        tr('A → B → C → A처럼 화살표가 고리(사이클)를 이루면 서로를 기다리느라 순서가 존재하지 않아요.', 'If arrows form a loop (a cycle) like A → B → C → A, everyone waits on everyone and no order exists.'),
        tr('칸 방식에서는 결과에 적힌 일의 수가 전체보다 적으면 고리가 있다는 뜻이에요.', "In Kahn's method, if the result has fewer tasks than the total, there is a cycle."),
        tr('정답이 하나가 아닐 수 있어요. 큐에서 꺼내는 순서에 따라 결과가 달라져요.', 'There can be more than one correct answer. It depends on which ready task you take first.'),
      ]}
      complexity={{
        time: 'O(V + E)',
        space: 'O(V + E)',
        plain: tr(
          '일(V)과 화살표(E)를 각각 한 번씩만 처리해요. 일이 2배가 되면 시간도 2배 정도라서, 수십만 개도 금방 정렬돼요.',
          'Each task (V) and arrow (E) is handled once. Twice as many tasks take about twice as long, so even hundreds of thousands finish quickly.',
        ),
      }}
    >
      <section>
        <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight mb-3">
          <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Undo2 className="w-4 h-4" />
          </span>
          {tr('다른 방법: DFS로 거꾸로 쌓기', 'Another way: DFS, then reverse')}
        </h3>
        <p className="text-muted-foreground mb-3">
          {tr(
            '화살표를 따라 끝까지 들어갔다가, 더 갈 곳이 없어 "끝난" 순서대로 적어요. 그 순서를 거꾸로 뒤집으면 위상 정렬이 돼요. 가장 늦게 끝난 일은 앞에 기다릴 일이 하나도 없기 때문이에요.',
            'Follow the arrows as deep as you can and write each task down when it finishes (nowhere left to go). Reverse that list and you have a topological order, because the task that finishes last never has to wait for anything.',
          )}
        </p>
        <Storyboard frames={dfsFrames} />
      </section>
    </ConceptModal>
  );
}
