import type { GraphData } from '../../types/graph';

export function graphDataToTSP(data: GraphData): {
  W: number[][];
  N: number;
  nodePositions: { id: number; x: number; y: number }[];
} {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const N = sorted.length;
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const W: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (const e of data.edges) {
    const u = idMap.get(e.from)!;
    const v = idMap.get(e.to)!;
    if (u !== undefined && v !== undefined) W[u][v] = e.weight;
  }
  const nodePositions = sorted.map((n, i) => ({ id: i, x: n.x, y: n.y }));
  return { W, N, nodePositions };
}

export function graphDataToDijkstra(data: GraphData): {
  edges: [number, number, number][];
  N: number;
  nodePositions: { id: number; x: number; y: number }[];
} {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const N = sorted.length;
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const edges: [number, number, number][] = data.edges
    .map(e => {
      const u = idMap.get(e.from);
      const v = idMap.get(e.to);
      return (u !== undefined && v !== undefined) ? [u, v, e.weight] as [number, number, number] : null;
    })
    .filter((e): e is [number, number, number] => e !== null);
  const nodePositions = sorted.map((n, i) => ({ id: i, x: n.x, y: n.y }));
  return { edges, N, nodePositions };
}

export function graphDataToBFSDFS(data: GraphData): {
  edges: [number, number, number][];
  N: number;
} {
  const sorted = [...data.nodes].sort((a, b) => a.id - b.id);
  const N = sorted.length;
  const idMap = new Map(sorted.map((n, i) => [n.id, i]));
  const edges: [number, number, number][] = data.edges.map(e => [
    idMap.get(e.from)!, idMap.get(e.to)!, e.weight
  ]);
  return { edges, N };
}
