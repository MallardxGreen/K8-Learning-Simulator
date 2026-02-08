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

const NODE_W = 140;
const NODE_H = 50;
const GAP = 16;
const NS_PAD = 16;
const COLS_PER_NS = 3;

// Cluster-scoped resource types (not inside a namespace)
const CLUSTER_SCOPED = new Set(['namespace', 'node', 'persistentvolume', 'clusterrole', 'clusterrolebinding']);

export default function LiveDiagram({ cluster }: LiveDiagramProps) {
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Separate resources
  const nodes = cluster.resources.filter(r => r.type === 'node');
  const namespaces = cluster.resources.filter(r => r.type === 'namespace');
  const clusterScoped = cluster.resources.filter(r => CLUSTER_SCOPED.has(r.type) && r.type !== 'node' && r.type !== 'namespace');
  const namespacedRes = cluster.resources.filter(r => !CLUSTER_SCOPED.has(r.type));

  // Group namespaced resources by namespace
  const byNamespace = useMemo(() => {
    const map: Record<string, K8sResource[]> = {};
    for (const ns of namespaces) {
      map[ns.name] = [];
    }
    for (const r of namespacedRes) {
      const ns = r.namespace || 'default';
      if (!map[ns]) map[ns] = [];
      map[ns].push(r);
    }
    return map;
  }, [namespaces, namespacedRes]);

  // Only show namespaces that have user resources (or are non-system)
  const visibleNamespaces = useMemo(() => {
    return Object.entries(byNamespace)
      .filter(([name, res]) => res.length > 0 || (name !== 'kube-system'))
      .sort(([a], [b]) => {
        if (a === 'default') return -1;
        if (b === 'default') return 1;
        return a.localeCompare(b);
      });
  }, [byNamespace]);

  const userResourceCount = namespacedRes.length + clusterScoped.length;

  // Layout computation
  const layout = useMemo(() => {
    const CONTROL_PLANE_H = 70;
    const CONTROL_PLANE_W = 500;
    const CLUSTER_PAD = 20;
    const NODE_BOX_PAD = 16;

    let totalW = 0;
    let totalH = 0;

    // Control plane at top
    const cpX = CLUSTER_PAD;
    const cpY = CLUSTER_PAD;
    totalW = Math.max(totalW, cpX + CONTROL_PLANE_W + CLUSTER_PAD);
    totalH = cpY + CONTROL_PLANE_H + 20;

    // Worker nodes side by side below control plane
    const nodesStartY = totalH;
    const nodeLayouts: { name: string; x: number; y: number; w: number; h: number; taints: string[]; status: string }[] = [];

    // Calculate namespace boxes for each node (we distribute namespaces across nodes)
    // For simplicity: all namespaces go inside a "worker nodes" area
    // Each namespace is a box containing its resources in a grid

    const nsLayouts: { name: string; x: number; y: number; w: number; h: number; resources: K8sResource[] }[] = [];

    let nsX = CLUSTER_PAD + NODE_BOX_PAD + 12;
    let nsY = nodesStartY + 50; // leave room for node header
    let maxNsRowH = 0;
    const maxRowW = 800;

    for (const [nsName, nsRes] of visibleNamespaces) {
      const rows = Math.ceil(nsRes.length / COLS_PER_NS) || 1;
      const nsW = COLS_PER_NS * (NODE_W + GAP) + NS_PAD * 2 - GAP;
      const nsH = NS_PAD * 2 + 24 + rows * (NODE_H + GAP) - GAP;

      if (nsX + nsW > maxRowW) {
        nsX = CLUSTER_PAD + NODE_BOX_PAD + 12;
        nsY += maxNsRowH + GAP;
        maxNsRowH = 0;
      }

      nsLayouts.push({ name: nsName, x: nsX, y: nsY, w: nsW, h: nsH, resources: nsRes });
      maxNsRowH = Math.max(maxNsRowH, nsH);
      nsX += nsW + GAP;
      totalW = Math.max(totalW, nsX + CLUSTER_PAD);
    }

    const nsEndY = nsY + maxNsRowH + NODE_BOX_PAD;

    // Worker node boxes encompass the namespace area
    const nodeAreaW = Math.max(totalW - CLUSTER_PAD * 2, CONTROL_PLANE_W);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const nW = (nodeAreaW - GAP * (nodes.length - 1)) / nodes.length;
      const nX = CLUSTER_PAD + i * (nW + GAP);
      const nH = nsEndY - nodesStartY + 10;
      const taints = Array.isArray(n.metadata.taints) ? (n.metadata.taints as string[]) : [];
      nodeLayouts.push({
        name: n.name,
        x: nX,
        y: nodesStartY,
        w: nW,
        h: nH,
        taints,
        status: (n.metadata.status as string) || 'Ready',
      });
    }

    totalW = Math.max(totalW, CLUSTER_PAD * 2 + nodeAreaW);
    totalH = nsEndY + 20;

    // Cluster-scoped resources below nodes
    let csY = totalH;
    const csLayouts: { resource: K8sResource; x: number; y: number }[] = [];
    if (clusterScoped.length > 0) {
      let csX = CLUSTER_PAD;
      for (const r of clusterScoped) {
        if (csX + NODE_W > totalW - CLUSTER_PAD) {
          csX = CLUSTER_PAD;
          csY += NODE_H + GAP;
        }
        csLayouts.push({ resource: r, x: csX, y: csY });
        csX += NODE_W + GAP;
      }
      totalH = csY + NODE_H + CLUSTER_PAD;
    }

    return {
      totalW: Math.max(totalW, 560),
      totalH: Math.max(totalH, 300),
      cpX, cpY, CONTROL_PLANE_W, CONTROL_PLANE_H,
      nodeLayouts,
      nsLayouts,
      csLayouts,
    };
  }, [nodes, visibleNamespaces, clusterScoped]);

  // Zoom/pan handlers
  const zoomIn = useCallback(() => setZoom(z => Math.min(3, z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(0.15, z - 0.15)), []);
  const resetView = useCallback(() => { setZoom(0.75); setPan({ x: 0, y: 0 }); }, []);

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

  // Helper to render a resource card
  function renderResource(r: K8sResource, x: number, y: number) {
    const style = RESOURCE_STYLE[r.type] || RESOURCE_STYLE.pod;
    const displayName = r.name.length > 14 ? r.name.slice(0, 13) + '…' : r.name;
    const status = r.metadata.status as string | undefined;
    return (
      <g key={r.id}>
        <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8} fill={style.bg} stroke={style.border} strokeWidth={1.5} />
        <text x={x + 12} y={y + 20} fontSize={14}>{style.emoji}</text>
        <text x={x + 32} y={y + 20} fill={style.text} fontSize={10} fontWeight={600} fontFamily="system-ui">{displayName}</text>
        <text x={x + 12} y={y + 38} fill="#64748b" fontSize={8} fontFamily="system-ui">{r.type}</text>
        {status && (
          <text x={x + NODE_W - 10} y={y + 38} fill={status === 'Running' ? '#10b981' : status.includes('Disabled') ? '#ef4444' : '#f59e0b'} fontSize={8} textAnchor="end" fontFamily="system-ui">● {status}</text>
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
      <div
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="0.5" fill="#1e293b" />
            </pattern>
          </defs>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Background grid */}
            <rect width={layout.totalW} height={layout.totalH} fill="url(#grid)" />

            {/* ═══ CLUSTER BOUNDARY ═══ */}
            <rect x={4} y={4} width={layout.totalW - 8} height={layout.totalH - 8} rx={16} fill="none" stroke="#334155" strokeWidth={2} strokeDasharray="8 4" />
            <text x={16} y={22} fill="#475569" fontSize={11} fontWeight={700} fontFamily="system-ui">☸️ KUBERNETES CLUSTER</text>

            {/* ═══ CONTROL PLANE ═══ */}
            <rect x={layout.cpX} y={layout.cpY} width={layout.CONTROL_PLANE_W} height={layout.CONTROL_PLANE_H} rx={12} fill="#0f172a" stroke="#6366f1" strokeWidth={1.5} />
            <text x={layout.cpX + 14} y={layout.cpY + 20} fill="#a78bfa" fontSize={11} fontWeight={700} fontFamily="system-ui">🧠 Control Plane (Master)</text>
            {/* Control plane components */}
            {['API Server', 'etcd', 'Scheduler', 'Controller Mgr'].map((comp, i) => {
              const cx = layout.cpX + 14 + i * 120;
              const cy = layout.cpY + 32;
              return (
                <g key={comp}>
                  <rect x={cx} y={cy} width={108} height={26} rx={6} fill="#1e1b4b" stroke="#4f46e5" strokeWidth={1} />
                  <text x={cx + 54} y={cy + 17} fill="#818cf8" fontSize={9} fontFamily="system-ui" textAnchor="middle">{comp}</text>
                </g>
              );
            })}

            {/* ═══ WORKER NODES ═══ */}
            {layout.nodeLayouts.map(n => (
              <g key={n.name}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={12} fill="#0c1222" stroke={n.status.includes('Disabled') ? '#ef4444' : '#0ea5e9'} strokeWidth={1.5} />
                <text x={n.x + 14} y={n.y + 20} fill={n.status.includes('Disabled') ? '#fca5a5' : '#7dd3fc'} fontSize={11} fontWeight={700} fontFamily="system-ui">
                  🖥️ {n.name} (Worker Node)
                </text>
                <text x={n.x + n.w - 14} y={n.y + 20} fill={n.status === 'Ready' ? '#10b981' : '#ef4444'} fontSize={9} textAnchor="end" fontFamily="system-ui">
                  ● {n.status}
                </text>
                {n.taints.length > 0 && (
                  <text x={n.x + 14} y={n.y + 34} fill="#f59e0b" fontSize={8} fontFamily="system-ui">
                    ⚠️ Taints: {n.taints.join(', ')}
                  </text>
                )}
              </g>
            ))}

            {/* ═══ NAMESPACE BOXES ═══ */}
            {layout.nsLayouts.map(ns => (
              <g key={ns.name}>
                <rect x={ns.x} y={ns.y} width={ns.w} height={ns.h} rx={10} fill="#0f172a" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2" opacity={0.8} />
                <text x={ns.x + NS_PAD} y={ns.y + 16} fill="#a78bfa" fontSize={10} fontWeight={600} fontFamily="system-ui">
                  📁 ns/{ns.name}
                </text>
                {/* Resources inside namespace */}
                {ns.resources.map((r, i) => {
                  const col = i % COLS_PER_NS;
                  const row = Math.floor(i / COLS_PER_NS);
                  const rx = ns.x + NS_PAD + col * (NODE_W + GAP);
                  const ry = ns.y + 24 + NS_PAD + row * (NODE_H + GAP);
                  return renderResource(r, rx, ry);
                })}
                {ns.resources.length === 0 && (
                  <text x={ns.x + ns.w / 2} y={ns.y + ns.h / 2 + 8} fill="#334155" fontSize={9} textAnchor="middle" fontFamily="system-ui">(empty)</text>
                )}
              </g>
            ))}

            {/* ═══ CLUSTER-SCOPED RESOURCES ═══ */}
            {layout.csLayouts.length > 0 && (
              <>
                <text x={layout.csLayouts[0].x} y={layout.csLayouts[0].y - 8} fill="#475569" fontSize={10} fontWeight={600} fontFamily="system-ui">
                  🌍 Cluster-Scoped Resources
                </text>
                {layout.csLayouts.map(({ resource, x, y }) => renderResource(resource, x, y))}
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
