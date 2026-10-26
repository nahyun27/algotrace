import { useState, useCallback, useEffect, useRef } from 'react';
import type { GraphData, GraphNode, GraphEdge } from '../../types/graph';
import Toolbar from './Toolbar';
import type { EditorMode } from './Toolbar';
import EditorCanvas from './EditorCanvas';
import { Play } from 'lucide-react';
import { Button } from '../ui';
import { toneSoft } from '../ui/tone';
import { useTr } from '../../i18n';

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
  const tr = useTr();
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
      showToast(tr(`이 알고리즘은 최대 ${maxNodes}개 노드까지 지원해요`, `This algorithm supports up to ${maxNodes} nodes`));
      return;
    }
    const id = nodes.length === 0 ? 0 : Math.max(...nodes.map(n => n.id)) + 1;
    setNodes(prev => [...prev, { id, x, y, label: String(id) }]);
  }, [nodes, maxNodes, showToast, tr]);

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
      setError(tr('노드가 2개 이상 있어야 해요.', 'Add at least 2 nodes.'));
      return;
    }
    if (algorithmType === 'tsp') {
      if (nodes.length < 2) { setError(tr('노드가 2개 이상 있어야 해요.', 'Add at least 2 nodes.')); return; }
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
        const list = `${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ' …' : ''}`;
        setError(tr(`완전 그래프가 아니에요. 없는 간선: ${list}`, `Not a complete graph. Missing edges: ${list}`));
        return;
      }
    }
    const errMsg = onRun({ nodes, edges, directed });
    if (errMsg) setError(errMsg);
  };

  const canDelete = selectedNodeId !== null || selectedEdgeId !== null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
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
      <div className="flex-1 min-h-[360px] overflow-hidden relative flex">
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
      <div className="border-t border-border px-3 sm:px-4 py-3 flex items-center gap-3 bg-card flex-wrap">
        {error && (
          <p className={`text-xs font-semibold flex-1 rounded-lg px-3 py-2 ${toneSoft.danger}`}>{error}</p>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {tr(`노드 ${nodes.length}개 · 간선 ${edges.length}개`, `${nodes.length} node${nodes.length === 1 ? '' : 's'} · ${edges.length} edge${edges.length === 1 ? '' : 's'}`)}
          </span>
          <Button variant="primary" size="md" onClick={handleRun}>
            <Play size={15} fill="currentColor" />
            {tr('이 그래프로 시각화하기', 'Visualize this graph')}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-foreground text-background text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
