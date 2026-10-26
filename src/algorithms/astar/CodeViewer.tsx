import CodePanel from '../../components/algorithm/CodePanel';

const ASTAR_CODE_STR = [
  "import heapq",
  "import math",
  "",
  "def heuristic(u, v, pos):",
  "    # 유클리드 거리 (직선 거리) 계산",
  "    x1, y1 = pos[u]",
  "    x2, y2 = pos[v]",
  "    return math.hypot(x1 - x2, y1 - y2)",
  "",
  "def astar(graph, start, goal, pos):",
  "    n = len(graph)",
  "    g_score = {i: float('inf') for i in range(n)}",
  "    f_score = {i: float('inf') for i in range(n)}",
  "    ",
  "    g_score[start] = 0",
  "    f_score[start] = heuristic(start, goal, pos)",
  "    ",
  "    # 우선순위 큐: (f_score, 노드)",
  "    open_set = [(f_score[start], start)]",
  "    closed_set = set()",
  "    parent = {start: None}",
  "",
  "    while open_set:",
  "        current_f, u = heapq.heappop(open_set)",
  "",
  "        if u == goal:",
  "            return reconstruct_path(parent, goal)",
  "            ",
  "        if u in closed_set: continue",
  "        closed_set.add(u)",
  "",
  "        for v, weight in graph[u]:",
  "            tentative_g = g_score[u] + weight",
  "",
  "            # 더 나은 경로를 발견한 경우",
  "            if tentative_g < g_score[v]:",
  "                parent[v] = u",
  "                g_score[v] = tentative_g",
  "                f_score[v] = g_score[v] + heuristic(v, goal, pos)",
  "                ",
  "                # open_set에 업데이트된 정보 추가",
  "                heapq.heappush(open_set, (f_score[v], v))",
  "",
  "    return None # 목표 도달 불가"
].join('\n');

export default function CodeViewer({ codeLine }: { codeLine: number }) {
  // highlight specific lines based on solver state
  const isHighlighted = (lineNum: number) => {
    if (codeLine === 8 && lineNum >= 11 && lineNum <= 20) return true; // INIT
    if (codeLine === 13 && lineNum >= 23 && lineNum <= 24) return true; // DEQUEUE
    if (codeLine === 15 && lineNum >= 26 && lineNum <= 27) return true; // DONE
    if (codeLine === 18 && lineNum >= 32 && lineNum <= 36) return true; // RELAX
    return false;
  };

  return (
    <CodePanel
      title="astar.py"
      code={ASTAR_CODE_STR}
      isLineHighlighted={(line) => isHighlighted(line)}
    />
  );
}
