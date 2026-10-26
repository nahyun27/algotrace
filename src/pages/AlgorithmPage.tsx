import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTr } from '../i18n';

// Each algorithm page is its own chunk, loaded on first visit
const PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  'tsp':            lazy(() => import('./algorithms/TSPPage')),
  'dijkstra':       lazy(() => import('./algorithms/DijkstraPage')),
  'astar':          lazy(() => import('./algorithms/AStarPage')),
  'bfsdfs':         lazy(() => import('./algorithms/BFSDFSPage')),
  'bellmanford':    lazy(() => import('./algorithms/BellmanFordPage')),
  'floyd-warshall': lazy(() => import('./algorithms/FloydWarshallPage')),
  'topological':    lazy(() => import('./algorithms/TopologicalPage')),
  'kruskal':        lazy(() => import('./algorithms/KruskalPage')),
  'sorting':        lazy(() => import('./algorithms/SortingPage')),
};

function PageLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8" role="status" aria-busy="true">
      <span className="w-8 h-8 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
    </div>
  );
}

export default function AlgorithmPage() {
  const { slug } = useParams();
  const tr = useTr();
  const Page = slug ? PAGES[slug] : undefined;

  if (!Page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-bold">{tr('알고리즘을 찾을 수 없어요', 'Algorithm not found')}</p>
        <Link to="/" className="text-sm font-bold text-primary hover:underline">{tr('홈으로 돌아가기', 'Back to home')}</Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoading />}>
      {/* key: remount when switching algorithms so page state never leaks across slugs */}
      <Page key={slug} />
    </Suspense>
  );
}
