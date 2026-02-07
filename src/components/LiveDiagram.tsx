import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ClusterState, K8sResource } from '../clusterState';

interface LiveDiagramProps {
  cluster: ClusterState;
}

const RESOURCE_STYLE: Record<string, { emoji: string; bg: string; border: string; text: string }> = {
  namespace:  { emoji: '📁', bg: '#1e1b4b', border: '#6366f1', text: '#a78bfa' },
  node:       { emoji: '🖥️', bg: '#0c4a6e', border: '#0284c7', text: '#7dd3fc' },
  pod:        { emoji: '🐳', bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  deployment: { emoji: '🚀', bg: '#064e3b', border: '#10b981', text: '#6ee7b7' },
  replicaset: { emoji: '📋', bg: '#134e4a', border: '#14b8a6', text: '#5eead4' },
  service:    { emoji: '🌐', bg: '#78350f', border: '#f59e0b', text: '#fde68a' },
  configmap:  { emoji: '⚙️', bg: '#334155', border: '#64748b', text: '#cbd5e1' },
  secret:     { emoji: '🔒', bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' },
  ingress:    { emoji: '🔀', bg: '#4c1d95', border: '#7c3aed', text: '#c4b5fd' },
};

const SYSTEM_NAMES = new Set(['default', 'kube-system', 'node-1', 'node-2']);
const NODE_W = 150;
const NODE_H = 60;
const GAP_X = 30;
const GAP_Y = 50;
const TREE_GAP = 60; // gap between separate deployment trees
const SECTION_GAP = 50; // gap between sections (trees vs standalone)
const PAD = 40;

export default function LiveDiagram({ cluster }: LiveDiagramProps) {
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const systemRes = cluster.resources.filter(r =>
    SYSTEM_NAMES.has(r.name) && (r.type === 'namespace' || r.type === 'node')
  );
  const userRes = cluster.resources.filter(r => !systemRes.includes(r));

  // Build parent→children map
  const childrenOf = useMemo(() => {
    const map = new Map<string, K8sResource[]>();
    for (const r of userRes) {
      const parentId = (r.metadata.managedBy as string) || (r.metadata.targetRef as string);
      if (parentId) {
        if (!map.has(parentId)) map.set(parentId, []);
        map.get(parentId)!.push(r);
      }
    }
    return map;
  }, [userRes]);

  // Find root resources (no parent)
  const managedIds = useMemo(() => {
    const set = new Set<string>();
    for (const r of userRes) {
      const parentId = (r.metadata.managedBy as string) || (r.metadata.targetRef as string);
      if (parentId) set.add(r.id);
    }
    return set;
  }, [userRes]);

  const roots = useMemo(() => userRes.filter(r => !managedIds.has(r.id)), [userRes, managedIds]);

  // Separate into trees (resources with children) and standalone
  const treeRoots = roots.filter(r => childrenOf.has(r.id));
  const standalone = roots.filter(r => !childrenOf.has(r.id));

  // Layout: position each tree, then standalone resources
  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();

    // Layout a tree rooted at `res` starting at (startX, startY)
    // Returns the width consumed
    function layoutTree(res: K8sResource, startX: number, startY: number): number {
      const children = childrenOf.get(res.id) || [];
      if (children.length === 0) {
        pos.set(res.id, { x: startX, y: startY });
        return NODE_W;
      }

      // Layout children first to know total width
      let childX = startX;
      const childWidths: number[] = [];
      for (const child of children) {
        const w = layoutTree(child, childX, startY + NODE_H + GAP_Y);
        childWidths.push(w);
        childX += w + GAP_X;
      }
      const totalChildWidth = childX - GAP_X - startX;

      // Center parent above children
      const parentX = startX + Math.max(0, (totalChildWidth - NODE_W) / 2);
      pos.set(res.id, { x: parentX, y: startY });

      return Math.max(NODE_W, totalChildWidth);
    }

    let cursorX = PAD;
    const treeStartY = PAD;

    // Layout each tree root
    for (let i = 0; i < treeRoots.length; i++) {
      const w = layoutTree(treeRoots[i], cursorX, treeStartY);
      cursorX += w + TREE_GAP;
    }

    // Find max Y used by trees
    let maxTreeY = treeStartY;
    for (const [, p] of pos) {
      maxTreeY = Math.max(maxTreeY, p.y + NODE_H);
    }

    // Layout standalone resources in a row below trees (or at top if no trees)
    const standaloneY = treeRoots.length > 0 ? maxTreeY + SECTION_GAP : PAD;

    // Group standalone by type for visual clarity
    const standaloneByType: Record<string, K8sResource[]> = {};
    for (const r of standalone) {
      if (!standaloneByType[r.type]) standaloneByType[r.type] = [];
      standaloneByType[r.type].push(r);
    }

    const typeOrder = ['namespace', 'ingress', 'service', 'configmap', 'secret', 'pod'];
    const orderedTypes = typeOrder.filter(t => standaloneByType[t]);
    // Add any types not in the order
    for (const t of Object.keys(standaloneByType)) {
      if (!orderedTypes.includes(t)) orderedTypes.push(t);
    }

    let sX = PAD;
    let sY = standaloneY;
    const maxPerRow = 5;

    for (const type of orderedTypes) {
      const items = standaloneByType[type];
      for (let i = 0; i < items.length; i++) {
        if (i > 0 && i % maxPerRow === 0) {
          sX = PAD;
          sY += NODE_H + GAP_Y;
        }
        pos.set(items[i].id, { x: sX, y: sY });
        sX += NODE_W + GAP_X;
      }
      // New row for next type
      sX = PAD;
      sY += NODE_H + GAP_Y;
    }

    return pos;
  }, [userRes, childrenOf, treeRoots, standalone]);

  // Compute SVG bounds
  let svgW = 400;
  let svgH = 200;
  for (const [, p] of positions) {
    svgW = Math.max(svgW, p.x + NODE_W + PAD);
    svgH = Math.max(svgH, p.y + NODE_H + PAD);
  }

  // Build arrows
  const arrows = useMemo(() => {
    const result: { fromX: number; fromY: number; toX: number; toY: number; color: string }[] = [];
    for (const r of userRes) {
      const parentId = (r.metadata.managedBy as string) || (r.metadata.targetRef as string);
      if (!parentId) continue;
      const childPos = positions.get(r.id);
      const parentPos = positions.get(parentId);
      if (!childPos || !parentPos) continue;
      const parentRes = userRes.find(p => p.id === parentId);
      const style = RESOURCE_STYLE[parentRes?.type || 'pod'];
      result.push({
        fromX: parentPos.x + NODE_W / 2,
        fromY: parentPos.y + NODE_H,
        toX: childPos.x + NODE_W / 2,
        toY: childPos.y,
        color: style?.border || '#475569',
      });
    }
    return result;
  }, [userRes, positions]);

  // Zoom/pan handlers
  const zoomIn = useCallback(() => setZoom(z => Math.min(3, z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(0.2, z - 0.15)), []);
  const resetView = useCallback(() => { setZoom(0.85); setPan({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(z => Math.min(3, Math.max(0.2, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    };
    const onUp = () => { isPanning.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-950 border-l border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs">📐</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Cluster</span>
          <span className="text-xs text-gray-600">{userRes.length} resource{userRes.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700 transition-colors" title="Zoom out">−</button>
          <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700 transition-colors" title="Zoom in">+</button>
          <button onClick={resetView} className="ml-1 px-2 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700 transition-colors" title="Reset view">⟲</button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {userRes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <span className="text-4xl mb-3">☸️</span>
            <p className="text-sm">Your cluster is empty</p>
            <p className="text-xs mt-1">Run a kubectl command to see resources here</p>
          </div>
        ) : (
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="live-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
            </defs>
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Grid dots */}
              {Array.from({ length: Math.ceil(svgW / 40) }).map((_, xi) =>
                Array.from({ length: Math.ceil(svgH / 40) }).map((_, yi) => (
                  <circle key={`d-${xi}-${yi}`} cx={xi * 40} cy={yi * 40} r={0.6} fill="#1e293b" />
                ))
              )}

              {/* Arrows */}
              {arrows.map((a, i) => {
                const midY = (a.fromY + a.toY) / 2;
                const path = Math.abs(a.fromX - a.toX) < 2
                  ? `M ${a.fromX} ${a.fromY} L ${a.toX} ${a.toY}`
                  : `M ${a.fromX} ${a.fromY} L ${a.fromX} ${midY} L ${a.toX} ${midY} L ${a.toX} ${a.toY}`;
                return (
                  <path key={`a-${i}`} d={path} fill="none" stroke={a.color} strokeWidth={1.5} strokeOpacity={0.5} markerEnd="url(#live-arrow)" />
                );
              })}

              {/* Resource nodes */}
              {userRes.map(r => {
                const pos = positions.get(r.id);
                if (!pos) return null;
                const style = RESOURCE_STYLE[r.type] || RESOURCE_STYLE.pod;
                const status = r.metadata.status as string | undefined;
                const displayName = r.name.length > 16 ? r.name.slice(0, 15) + '…' : r.name;
                return (
                  <g key={r.id}>
                    <rect x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={10} fill={style.bg} stroke={style.border} strokeWidth={1.5} />
                    <text x={pos.x + 14} y={pos.y + 24} fontSize={16}>{style.emoji}</text>
                    <text x={pos.x + 36} y={pos.y + 24} fill={style.text} fontSize={11} fontWeight={600} fontFamily="system-ui, sans-serif">
                      {displayName}
                    </text>
                    <text x={pos.x + 14} y={pos.y + 44} fill="#64748b" fontSize={9} fontFamily="system-ui, sans-serif">{r.type}</text>
                    {status && (
                      <text x={pos.x + NODE_W - 12} y={pos.y + 44} fill={status === 'Running' ? '#10b981' : '#f59e0b'} fontSize={9} textAnchor="end" fontFamily="system-ui, sans-serif">
                        ● {status}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      <div className="px-3 py-1.5 bg-gray-900 border-t border-gray-800 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          {systemRes.map(r => (
            <span key={r.id} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
              {RESOURCE_STYLE[r.type]?.emoji} {r.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
