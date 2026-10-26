import { makeTr, type Lang } from '../../i18n';
import { DEFAULT_TREE, logOf, type LCAStep, type TreeInput } from './types';

/**
 * Code line codes (see CodeViewer):
 * 1 INIT, 2 DFS_VISIT, 3 TABLE_FILL, 4 QUERY, 5 LIFT, 6 FOUND right after lifting (u == v),
 * 7 JUMP_BOTH, 8 SKIP_JUMP, 9 FOUND (parent of u), DONE reuses the FOUND line.
 */

/** Adjacency lists in edge input order, both directions (the order the DFS pushes children). */
export function buildAdjacency(tree: TreeInput): number[][] {
  const graph: number[][] = Array.from({ length: tree.n + 1 }, () => []);
  for (const [a, b] of tree.edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  return graph;
}

/**
 * Binary lifting LCA, step by step: an iterative DFS for depth and parent, the up[k][v] table,
 * then one query (u, v): lift the deeper node by the depth difference, then jump both while their ancestors differ.
 */
export function generateLCASteps(
  tree: TreeInput = DEFAULT_TREE,
  qu = 15,
  qv = 6,
  lang: Lang = 'ko',
): LCAStep[] {
  const tr = makeTr(lang);
  const { n } = tree;
  const LOG = logOf(n);
  const graph = buildAdjacency(tree);
  const depth: (number | null)[] = Array(n + 1).fill(null);
  const up: (number | null)[][] = Array.from({ length: LOG }, () => Array(n + 1).fill(null));
  const steps: LCAStep[] = [];

  const base = {
    dfsNode: null, fillCell: null, deps: [], u: null, v: null, candidates: [], trail: [], k: null, diff: null, lca: null,
  } satisfies Partial<LCAStep>;
  const push = (s: Partial<LCAStep> & Pick<LCAStep, 'type' | 'description' | 'codeLine'>) =>
    steps.push({ ...base, ...s, depth: [...depth], up: up.map(r => [...r]) });

  push({
    type: 'INIT',
    codeLine: 1,
    description: tr(
      `노드 ${n}개 트리를 루트 1에서 시작해 DFS로 훑어요. 스택에 (1, 부모 1, 깊이 0)을 넣습니다. 루트의 부모는 자기 자신으로 둬요. 표는 k = 0..${LOG - 1}행이에요 (2^${LOG} ≥ ${n}).`,
      `Walk the ${n}-node tree with a DFS from root 1. Push (1, parent 1, depth 0): the root's parent is the root itself. The table has rows k = 0..${LOG - 1} (2^${LOG} ≥ ${n}).`,
    ),
  });

  // Phase 1: iterative DFS, (node, parent, depth) on a stack
  const stack: [number, number, number][] = [[1, 1, 0]];
  while (stack.length) {
    const [node, p, d] = stack.pop()!;
    depth[node] = d;
    up[0][node] = p;
    const kids = graph[node].filter(w => w !== p);
    for (const w of kids) stack.push([w, node, d + 1]);
    const kidsText = kids.length ? kids.join(', ') : null;
    push({
      type: 'DFS_VISIT',
      codeLine: 2,
      dfsNode: node,
      fillCell: [0, node],
      candidates: node === 1 ? [] : [p],
      description: node === 1
        ? tr(
          `루트 1 방문: depth[1] = 0, up[0][1] = 1. ${kidsText ? `자식 ${kidsText}을(를) 스택에 넣어요.` : ''}`,
          `Visit root 1: depth[1] = 0, up[0][1] = 1. ${kidsText ? `Push its children ${kidsText}.` : ''}`,
        ).trim()
        : tr(
          `노드 ${node} 방문: 부모는 ${p}, 깊이는 ${d}. depth[${node}] = ${d}, up[0][${node}] = ${p}. ${kidsText ? `자식 ${kidsText}을(를) 스택에 넣어요.` : '리프 노드예요.'}`,
          `Visit node ${node}: parent ${p}, depth ${d}. depth[${node}] = ${d}, up[0][${node}] = ${p}. ${kidsText ? `Push its children ${kidsText}.` : 'It is a leaf.'}`,
        ),
    });
  }

  // Phase 2: up[k][v] = up[k-1][up[k-1][v]]
  for (let k = 1; k < LOG; k++) {
    for (let node = 1; node <= n; node++) {
      const mid = up[k - 1][node]!;
      const val = up[k - 1][mid]!;
      up[k][node] = val;
      push({
        type: 'TABLE_FILL',
        codeLine: 3,
        dfsNode: node,
        fillCell: [k, node],
        deps: [[k - 1, node], [k - 1, mid]],
        candidates: [...new Set([mid, val])].filter(x => x !== node),
        k,
        description: tr(
          `up[${k}][${node}] = up[${k - 1}][up[${k - 1}][${node}]] = up[${k - 1}][${mid}] = ${val}. ${node}에서 2^${k - 1}칸 올라가면 ${mid}, 거기서 다시 2^${k - 1}칸 올라가면 ${val}이에요.`,
          `up[${k}][${node}] = up[${k - 1}][up[${k - 1}][${node}]] = up[${k - 1}][${mid}] = ${val}. Climbing 2^${k - 1} from ${node} reaches ${mid}, and 2^${k - 1} more reaches ${val}.`,
        ),
      });
    }
  }

  // Phase 3: the query
  const dep = depth as number[];
  const anc = up as number[][];
  let u = qu, v = qv;
  const swapped = dep[u] < dep[v];
  if (swapped) [u, v] = [v, u];
  const diff = dep[u] - dep[v];
  const trail = new Set<number>();
  push({
    type: 'QUERY',
    codeLine: 4,
    u, v, diff,
    description: tr(
      `쿼리 LCA(${qu}, ${qv}). depth[${qu}] = ${dep[qu]}, depth[${qv}] = ${dep[qv]}.${swapped ? ` 더 깊은 쪽을 u로 두려고 둘을 바꿔요.` : ''} u = ${u}를 ${diff}칸 끌어올려야 해요 (${diff} = 0b${diff.toString(2)}).`,
      `Query LCA(${qu}, ${qv}). depth[${qu}] = ${dep[qu]}, depth[${qv}] = ${dep[qv]}.${swapped ? ' Swap them so u is the deeper one.' : ''} u = ${u} must climb ${diff} levels (${diff} = 0b${diff.toString(2)}).`,
    ),
  });

  for (let k = 0; k < LOG; k++) {
    if (((diff >> k) & 1) === 0) continue;
    const from = u;
    trail.add(from);
    u = anc[k][u];
    push({
      type: 'LIFT',
      codeLine: 5,
      u, v, diff, k,
      deps: [[k, from]],
      trail: [...trail],
      description: tr(
        `diff의 ${k}번 비트가 1이에요. u를 2^${k} = ${1 << k}칸 올려요: u = up[${k}][${from}] = ${u}.`,
        `Bit ${k} of diff is set. Lift u by 2^${k} = ${1 << k}: u = up[${k}][${from}] = ${u}.`,
      ),
    });
  }

  let lca: number;
  let foundLine: number;
  if (u === v) {
    lca = u;
    foundLine = 6;
    push({
      type: 'FOUND',
      codeLine: 6,
      u, v, diff, lca,
      trail: [...trail],
      description: diff === 0
        ? tr(`두 노드가 같아요. LCA는 ${lca}예요.`, `Both nodes are the same, so the LCA is ${lca}.`)
        : tr(
          `깊이를 맞추고 나니 u = v = ${lca}예요. 한쪽이 다른 쪽의 조상이었으니 LCA는 ${lca}예요.`,
          `After leveling, u = v = ${lca}: one node was an ancestor of the other, so the LCA is ${lca}.`,
        ),
    });
  } else {
    for (let k = LOG - 1; k >= 0; k--) {
      const au = anc[k][u], av = anc[k][v];
      if (au !== av) {
        trail.add(u);
        trail.add(v);
        const fu = u, fv = v;
        u = au;
        v = av;
        push({
          type: 'JUMP_BOTH',
          codeLine: 7,
          u, v, diff, k,
          deps: [[k, fu], [k, fv]],
          trail: [...trail],
          description: tr(
            `up[${k}][${fu}] = ${au}, up[${k}][${fv}] = ${av}: 서로 달라요. 아직 공통 조상 아래이니 둘 다 2^${k}칸 올려요 (u = ${au}, v = ${av}).`,
            `up[${k}][${fu}] = ${au} and up[${k}][${fv}] = ${av} differ. Still below the common ancestor, so both climb 2^${k} (u = ${au}, v = ${av}).`,
          ),
        });
      } else {
        push({
          type: 'SKIP_JUMP',
          codeLine: 8,
          u, v, diff, k,
          deps: [[k, u], [k, v]],
          candidates: [au],
          trail: [...trail],
          description: tr(
            `up[${k}][${u}] = up[${k}][${v}] = ${au}: 같아요. 공통 조상이지만 가장 낮은지는 모르니 건너뛰어요.`,
            `up[${k}][${u}] = up[${k}][${v}] = ${au}: the same. A common ancestor, but maybe not the lowest, so skip it.`,
          ),
        });
      }
    }
    lca = anc[0][u];
    foundLine = 9;
    push({
      type: 'FOUND',
      codeLine: 9,
      u, v, diff, lca,
      deps: [[0, u]],
      trail: [...trail],
      description: tr(
        `u = ${u}, v = ${v}는 LCA 바로 아래 자식이에요. 답은 부모 up[0][${u}] = ${lca}입니다.`,
        `u = ${u} and v = ${v} now sit right below the LCA. The answer is their parent up[0][${u}] = ${lca}.`,
      ),
    });
  }

  push({
    type: 'DONE',
    codeLine: foundLine,
    u, v, diff, lca,
    trail: [...trail],
    description: tr(
      `LCA(${qu}, ${qv}) = ${lca}. 전처리 O(N log N) 뒤로는 쿼리마다 O(log N)이면 답이 나와요.`,
      `LCA(${qu}, ${qv}) = ${lca}. After the O(N log N) preprocessing, every query takes O(log N).`,
    ),
  });

  return steps;
}
