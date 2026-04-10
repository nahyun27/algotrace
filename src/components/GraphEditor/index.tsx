import { useState, useCallback, useEffect, useRef } from 'react';
import type { GraphData, GraphNode, GraphEdge } from '../../types/graph';
import Toolbar from './Toolbar';
import type { EditorMode } from './Toolbar';
import EditorCanvas from './EditorCanvas';
import { Play } from 'lucide-react';

interface Preset { label: string; data: GraphData; }

interface GraphEditorProps {
  initialData: GraphData;
  maxNodes: number;
  onRun: (data: GraphData) => string | null; // returns error string or null on success
  presets: Preset[];
  /** 'tsp' | 'dijkstra' | 'astar' | 'bfsdfs' — controls validation message wording */
  algorithmType: 'tsp' | 'dijkstra' | 'astar' | 'bfsdfs';
}

let _edgeCounter = 0;
function newEdgeId() { return `e${++_edgeCounter}`; }

export default function GraphEditor({ initialData, maxNodes, onRun, presets, algorithmType }: GraphEditorProps) {
  const [nodes, setNodes]       = useState<GraphNode[]>(initialData.nodes);
  const [edges, setEdges]       = useState<GraphEdge[]>(initialData.edges);
  const [directed, setDirected] = useState(initialData.directed);
  const [mode, setMode]         = useState<EditorMode>('SELECT');

  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [pendingEdgeFrom, setPendingEdgeFrom] = useState<number | null>(null);
  const pendingEdgeTo = useRef<number | null>(null); // set when user clicks 2nd node; used just before popup confirm

  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ─── Keyboard: Delete key ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (selectedNodeId !== null) deleteNode(selectedNodeId);
        if (selectedEdgeId !== null) deleteEdge(selectedEdgeId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId, selectedEdgeId]);

  // ─── Node operations ─────────────────────────────────────────────────────
  const handleAddNode = useCallback((x: number, y: number) => {
    if (nodes.length >= maxNodes) {
      showToast(`${algorithmType === 'tsp' ? 'TSP' : '다익스트라'}는 최대 ${maxNodes}개 노드까지 지원합니다`);
      return;
    }
    const id = nodes.length === 0 ? 0 : Math.max(...nodes.map(n => n.id)) + 1;
    setNodes(prev => [...prev, { id, x, y, label: String(id) }]);
  }, [nodes, maxNodes, algorithmType, showToast]);

  const handleMoveNode = useCallback((id: number, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  const deleteNode = useCallback((id: number) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setSelectedNodeId(null);
  }, []);

  // ─── Edge operations ─────────────────────────────────────────────────────
  const handleStartEdge = useCallback((nodeId: number) => {
    setPendingEdgeFrom(nodeId);
  }, []);

  const handleFinishEdge = useCallback((nodeId: number) => {
    pendingEdgeTo.current = nodeId;
    // keep pendingEdgeFrom — popup will call onAddEdgeWithWeight
  }, []);

  const handleAddEdgeWithWeight = useCallback((weight: number) => {
    const from = pendingEdgeFrom;
    const to   = pendingEdgeTo.current;
    if (from === null || to === null) { setPendingEdgeFrom(null); return; }
    setEdges(prev => {
      // Prevent duplicate
      if (prev.some(e => e.from === from && e.to === to)) return prev;
      return [...prev, { id: newEdgeId(), from, to, weight }];
    });
    pendingEdgeTo.current = null;
    setPendingEdgeFrom(null);
  }, [pendingEdgeFrom]);

  const handleCancelEdge = useCallback(() => {
    pendingEdgeTo.current = null;
    setPendingEdgeFrom(null);
  }, []);

  const handleEditEdgeWeight = useCallback((edgeId: string, newWeight: number) => {
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, weight: newWeight } : e));
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setEdges(prev => prev.filter(e => e.id !== id));
    setSelectedEdgeId(null);
  }, []);

  // ─── Global ops ──────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setNodes([]); setEdges([]);
    setSelectedNodeId(null); setSelectedEdgeId(null);
    setPendingEdgeFrom(null); pendingEdgeTo.current = null;
    setError(null);
  }, []);

  const handleLoadPreset = useCallback((data: GraphData) => {
    setNodes(data.nodes); setEdges(data.edges);
    setDirected(data.directed);
    setSelectedNodeId(null); setSelectedEdgeId(null);
    setPendingEdgeFrom(null); pendingEdgeTo.current = null;
    setError(null);
  }, []);

  // ─── Validation & Run ────────────────────────────────────────────────────
  const handleRun = () => {
    setError(null);
    // Basic checks
    if (algorithmType === 'dijkstra' && nodes.length < 2) {
      setError('노드가 2개 이상 있어야 합니다.');
      return;
    }
    if (algorithmType === 'tsp') {
      if (nodes.length < 2) { setError('노드가 2개 이상 있어야 합니다.'); return; }
      // Check directed complete graph
      const edgeSet = new Set(edges.map(e => `${e.from}-${e.to}`));
      const missing: string[] = [];
      for (const n1 of nodes) {
        for (const n2 of nodes) {
          if (n1.id !== n2.id && !edgeSet.has(`${n1.id}-${n2.id}`)) {
            missing.push(`${n1.id}→${n2.id}`);
          }
        }
      }
      if (missing.length > 0) {
        setError(`완전 그래프가 아닙니다. 없는 간선: ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ' ...' : ''}`);
        return;
      }
    }
    const errMsg = onRun({ nodes, edges, directed });
    if (errMsg) setError(errMsg);
  };

  const canDelete = selectedNodeId !== null || selectedEdgeId !== null;

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-card shadow-sm">
      <Toolbar
        mode={mode}
        onModeChange={(m) => { setMode(m); setPendingEdgeFrom(null); }}
        directed={directed}
        onDirectedToggle={() => setDirected(p => !p)}
        canDelete={canDelete}
        onDelete={() => {
          if (selectedNodeId !== null) deleteNode(selectedNodeId);
          else if (selectedEdgeId !== null) deleteEdge(selectedEdgeId);
        }}
        onReset={handleReset}
        presets={presets.map(p => ({ label: p.label, onLoad: () => handleLoadPreset(p.data) }))}
        nodeCount={nodes.length}
        maxNodes={maxNodes}
      />

      {/* Canvas */}
      <div className="flex-1 bg-muted/5 min-h-[360px] overflow-hidden relative">
        <EditorCanvas
          nodes={nodes} edges={edges} directed={directed}
          mode={mode}
          selectedNodeId={selectedNodeId} selectedEdgeId={selectedEdgeId}
          pendingEdgeFrom={pendingEdgeFrom}
          onAddNode={handleAddNode} onMoveNode={handleMoveNode}
          onSelectNode={setSelectedNodeId} onSelectEdge={setSelectedEdgeId}
          onStartEdge={handleStartEdge} onFinishEdge={handleFinishEdge}
          onAddEdgeWithWeight={handleAddEdgeWithWeight} onCancelEdge={handleCancelEdge}
          onEditEdgeWeight={handleEditEdgeWeight}
        />
      </div>

      {/* Footer: error + run button */}
      <div className="border-t p-3 flex items-center gap-3 bg-muted/10 flex-wrap">
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium flex-1">{error}</p>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            노드 {nodes.length}개 · 간선 {edges.length}개
          </span>
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Play size={14} />
            이 그래프로 시각화 실행
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-2.5 rounded-lg shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
