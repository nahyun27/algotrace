import { Link, useParams } from 'react-router-dom';
import { useTr } from '../i18n';
import TSPPage from './algorithms/TSPPage';
import DijkstraPage from './algorithms/DijkstraPage';
import AStarPage from './algorithms/AStarPage';
import BFSDFSPage from './algorithms/BFSDFSPage';
import BellmanFordPage from './algorithms/BellmanFordPage';
import FloydWarshallPage from './algorithms/FloydWarshallPage';
import TopologicalPage from './algorithms/TopologicalPage';
import KruskalPage from './algorithms/KruskalPage';
import SortingPage from './algorithms/SortingPage';

export default function AlgorithmPage() {
  const { slug } = useParams();
  const tr = useTr();
  if (slug === 'tsp')           return <TSPPage />;
  if (slug === 'dijkstra')      return <DijkstraPage />;
  if (slug === 'astar')         return <AStarPage />;
  if (slug === 'bfsdfs')        return <BFSDFSPage />;
  if (slug === 'bellmanford')   return <BellmanFordPage />;
  if (slug === 'floyd-warshall') return <FloydWarshallPage />;
  if (slug === 'topological')   return <TopologicalPage />;
  if (slug === 'kruskal')       return <KruskalPage />;
  if (slug === 'sorting')       return <SortingPage />;
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-lg font-bold">{tr('알고리즘을 찾을 수 없어요', 'Algorithm not found')}</p>
      <Link to="/" className="text-sm font-bold text-primary hover:underline">{tr('홈으로 돌아가기', 'Back to home')}</Link>
    </div>
  );
}
