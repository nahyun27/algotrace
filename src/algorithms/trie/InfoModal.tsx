import { ListTree, BookOpen } from 'lucide-react';
import ConceptModal from '../../components/algorithm/ConceptModal';
import TreeView, { type TreeNode } from '../../components/viz/TreeView';
import type { VizState } from '../../components/viz/palette';
import { useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

/** A tiny trie of the given prefixes; `ends` get a word label under the node. */
function frame(ids: string[], ends: string[], state: Record<string, VizState> = {}, edges: Record<string, VizState> = {}) {
  const make = (id: string): TreeNode => ({
    id,
    label: id === '' ? 'root' : '',
    sublabel: ends.includes(id) ? id : undefined,
    children: ids.filter(c => c.length === id.length + 1 && c.startsWith(id)).sort().map(make),
  });
  return (
    <TreeView
      root={make('')}
      radius={15}
      levelGap={20}
      className="h-full bg-transparent p-0 [&_svg]:max-h-[208px] sm:[&_svg]:max-h-[248px]"
      stateOf={id => state[String(id)] ?? (ends.includes(String(id)) ? 'visited' : 'idle')}
      edgeStateOf={(_p, c) => edges[String(c)] ?? 'idle'}
      edgeLabelOf={(_p, c) => String(c).slice(-1)}
    />
  );
}

const ALL = ['', 'c', 'ca', 'car', 'cat'];

export default function TrieInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  return (
    <ConceptModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={ListTree}
      title={tr('트라이', 'Trie')}
      subtitle={tr('글자로 길을 만드는 단어 나무', 'A tree of words, one letter per step')}
      summary={tr(
        '단어를 글자 하나씩 나무의 가지로 저장해 두면, 단어나 앞부분(접두사)을 글자 수만큼만 내려가서 찾을 수 있어요.',
        'Store each word as a path of letters in a tree, and you can find a word or its beginning (prefix) by walking down just as many steps as it has letters.',
      )}
      analogy={{
        icon: BookOpen,
        title: tr('사전의 색인 탭', 'The tabs of a dictionary'),
        body: tr(
          '사전에서 "cat"을 찾을 때 먼저 c 탭을 펴고, 그 안에서 ca, 그다음 cat으로 좁혀 가요. 같은 글자로 시작하는 단어는 같은 탭을 함께 써요. 트라이도 똑같이 첫 글자부터 한 글자씩 가지를 따라가요.',
          'To find "cat" in a dictionary, you open the c tab, then narrow to ca, then cat. Words that start the same share the same tabs. A trie works the same way: follow one branch per letter from the first letter on.',
        ),
      }}
      storyboard={[
        {
          visual: frame([''], [], { '': 'current' }),
          caption: tr('처음에는 뿌리(root) 하나만 있어요. 아직 아무 글자도 없어요.', 'At first there is only the root. No letters yet.'),
        },
        {
          visual: frame(['', 'c', 'ca', 'car'], ['car'], { car: 'candidate' }, { c: 'current', ca: 'current', car: 'current' }),
          caption: tr('"car"를 넣어요. c, a, r 가지가 없으니 하나씩 새로 만들고, 마지막 r 노드에 "여기서 단어 끝" 표시를 해요.', 'Insert "car". There is no c, a or r branch yet, so make each one. Then mark the last node: "a word ends here".'),
        },
        {
          visual: frame(ALL, ['car', 'cat'], { cat: 'candidate' }, { c: 'current', ca: 'current', cat: 'current' }),
          caption: tr('"cat"을 넣어요. c와 a 가지는 이미 있으니 그대로 따라가고, t 가지만 새로 만들어요.', 'Insert "cat". The c and a branches already exist, so just follow them. Only the t branch is new.'),
        },
        {
          visual: frame(ALL, ['car', 'cat'], { '': 'path', c: 'path', ca: 'path', cat: 'path' }, { c: 'path', ca: 'path', cat: 'path' }),
          caption: tr('단어 "cat" 찾기: c, a, t를 따라 내려가니 단어 끝 표시가 있어요. 있다(True)!', 'Search the word "cat": follow c, a, t and the node has a word-end mark. Found (True)!'),
        },
        {
          visual: frame(ALL, ['car', 'cat'], { '': 'path', c: 'path', ca: 'danger' }, { c: 'path', ca: 'path' }),
          caption: tr('단어 "ca" 찾기: 길은 있지만 a 노드에 단어 끝 표시가 없어요. 그래서 없다(False).', 'Search the word "ca": the path exists, but the a node has no word-end mark. So not found (False).'),
        },
        {
          visual: frame(ALL, ['car', 'cat'], { '': 'path', c: 'path', ca: 'path' }, { c: 'path', ca: 'path' }),
          caption: tr('접두사 "ca" 찾기는 길만 있으면 돼요. car와 cat이 ca로 시작하니 있다(True)!', 'Starts with "ca" only needs the path. car and cat both start with ca, so True!'),
        },
      ]}
      steps={[
        tr('뿌리(root) 노드 하나로 시작해요.', 'Start with a single root node.'),
        tr('단어를 넣을 때는 뿌리에서 글자마다 가지를 따라 내려가요. 가지가 없으면 새로 만들어요.', 'To insert a word, go down from the root one letter at a time. If a branch is missing, create it.'),
        tr('마지막 글자의 노드에 "단어 끝" 표시를 해요.', 'Put a "word ends here" mark on the node of the last letter.'),
        tr('찾을 때도 글자마다 가지를 따라가요. 중간에 가지가 없으면 바로 없다(False)예요.', 'To look up, follow one branch per letter. If a branch is missing, the answer is False right away.'),
        tr('끝까지 왔다면 단어 찾기는 "단어 끝" 표시를 확인하고, 접두사 찾기는 그대로 있다(True)예요.', 'If you reach the end, a word search checks the word-end mark. A prefix search is simply True.'),
      ]}
      useWhen={[
        tr('많은 단어 중에서 어떤 단어나 접두사가 있는지 여러 번 물어볼 때', 'You ask many times whether a word or prefix is in a big list'),
        tr('자동 완성처럼 같은 앞부분으로 시작하는 단어를 모아야 할 때', 'You need every word that starts the same way, like autocomplete'),
        tr('전화번호 목록처럼 한 단어가 다른 단어의 앞부분인지 확인할 때', 'You check whether one word is the start of another, like phone numbers'),
      ]}
      watchOut={[
        tr('길이 있다고 단어가 있는 건 아니에요. 단어 찾기는 꼭 "단어 끝" 표시를 확인해요.', 'A path is not a word. A word search must check the word-end mark.'),
        tr('노드마다 자식 칸을 들고 있어서 메모리를 많이 써요. 글자 종류가 많으면 더 그래요.', 'Every node stores its children, so it uses a lot of memory, more so with a big alphabet.'),
        tr('단어 하나만 한 번 찾는다면 그냥 집합(set)이 더 간단해요.', 'For a one-off lookup of whole words, a plain set is simpler.'),
      ]}
      complexity={{
        time: 'O(L)',
        space: 'O(total characters)',
        plain: tr(
          '넣기와 찾기 모두 단어 길이 L만큼만 걸려요. 저장된 단어가 10개든 10만 개든 "cat"은 세 걸음이에요. 메모리는 저장한 글자 수에 비례해요.',
          'Insert and lookup take only as many steps as the word has letters (L). Whether you stored 10 words or 100,000, "cat" takes three steps. Memory grows with the total number of stored letters.',
        ),
      }}
    />
  );
}
