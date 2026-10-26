import CodePanel from '../../components/algorithm/CodePanel';

const DIJKSTRA_CODE = `import heapq

def dijkstra(graph, start):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]  # (cost, node)

    while pq:
        cost, u = heapq.heappop(pq)
        if visited[u]: continue
        visited[u] = True

        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))

    return dist`;

function isHighlighted(lineNum: number, codeLine: number): boolean {
  if (codeLine === 1  && lineNum >= 3  && lineNum <= 6)  return true; // INIT
  if (codeLine === 4  && lineNum >= 8  && lineNum <= 10) return true; // DEQUEUE
  if (codeLine === 6  && lineNum === 11)                 return true; // VISITED
  if (codeLine === 9  && (lineNum === 13 || lineNum === 14)) return true; // RELAX no-improve
  if (codeLine === 10 && lineNum >= 13 && lineNum <= 16) return true; // RELAX improve
  if (codeLine === 12 && lineNum === 18)                 return true; // DONE
  return false;
}

export default function DijkstraCodeViewer({ codeLine }: { codeLine: number }) {
  return (
    <CodePanel
      title="dijkstra.py"
      code={DIJKSTRA_CODE}
      isLineHighlighted={(line) => isHighlighted(line, codeLine)}
    />
  );
}
