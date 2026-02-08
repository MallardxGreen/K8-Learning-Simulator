import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ClusterState, K8sResource } from '../clusterState';

interface LiveDiagramProps {
  cluster: ClusterState;
}

const RESOURCE_STYLE: Record<string, { emoji: string; bg: string; border: string; text: string }> = {
  pod:        { emoji: '🐳', bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  deployment: { emoji: '🚀', bg: '#064e3b', border: '#10b981', text: '#6ee7b7' },
  replicaset: { emoji: '📋', bg: '#134e4a', border: '#14b8a6', text: '#5eead4' },
  statefulset:{ emoji: '🗄️', bg: '#064e3b', border: '#059669', text: '#6ee7b7' },
  daemonset:  { emoji: '👹', bg: '#365314', border: '#84cc16', text: '#bef264' },
  job:        { emoji: '⚡', bg: '#713f12', border: '#eab308', text: '#fde047' },
  cronjob:    { emoji: '⏰', bg: '#78350f', border: '#d97706', text: '#fcd34d' },
  service:    { emoji: '🌐', bg: '#78350f', border: '#f59e0b', text: '#fde68a' },
  configmap:  { emoji: '⚙️', bg: '#334155', border: '#64748b', text: '#cbd5e1' },
  secret:     { emoji: '🔒', bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' },
  ingress:    { emoji: '🔀', bg: '#4c1d95', border: '#7c3aed', text: '#c4b5fd' },
  persistentvolume:      { emoji: '💾', bg: '#1e3a5f', border: '#2563eb', text: '#93c5fd' },
  persistentvolumeclaim: { emoji: '📎', bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  serviceaccount: { emoji: '👤', bg: '#334155', border: '#94a3b8', text: '#e2e8f0' },
  role:       { emoji: '🛡️', bg: '#4c1d95', border: '#8b5cf6', text: '#c4b5fd' },
  clusterrole:{ emoji: '🛡️', bg: '#4c1d95', border: '#a78bfa', text: '#ddd6fe' },
  rolebinding:{ emoji: '🔗', bg: '#4c1d95', border: '#7c3aed', text: '#c4b5fd' },
  clusterrolebinding: { emoji: '🔗', bg: '#4c1d95', border: '#a78bfa', text: '#ddd6fe' },
  networkpolicy: { emoji: '🔥', bg: '#7f1d1d', border: '#dc2626', text: '#fca5a5' },
};

const CARD_W = 136;
const CARD_H = 46;
const GAP = 12;
const NS_PAD = 12;
const COLS = 2;

// Cluster-scoped resource types
const CLUSTER_SCOPED = new Set(['namespace', 'node', 'persistentvolume', 'clusterrole', 'clusterrolebinding']);

// Simple hash to assign a resource to a node index
function assignNode(name: string, nodeCount: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % nodeCount;
}

export default function LiveDiagram({ cluster }: LiveDiagramProps) {
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Categorize resources
  const nodes = cluster.resources.filter(r => r.type === 'node');
  const clusterScoped = cluster.resources.filter(r => CLUSTER_SCOPED.has(r.type) && r.type !== 'node' && r.type !== 'namespace');
  const namespacedRes = cluster.resources.filter(r => !CLUSTER_SCOPED.has(r.type));

  const userResourceCount = namespacedRes.length + clusterScoped.length;

  // Assign each namespaced resource to a worker node, then group by node → namespace
  const nodeData = useMemo(() => {
    if (nodes.length === 0) return [];

    // Build: nodeIndex → nsName → resources[]
    const map: Map<number, Map<string, K8sResource[]>> = new Map();
    for (let i = 0; i < nodes.length; i++) map.set(i, new Map());

    for (const r of namespacedRes) {
      const ni = assignNode(r.id, nodes.length);
      const nsName = r.namespace || 'default';
      const nodeMap = map.get(ni)!;
      if (!nodeMap.has(nsName)) nodeMap.set(nsName, []);
      nodeMap.get(nsName)!.push(r);
    }

    return nodes.map((n, i) => {
      const nsMap = map.get(i)!;
      const taints = Array.isArray(n.metadata.taints) ? (n.metadata.taints as string[]) : [];
      const status = (n.metadata.status as string) || 'Ready';
      // Sort namespaces: default first, then alphabetical
      const nsList = [...nsMap.entries()]
        .filter(([, res]) => res.length > 0)
        .sort(([a], [b]) => {
          if (a === 'default') return -1;
          if (b === 'default') return 1;
          return a.localeCompare(b);
        });
      return { node: n, taints, status, namespaces: nsList };
    });
  }, [nodes, namespacedRes]);

  // Layout computation
  const layout = useMemo(() => {
    const PAD = 20;
    const CP_W = 500;
    const CP_H = 70;
    const NODE_PAD = 14;
    const NODE_HEADER = 40;

    let cursorY = PAD;

    // Control Plane
    const cpX = PAD;
    const cpY = cursorY;
    cursorY += CP_H + 20;

    // Compute each worker node box
    type NsLayout = { name: string; x: number; y: number; w: number; h: number; resources: K8sResource[] };
    type NodeLayout = { name: string; x: number; y: number; w: number; h: number; taints: string[]; status: string; nsBoxes: NsLayout[] };

    const nodeLayouts: NodeLayout[] = [];
    const nodesStartY = cursorY;
    let nodesMaxW = CP_W;

    // Lay out nodes side by side
    let nodeX = PAD;
    for (const nd of nodeData) {
      const nsBoxes: NsLayout[] = [];
      let innerY = NODE_HEADER;
      const nsW = COLS * (CARD_W + GAP) + NS_PAD * 2 - GAP;

      for (const [nsName, nsRes] of nd.namespaces) {
        const rows = Math.ceil(nsRes.length / COLS) || 1;
        const nsH = NS_PAD + 20 + rows * (CARD_H + GAP) - GAP + NS_PAD;
        nsBoxes.push({ name: nsName, x: NODE_PAD, y: innerY, w: nsW, h: nsH, resources: nsRes });
        innerY += nsH + GAP;
      }

      const nodeW = nsW + NODE_PAD * 2;
      const nodeH = nd.namespaces.length > 0 ? innerY + NODE_PAD - GAP : NODE_HEADER + 20;

      nodeLayouts.push({
        name: nd.node.name,
        x: nodeX,
        y: nodesStartY,
        w: nodeW,
        h: nodeH,
        taints: nd.taints,
        status: nd.status,
        nsBoxes,
      });
      nodeX += nodeW + GAP;
    }

    nodesMaxW = Math.max(nodesMaxW, nodeX - GAP - PAD);
    const maxNodeH = nodeLayouts.reduce((m, n) => Math.max(m, n.h), 0);
    // Equalize node heights
    for (const nl of nodeLayouts) nl.h = maxNodeH;

    cursorY = nodesStartY + maxNodeH + 20;

    // Cluster-scoped resources
    type CsLayout = { resource: K8sResource; x: number; y: number };
    const csLayouts: CsLayout[] = [];
    if (clusterScoped.length > 0) {
      let csX = PAD;
      const csStartY = cursorY + 16;
      let csY = csStartY;
      for (const r of clusterScoped) {
        if (csX + CARD_W > nodesMaxW + PAD * 2) {
          csX = PAD;
          csY += CARD_H + GAP;
        }
        csLayouts.push({ resource: r, x: csX, y: csY });
        csX += CARD_W + GAP;
      }
      cursorY = csY + CARD_H + PAD;
    }

    const totalW = Math.max(nodesMaxW + PAD * 2, CP_W + PAD * 2, 520);
    const totalH = Math.max(cursorY + PAD, 280);

    return { totalW, totalH, cpX, cpY, CP_W, CP_H, nodeLayouts, csLayouts };
  }, [nodeData, clusterScoped]);

  // Zoom/pan handlers
  const zoomIn = useCallback(() => setZoom(z => Math.min(3, z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(0.15, z - 0.15)), []);
  const resetView = useCallback(() => { setZoom(0.85); setPan({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(0.15, z + (e.deltaY > 0 ? -0.08 : 0.08))));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      setPan(p => ({ x: p.x + e.clientX - lastMouse.current.x, y: p.y + e.clientY - lastMouse.current.y }));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isPanning.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  function renderCard(r: K8sResource, x: number, y: number) {
    const style = RESOURCE_STYLE[r.type] || RESOURCE_STYLE.pod;
    const label = r.name.length > 13 ? r.name.slice(0, 12) + '…' : r.name;
    const status = r.metadata.status as string | undefined;
    return (
      <g key={r.id}>
        <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={7} fill={style.bg} stroke={style.border} strokeWidth={1.5} />
        <text x={x + 10} y={y + 18} fontSize={13}>{style.emoji}</text>
        <text x={x + 28} y={y + 18} fill={style.text} fontSize={9.5} fontWeight={600} fontFamily="system-ui">{label}</text>
        <text x={x + 10} y={y + 34} fill="#64748b" fontSize={7.5} fontFamily="system-ui">{r.type}</text>
        {status && (
          <text x={x + CARD_W - 8} y={y + 34} fill={status === 'Running' ? '#10b981' : status.includes('Disabled') ? '#ef4444' : '#f59e0b'} fontSize={7.5} textAnchor="end" fontFamily="system-ui">● {status}</text>
        )}
      </g>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 border-l border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs">☸️</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cluster View</span>
          <span className="text-xs text-gray-600">{userResourceCount} resource{userResourceCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700">−</button>
          <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} className="w-6 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700">+</button>
          <button onClick={resetView} className="ml-1 px-2 h-6 flex items-center justify-center text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700">⟲</button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing" onWheel={handleWheel} onMouseDown={handleMouseDown}>
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="0.5" fill="#1e293b" />
            </pattern>
          </defs>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <rect width={layout.totalW} height={layout.totalH} fill="url(#grid)" />

            {/* Cluster boundary */}
            <rect x={4} y={4} width={layout.totalW - 8} height={layout.totalH - 8} rx={14} fill="none" stroke="#334155" strokeWidth={2} strokeDasharray="8 4" />
            <text x={14} y={20} fill="#475569" fontSize={10} fontWeight={700} fontFamily="system-ui">☸️ KUBERNETES CLUSTER</text>

            {/* Control Plane */}
            <rect x={layout.cpX} y={layout.cpY} width={layout.CP_W} height={layout.CP_H} rx={10} fill="#0f172a" stroke="#6366f1" strokeWidth={1.5} />
            <text x={layout.cpX + 12} y={layout.cpY + 18} fill="#a78bfa" fontSize={10} fontWeight={700} fontFamily="system-ui">🧠 Control Plane (Master)</text>
            {['API Server', 'etcd', 'Scheduler', 'Controller Mgr'].map((comp, i) => {
              const cx = layout.cpX + 12 + i * 120;
              const cy = layout.cpY + 30;
              return (
                <g key={comp}>
                  <rect x={cx} y={cy} width={110} height={26} rx={6} fill="#1e1b4b" stroke="#4f46e5" strokeWidth={1} />
                  <text x={cx + 55} y={cy + 17} fill="#818cf8" fontSize={9} fontFamily="system-ui" textAnchor="middle">{comp}</text>
                </g>
              );
            })}

            {/* Worker Nodes */}
            {layout.nodeLayouts.map(n => (
              <g key={n.name}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10} fill="#0c1222" stroke={n.status.includes('Disabled') ? '#ef4444' : '#0ea5e9'} strokeWidth={1.5} />
                <text x={n.x + 12} y={n.y + 18} fill={n.status.includes('Disabled') ? '#fca5a5' : '#7dd3fc'} fontSize={10} fontWeight={700} fontFamily="system-ui">
                  🖥️ {n.name} (Worker)
                </text>
                <text x={n.x + n.w - 12} y={n.y + 18} fill={n.status === 'Ready' ? '#10b981' : '#ef4444'} fontSize={8} textAnchor="end" fontFamily="system-ui">● {n.status}</text>
                {n.taints.length > 0 && (
                  <text x={n.x + 12} y={n.y + 32} fill="#f59e0b" fontSize={7.5} fontFamily="system-ui">⚠️ Taints: {n.taints.join(', ')}</text>
                )}

                {/* Namespace boxes inside this node */}
                {n.nsBoxes.map(ns => (
                  <g key={ns.name}>
                    <rect x={n.x + ns.x} y={n.y + ns.y} width={ns.w} height={ns.h} rx={8} fill="rgba(99,102,241,0.05)" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2" />
                    <text x={n.x + ns.x + NS_PAD} y={n.y + ns.y + 14} fill="#a78bfa" fontSize={9} fontWeight={600} fontFamily="system-ui">📁 ns/{ns.name}</text>
                    {ns.resources.map((r, i) => {
                      const col = i % COLS;
                      const row = Math.floor(i / COLS);
                      const rx = n.x + ns.x + NS_PAD + col * (CARD_W + GAP);
                      const ry = n.y + ns.y + 20 + NS_PAD + row * (CARD_H + GAP);
                      return renderCard(r, rx, ry);
                    })}
                  </g>
                ))}

                {/* Empty node message */}
                {n.nsBoxes.length === 0 && (
                  <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} fill="#1e293b" fontSize={9} textAnchor="middle" fontFamily="system-ui">no workloads scheduled</text>
                )}
              </g>
            ))}

            {/* Cluster-scoped resources */}
            {layout.csLayouts.length > 0 && (
              <>
                <text x={layout.csLayouts[0].x} y={layout.csLayouts[0].y - 8} fill="#475569" fontSize={9} fontWeight={600} fontFamily="system-ui">🌍 Cluster-Scoped Resources</text>
                {layout.csLayouts.map(({ resource, x, y }) => renderCard(resource, x, y))}
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
