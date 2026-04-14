import type { FloydWarshallStep } from './types';
import { INF, FW_NODES, FW_EDGES } from './types';

interface Props {
  step: FloydWarshallStep;
  pathNodes?: number[];  // for path reconstruction highlight
}

export default function FWGraphCanvas({ step, pathNodes = [] }: Props) {
  const { currentK, currentI, currentJ, isUpdate, type } = step;
  const nodes = FW_NODES;
  const edges = FW_EDGES;
  const isDone = type === 'DONE';
  const isNegCycle = type === 'NEGATIVE_CYCLE';

  const isDark = typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  // Check if an edge (u→v) is on the pathNodes path
  const isOnPath = (u: number, v: number): boolean => {
    if (pathNodes.length < 2) return false;
    for (let idx = 0; idx < pathNodes.length - 1; idx++) {
      if (pathNodes[idx] === u && pathNodes[idx + 1] === v) return true;
    }
    return false;
  };

  // Determine edge role in current step
  const getEdgeRole = (u: number, v: number) => {
    if (pathNodes.length >= 2 && isOnPath(u, v)) return 'path';
    if (currentI !== null && currentK !== null && u === currentI && v === currentK) return 'ik';
    if (currentK !== null && currentJ !== null && u === currentK && v === currentJ) return 'kj';
    if (currentI !== null && currentJ !== null && u === currentI && v === currentJ) return 'ij';
    return 'normal';
  };

  // Determine node role
  const getNodeRole = (id: number) => {
    if (pathNodes.length >= 2 && pathNodes.includes(id)) return 'path';
    if (isDone) return 'done';
    if (isNegCycle) return 'negcycle';
    if (id === currentK) return 'k';
    if (id === currentI) return 'i';
    if (id === currentJ) return 'j';
    return 'normal';
  };

  return (
    <div className="w-full min-h-[340px] h-full flex flex-col relative p-4 bg-muted/10 items-center justify-center">
      <svg viewBox="0 0 480 380" className="overflow-visible w-full max-w-[480px]" style={{ height: 'auto' }}>
        <defs>
          <marker id="fw-arrow" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-border" />
          </marker>
          <marker id="fw-arrow-blue" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
          <marker id="fw-arrow-green" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
          </marker>
          <marker id="fw-arrow-gray" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
          <marker id="fw-arrow-path" markerWidth="10" markerHeight="7" refX="26" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(([u, v, w]) => {
          const role = getEdgeRole(u, v);
          const n1 = nodes[u], n2 = nodes[v];
          if (!n1 || !n2) return null;
          const dx = n2.x - n1.x, dy = n2.y - n1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const dr = len * 1.3;
          const perp = 26;
          const midX = (n1.x + n2.x) / 2 + (dy / len) * perp;
          const midY = (n1.y + n2.y) / 2 - (dx / len) * perp;

          let stroke = 'var(--graph-edge)';
          let strokeW = 1.5;
          let opacity = 0.35;
          let marker = 'url(#fw-arrow)';
          let strokeDash = 'none';

          if (role === 'path') {
            stroke = '#8b5cf6'; strokeW = 3; opacity = 1;
            marker = 'url(#fw-arrow-path)';
          } else if (role === 'ij') {
            stroke = '#9ca3af'; strokeW = 1.5; opacity = 0.7;
            marker = 'url(#fw-arrow-gray)'; strokeDash = '6,4';
          } else if (role === 'ik' || role === 'kj') {
            if (isUpdate) {
              stroke = '#22c55e'; strokeW = 2.5; opacity = 1;
              marker = 'url(#fw-arrow-green)';
            } else {
              stroke = '#3b82f6'; strokeW = 2.5; opacity = 1;
              marker = 'url(#fw-arrow-blue)';
            }
          }

          return (
            <g key={`${u}-${v}`}>
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,1 ${n2.x},${n2.y}`}
                fill="none" stroke={stroke} strokeWidth={strokeW} strokeOpacity={opacity}
                strokeDasharray={strokeDash}
                className="transition-all duration-300" markerEnd={marker}
              />
              <text x={midX} y={midY} textAnchor="middle" dy=".35em"
                fontSize={role !== 'normal' ? 13 : 11}
                fontWeight={role !== 'normal' ? 700 : 500}
                fill={role === 'ij' ? 'var(--muted-foreground)' : stroke}
                className="font-mono transition-all duration-300"
              >{w}</text>
            </g>
          );
        })}

        {/* Virtual i→k arc when no direct edge exists (dashed) */}
        {currentI !== null && currentK !== null && currentI !== currentK && (
          (() => {
            const hasDirectEdge = edges.some(([u, v]) => u === currentI && v === currentK);
            if (hasDirectEdge) return null;
            const n1 = nodes[currentI], n2 = nodes[currentK];
            const dx = n2.x - n1.x, dy = n2.y - n1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const dr = len * 1.2;
            return (
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,0 ${n2.x},${n2.y}`}
                fill="none"
                stroke={isUpdate ? '#22c55e' : '#3b82f6'}
                strokeWidth={2} strokeOpacity={0.5}
                strokeDasharray="6,4"
                markerEnd={isUpdate ? 'url(#fw-arrow-green)' : 'url(#fw-arrow-blue)'}
                className="transition-all duration-300"
              />
            );
          })()
        )}

        {/* Virtual k→j arc when no direct edge exists */}
        {currentK !== null && currentJ !== null && currentK !== currentJ && (
          (() => {
            const hasDirectEdge = edges.some(([u, v]) => u === currentK && v === currentJ);
            if (hasDirectEdge) return null;
            const n1 = nodes[currentK], n2 = nodes[currentJ];
            const dx = n2.x - n1.x, dy = n2.y - n1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const dr = len * 1.2;
            return (
              <path
                d={`M ${n1.x},${n1.y} A ${dr},${dr} 0 0,0 ${n2.x},${n2.y}`}
                fill="none"
                stroke={isUpdate ? '#22c55e' : '#3b82f6'}
                strokeWidth={2} strokeOpacity={0.5}
                strokeDasharray="6,4"
                markerEnd={isUpdate ? 'url(#fw-arrow-green)' : 'url(#fw-arrow-blue)'}
                className="transition-all duration-300"
              />
            );
          })()
        )}

        {/* Nodes */}
        {nodes.map(nd => {
          const role = getNodeRole(nd.id);
          const r = role !== 'normal' ? 24 : 22;

          let fill = '#e4e4e7', stroke = '#a1a1aa', textFill = '#3f3f46';
          if (isDark) {
            fill = '#2a2d3e'; stroke = '#383b52'; textFill = '#e2e4ed';
          }

          if (role === 'path') { fill = '#8b5cf6'; stroke = '#6d28d9'; textFill = '#fff'; }
          else if (role === 'done') { fill = '#bbf7d0'; stroke = '#16a34a'; textFill = '#14532d'; }
          else if (role === 'negcycle') { fill = '#fee2e2'; stroke = '#ef4444'; textFill = '#7f1d1d'; }
          else if (nd.id === currentK) { fill = '#8b5cf6'; stroke = '#6d28d9'; textFill = '#fff'; }
          else if (nd.id === currentI) {
            if (isUpdate) { fill = '#22c55e'; stroke = '#15803d'; textFill = '#fff'; }
            else { fill = '#3b82f6'; stroke = '#1d4ed8'; textFill = '#fff'; }
          }
          else if (nd.id === currentJ) {
            if (isUpdate) { fill = '#22c55e'; stroke = '#15803d'; textFill = '#fff'; }
            else { fill = '#fb923c'; stroke = '#c2410c'; textFill = '#fff'; }
          }

          const distVals = step.distMatrix;
          const highlight = role !== 'normal' && role !== 'done';

          return (
            <g key={nd.id} transform={`translate(${nd.x},${nd.y})`} className="transition-all duration-300">
              {highlight && (
                <circle r={r + 7} fill={fill} fillOpacity={0.15} />
              )}
              <circle r={r} fill={fill} stroke={stroke} strokeWidth={2}
                style={{ filter: highlight ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none' }} />
              <text textAnchor="middle" dy=".35em" fontSize={14} fontWeight={700}
                fill={textFill} style={{ pointerEvents: 'none' }}>{nd.id}</text>
              {/* Label: role indicator */}
              {nd.id === currentK && currentK !== null && (
                <text textAnchor="middle" dy={-(r + 10)} fontSize={10} fontWeight={700}
                  className="fill-violet-600 dark:fill-violet-400 font-mono">k</text>
              )}
              {nd.id === currentI && currentI !== null && (
                <text textAnchor="middle" dy={-(r + 10)} fontSize={10} fontWeight={700}
                  className={`font-mono ${isUpdate ? 'fill-green-600 dark:fill-green-400' : 'fill-blue-500 dark:fill-blue-400'}`}>i</text>
              )}
              {nd.id === currentJ && currentJ !== null && (
                <text textAnchor="middle" dy={-(r + 10)} fontSize={10} fontWeight={700}
                  className={`font-mono ${isUpdate ? 'fill-green-600 dark:fill-green-400' : 'fill-orange-500 dark:fill-orange-400'}`}>j</text>
              )}
              {/* dist[i][i] value on diagonal (show 0) below node for done */}
              {isDone && (
                <text textAnchor="middle" dy={r + 16} fontSize={10} fontWeight={500}
                  className="font-mono fill-emerald-700 dark:fill-emerald-400">
                  {distVals[nd.id]?.[nd.id] >= INF ? '∞' : distVals[nd.id]?.[nd.id]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 border text-[11px] font-medium text-muted-foreground bg-card p-3 rounded-lg shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 w-fit mx-auto">
        {[
          { color: 'bg-violet-500 border-violet-700', label: '경유 노드 (k)' },
          { color: 'bg-blue-500 border-blue-700',     label: '출발 노드 (i)' },
          { color: 'bg-orange-400 border-orange-600', label: '도착 노드 (j)' },
          { color: 'bg-green-400 border-green-600',   label: '경로 갱신됨' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full border shadow-sm ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
