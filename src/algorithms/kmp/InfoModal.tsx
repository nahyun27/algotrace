import { TextSearch, BookOpenCheck } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import { NODE_COLORS, type VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

const TEXT = 'ABABABC';
const PATTERN = 'ABABC';
const PI = [0, 0, 1, 2, 0];

function Box({ c, state }: { c: string; state: VizState }) {
  const col = NODE_COLORS[state];
  return (
    <div
      className="w-9 h-10 sm:w-11 sm:h-12 shrink-0 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-base"
      style={{ backgroundColor: col.fill, borderColor: col.stroke, color: col.text }}
    >
      {c}
    </div>
  );
}

/** Text on top, pattern below it shifted by `shift` cells. States are per text index and per pattern index. */
function Rows({ shift, text = {}, pat = {} }: { shift: number; text?: Record<number, VizState>; pat?: Record<number, VizState> }) {
  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex gap-1">
        {Array.from(TEXT, (c, k) => <Box key={k} c={c} state={text[k] ?? 'idle'} />)}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: shift }, (_, k) => <div key={`s${k}`} className="w-9 sm:w-11 shrink-0" />)}
        {Array.from(PATTERN, (c, k) => <Box key={k} c={c} state={pat[k] ?? 'idle'} />)}
      </div>
    </div>
  );
}

/** The pattern with its pi value under every letter. */
function PiRow() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex gap-1">
        {Array.from(PATTERN, (c, k) => <Box key={k} c={c} state={k === 3 ? 'current' : k === 0 || k === 1 ? 'visited' : 'idle'} />)}
      </div>
      <div className="flex gap-1">
        {PI.map((v, k) => (
          <div key={k} className="w-9 sm:w-11 text-center font-mono font-bold text-base text-muted-foreground">{v}</div>
        ))}
      </div>
    </div>
  );
}

const range = (from: number, to: number, s: VizState) =>
  Object.fromEntries(Array.from({ length: to - from }, (_, k) => [from + k, s])) as Record<number, VizState>;

export default function KMPInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={TextSearch}
      title={tr('KMP 문자열 검색', 'KMP string search')}
      subtitle={tr('긴 글에서 단어를 빠르게 찾기', 'Finding a word in a long text, fast')}
      summary={tr(
        '틀린 글자가 나와도 이미 맞춘 글자는 다시 보지 않고, 미리 만든 표를 보고 패턴을 한 번에 알맞은 만큼 밀어요.',
        'When a letter does not match, never re-read the letters you already matched. A small table you made beforehand tells you how far to slide the pattern.',
      )}
      analogy={{
        icon: BookOpenCheck,
        title: tr('외운 노래 가사 맞추기', 'Singing along to a song you know'),
        body: tr(
          '"도레미도레미파"를 따라 부르다가 틀렸다고 해 볼게요. 처음부터 다시 부를 필요는 없어요. 방금 부른 끝부분 "도레미"가 노래의 첫부분과 같다는 걸 알고 있으니, 거기서부터 이어 부르면 돼요. KMP의 표가 바로 이 "끝부분이 첫부분과 얼마나 겹치나"를 적어 둔 거예요.',
          'Say you are singing "do re mi do re mi fa" and slip up. You do not restart the song. You know the last bit you sang, "do re mi", is also how the song begins, so you carry on from there. The KMP table writes down exactly that: how much each ending overlaps the beginning.',
        ),
      }}
      storyboard={[
        {
          visual: <PiRow />,
          caption: tr(
            '먼저 패턴만 보고 표(pi)를 만들어요. "ABAB"는 끝의 "AB"가 처음의 "AB"와 같아서 2를 적어요.',
            'First, build a table (pi) from the pattern alone. In "ABAB" the ending "AB" equals the beginning "AB", so we write 2.',
          ),
        },
        {
          visual: <Rows shift={0} text={range(0, 4, 'visited')} pat={range(0, 4, 'visited')} />,
          caption: tr('글의 처음부터 비교해요. A, B, A, B 네 글자가 맞았어요.', 'Compare from the start of the text. A, B, A, B: four letters match.'),
        },
        {
          visual: <Rows shift={0} text={{ ...range(0, 4, 'visited'), 4: 'danger' }} pat={{ ...range(0, 4, 'visited'), 4: 'danger' }} />,
          caption: tr('다섯 번째에서 A와 C가 달라요. 처음부터 다시 비교할까요? 아니에요!', 'At the fifth letter, A and C differ. Start over from scratch? No!'),
        },
        {
          visual: <Rows shift={2} text={{ ...range(2, 4, 'visited'), 4: 'candidate' }} pat={{ ...range(0, 2, 'visited'), 2: 'candidate' }} />,
          caption: tr(
            '표에 따르면 맞춘 "ABAB"의 끝 2글자가 패턴의 처음과 같아요. 그래서 패턴을 2칸 밀고, 그 2글자는 확인 없이 맞은 걸로 쳐요.',
            'The table says the last 2 letters of "ABAB" equal the start of the pattern. So slide the pattern 2 cells and count those 2 letters as already matched.',
          ),
        },
        {
          visual: <Rows shift={2} text={range(2, 7, 'path')} pat={range(0, 5, 'path')} />,
          caption: tr('멈췄던 자리부터 이어서 A, B, C가 맞았어요. 위치 2에서 찾았어요! 글을 한 번만 훑었어요.', 'Carry on from where we stopped: A, B, C match. Found at position 2! We read the text only once.'),
        },
      ]}
      steps={[
        tr('패턴만 보고 표(pi)를 만들어요. pi[k]는 "패턴 앞 k+1글자에서 처음과 끝이 겹치는 가장 긴 길이"예요.', 'Build the table (pi) from the pattern. pi[k] is the longest overlap between the beginning and the end of the first k+1 letters.'),
        tr('글을 왼쪽부터 한 글자씩 읽으며 패턴과 비교해요. 맞으면 맞은 개수 j를 1 늘려요.', 'Read the text left to right and compare with the pattern. On a match, the matched count j goes up by 1.'),
        tr('틀리면 j를 pi[j-1]로 줄여요. 패턴만 오른쪽으로 밀리고, 글에서 읽는 위치는 뒤로 가지 않아요.', 'On a mismatch, shrink j to pi[j-1]. Only the pattern slides right. Your place in the text never moves back.'),
        tr('j가 패턴 길이가 되면 찾은 거예요. 위치를 적고 j를 pi[j-1]로 줄여 다음 것도 찾아요.', 'When j reaches the pattern length, you found it. Write down the position, set j to pi[j-1] and keep looking.'),
      ]}
      useWhen={[
        tr('긴 글에서 한 패턴이 나오는 모든 위치를 찾을 때', 'You need every place a pattern appears in a long text'),
        tr('"AAAA…B"처럼 비슷한 글자가 반복돼서 단순 비교가 느려질 때', 'The text repeats similar letters, like "AAAA…B", and the simple way gets slow'),
        tr('문자열이 어떤 조각의 반복인지 알아낼 때 (pi 표만 써도 돼요)', 'You want to know if a string is one piece repeated (the pi table alone does it)'),
      ]}
      watchOut={[
        tr('찾은 뒤에도 j를 pi[j-1]로 줄여야 겹치는 다음 매칭을 놓치지 않아요.', 'After a match, set j to pi[j-1], or you will miss overlapping matches.'),
        tr('pi 표는 패턴만으로 만들어요. 글은 필요 없어요.', 'The pi table depends only on the pattern, not on the text.'),
        tr('0부터 세는지 1부터 세는지 문제의 출력 형식을 꼭 확인해요.', 'Check whether the problem counts positions from 0 or from 1.'),
      ]}
      complexity={{
        time: 'O(n + m)',
        space: 'O(m)',
        plain: tr(
          '글(n글자)과 패턴(m글자)을 각각 한 번씩만 훑어요. 글이 2배 길어지면 시간도 2배 정도예요. 메모리는 패턴 길이만큼의 표 하나면 돼요.',
          'It reads the text (n letters) and the pattern (m letters) about once each. Twice the text means about twice the time. Memory is one table as long as the pattern.',
        ),
      }}
    />
  );
}
