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

const CARD_W = 140;
const CARD_H = 50;
const GAP = 16;
const NS_PAD = 16;
const COLS = 2;

// Ownership hierarchy types
const OWNER_TYPES = new Set(['deployment', 'statefulset', 'daemonset', 'job', 'cronjob', 'replicaset']);

interface ResourceTree {
  resource: K8sResource;
  children: ResourceTree[];
}

/** Build ownership trees from a flat list of resources. Returns root-level trees + orphans. */
function buildOwnershipTrees(resources: K8sResource[]): { trees: ResourceTree[]; orphans: K8sResource[] } {
  const byId = new Map<string, K8sResource>();
  for (const r of resources) byId.set(r.id, r);

  // Build parent→children map
  const childrenOf = new Map<string, K8sResource[]>();
  const hasParent = new Set<string>();

  for (const r of resources) {
    const parentId = r.metadata.managedBy as string | undefined;
    if (parentId && byId.has(parentId)) {
      hasParent.add(r.id);
      if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
      childrenOf.get(parentId)!.push(r);
    }
  }

  function buildTree(r: K8sResource): ResourceTree {
    const kids = childrenOf.get(r.id) || [];
    return { resource: r, children: kids.map(buildTree) };
  }

  const trees: ResourceTree[] = [];
  const orphans: K8sResource[] = [];

  for (const r of resources) {
    if (hasParent.has(r.id)) continue; // skip children, they'll be nested
    if (OWNER_TYPES.has(r.type) && childrenOf.has(r.id)) {
      trees.push(buildTree(r));
    } else {
      orphans.push(r);
    }
  }

  return { trees, orphans };
}

// Tooltip descriptions for resource types and control plane components
const RESOURCE_INFO: Record<string, string> = {
  pod: 'Pod — The smallest deployable unit in K8s. Runs one or more containers sharing network and storage.',
  deployment: 'Deployment — Manages ReplicaSets and provides declarative updates for Pods. Supports rolling updates and rollbacks.',
  replicaset: 'ReplicaSet — Ensures a specified number of pod replicas are running at all times.',
  statefulset: 'StatefulSet — Like a Deployment but for stateful apps. Provides stable network IDs and persistent storage.',
  daemonset: 'DaemonSet — Ensures a copy of a Pod runs on every (or selected) node. Used for log collectors, monitoring agents.',
  job: 'Job — Creates Pods that run to completion. Used for batch processing and one-off tasks.',
  cronjob: 'CronJob — Creates Jobs on a recurring schedule (like cron). Great for periodic tasks.',
  service: 'Service — Exposes Pods as a network service. Types: ClusterIP, NodePort, LoadBalancer, ExternalName.',
  configmap: 'ConfigMap — Stores non-sensitive configuration data as key-value pairs. Injected into Pods as env vars or volumes.',
  secret: 'Secret — Stores sensitive data (passwords, tokens, keys). Base64-encoded, can be encrypted at rest.',
  ingress: 'Ingress — Manages external HTTP/HTTPS access to Services. Provides routing rules, TLS termination.',
  persistentvolume: 'PersistentVolume (PV) — A piece of cluster storage provisioned by an admin or dynamically.',
  persistentvolumeclaim: 'PersistentVolumeClaim (PVC) — A request for storage by a user. Binds to a PV.',
  serviceaccount: 'ServiceAccount — Provides an identity for processes running in a Pod to interact with the API server.',
  role: 'Role — Defines permissions (verbs on resources) within a specific namespace.',
  clusterrole: 'ClusterRole — Like Role but cluster-wide. Can grant access across all namespaces.',
  rolebinding: 'RoleBinding — Grants a Role to a user or ServiceAccount within a namespace.',
  clusterrolebinding: 'ClusterRoleBinding — Grants a ClusterRole to a user or ServiceAccount cluster-wide.',
  networkpolicy: 'NetworkPolicy — Controls traffic flow between Pods. Acts as a firewall for pod-to-pod communication.',
  namespace: 'Namespace — A virtual cluster within K8s. Used to isolate resources between teams or environments.',
  node: 'Node — A worker machine (VM or physical) that runs Pods. Managed by the control plane.',
};

const CP_INFO: Record<string, string> = {
  'API Server': 'API Server (kube-apiserver) — The front door to K8s. All kubectl commands and internal communication go through here.',
  'etcd': 'etcd — Distributed key-value store that holds all cluster state and configuration. The single source of truth.',
  'Scheduler': 'Scheduler (kube-scheduler) — Watches for new Pods with no assigned node and selects the best node to run them on.',
  'Controller Mgr': 'Controller Manager — Runs controllers (Deployment, ReplicaSet, Node, etc.) that regulate cluster state.',
};

// Cluster-scoped resource types
const CLUSTER_SCOPED = new Set(['namespace', 'node', 'persistentvolume', 'clusterrole', 'clusterrolebinding']);

// Resource types that get scheduled onto worker nodes (only pods actually run on nodes)
const NODE_SCHEDULED = new Set([
  'pod',
]);

// Simple hash to assign a resource to a node index
function assignNode(name: string, nodeCount: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % nodeCount;
}

export default function LiveDiagram({ cluster }: LiveDiagramProps) {
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cpExpanded, setCpExpanded] = useState(false);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Categorize resources
  const nodes = cluster.resources.filter(r => r.type === 'node');
  const clusterScoped = cluster.resources.filter(r => CLUSTER_SCOPED.has(r.type) && r.type !== 'node' && r.type !== 'namespace');
  // Workloads go inside worker nodes
  const workloadRes = cluster.resources.filter(r => NODE_SCHEDULED.has(r.type));
  // Namespace-level API objects (services, configmaps, secrets, etc.) — not scheduled on nodes
  const nsLevelRes = cluster.resources.filter(r => !CLUSTER_SCOPED.has(r.type) && !NODE_SCHEDULED.has(r.type));

  const userResourceCount = workloadRes.length + nsLevelRes.length + clusterScoped.length;

  // Assign workload resources to worker nodes, grouped by node → namespace
  // Only assign root-level resources (not children) to nodes — children follow their parent
  const nodeData = useMemo(() => {
    if (nodes.length === 0) return [];

    // Identify which resources are children (have a parent in the resource list)
    const allIds = new Set(workloadRes.map(r => r.id));
    const childIds = new Set<string>();
    for (const r of workloadRes) {
      const parentId = r.metadata.managedBy as string | undefined;
      if (parentId && allIds.has(parentId)) childIds.add(r.id);
    }

    // Build: nodeIndex → nsName → resources[]
    const map: Map<number, Map<string, K8sResource[]>> = new Map();
    for (let i = 0; i < nodes.length; i++) map.set(i, new Map());

    // Assign root resources to nodes
    const rootResources = workloadRes.filter(r => !childIds.has(r.id));
    const rootNodeAssignment = new Map<string, number>();

    for (const r of rootResources) {
      const ni = assignNode(r.name, nodes.length);
      rootNodeAssignment.set(r.id, ni);
      const nsName = r.namespace || 'default';
      const nodeMap = map.get(ni)!;
      if (!nodeMap.has(nsName)) nodeMap.set(nsName, []);
      nodeMap.get(nsName)!.push(r);
    }

    // Now assign children to the same node as their root ancestor
    function findRootAncestor(r: K8sResource): string {
      const parentId = r.metadata.managedBy as string | undefined;
      if (!parentId || !allIds.has(parentId)) return r.id;
      const parent = workloadRes.find(p => p.id === parentId);
      return parent ? findRootAncestor(parent) : r.id;
    }

    for (const r of workloadRes) {
      if (childIds.has(r.id)) {
        const rootId = findRootAncestor(r);
        const ni = rootNodeAssignment.get(rootId) ?? assignNode(r.name, nodes.length);
        const nsName = r.namespace || 'default';
        const nodeMap = map.get(ni)!;
        if (!nodeMap.has(nsName)) nodeMap.set(nsName, []);
        nodeMap.get(nsName)!.push(r);
      }
    }

    return nodes.map((n, i) => {
      const nsMap = map.get(i)!;
      const taints = Array.isArray(n.metadata.taints) ? (n.metadata.taints as string[]) : [];
      const status = (n.metadata.status as string) || 'Ready';
      const nsList = [...nsMap.entries()]
        .filter(([, res]) => res.length > 0)
        .sort(([a], [b]) => {
          if (a === 'default') return -1;
          if (b === 'default') return 1;
          return a.localeCompare(b);
        });
      return { node: n, taints, status, namespaces: nsList };
    });
  }, [nodes, workloadRes]);

  // Measure the height of a tree group (parent card + children laid out in a row)
  const GROUP_PAD = 10;
  const GROUP_HEADER = 30;
  const CHILD_GAP = 10;

  function measureTree(tree: ResourceTree): { w: number; h: number } {
    if (tree.children.length === 0) {
      return { w: CARD_W, h: CARD_H };
    }
    // For trees with nested children (e.g. Deployment → RS → Pods), measure recursively
    const childSizes = tree.children.map(c => measureTree(c));
    const childrenW = childSizes.reduce((sum, s) => sum + s.w + CHILD_GAP, -CHILD_GAP);
    const childrenH = Math.max(...childSizes.map(s => s.h));
    const w = Math.max(CARD_W + GROUP_PAD * 2, childrenW + GROUP_PAD * 2);
    const h = GROUP_HEADER + childrenH + GROUP_PAD * 2;
    return { w, h };
  }

  // Layout computation
  const layout = useMemo(() => {
    const PAD = 28;
    const CP_W = 520;
    const CP_H = cpExpanded ? 220 : 76;
    const NODE_PAD = 18;
    const NODE_HEADER = 46;

    let cursorY = PAD;

    // Control Plane
    const cpX = PAD;
    const cpY = cursorY;
    cursorY += CP_H + 28;

    // Compute each worker node box
    type NsLayout = { name: string; x: number; y: number; w: number; h: number; trees: ResourceTree[]; orphans: K8sResource[] };
    type NodeLayout = { name: string; x: number; y: number; w: number; h: number; taints: string[]; status: string; nsBoxes: NsLayout[] };

    const nodeLayouts: NodeLayout[] = [];
    const nodesStartY = cursorY;
    let nodesMaxW = CP_W;

    // Lay out nodes side by side
    let nodeX = PAD;
    for (const nd of nodeData) {
      const nsBoxes: NsLayout[] = [];
      let innerY = NODE_HEADER;

      for (const [nsName, nsRes] of nd.namespaces) {
        const { trees, orphans } = buildOwnershipTrees(nsRes);

        // Calculate namespace box width: max of tree widths or default 2-col width
        const defaultNsW = COLS * (CARD_W + GAP) + NS_PAD * 2 - GAP;
        const treeSizes = trees.map(t => measureTree(t));
        const maxTreeW = treeSizes.length > 0 ? Math.max(...treeSizes.map(s => s.w)) : 0;
        const nsW = Math.max(defaultNsW, maxTreeW + NS_PAD * 2);

        // Calculate height: trees stacked vertically, then orphans in grid below
        let contentH = 24; // namespace label
        for (const size of treeSizes) {
          contentH += size.h + GAP;
        }
        // Orphans in 2-col grid
        if (orphans.length > 0) {
          const orphanRows = Math.ceil(orphans.length / COLS);
          contentH += orphanRows * (CARD_H + GAP);
        }
        // Remove trailing gap, add padding
        if (trees.length > 0 || orphans.length > 0) contentH -= GAP;
        const nsH = NS_PAD + contentH + NS_PAD;

        nsBoxes.push({ name: nsName, x: NODE_PAD, y: innerY, w: nsW, h: nsH, trees, orphans });
        innerY += nsH + GAP;
      }

      const defaultNsW = COLS * (CARD_W + GAP) + NS_PAD * 2 - GAP;
      const maxNsW = nsBoxes.length > 0 ? Math.max(...nsBoxes.map(b => b.w)) : defaultNsW;
      // Equalize namespace widths within a node
      for (const b of nsBoxes) b.w = maxNsW;

      const nodeW = maxNsW + NODE_PAD * 2;
      const nodeH = nd.namespaces.length > 0 ? innerY + NODE_PAD : NODE_HEADER + 28;

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
    for (const nl of nodeLayouts) nl.h = maxNodeH;

    cursorY = nodesStartY + maxNodeH + 20;

    // Namespace-level API objects (deployments, replicasets, services, configmaps, secrets, etc.)
    type NsLevelLayout = { nsName: string; x: number; y: number; w: number; h: number; trees: ResourceTree[]; orphans: K8sResource[] };
    const nsLevelLayouts: NsLevelLayout[] = [];
    if (nsLevelRes.length > 0) {
      // Group by namespace
      const byNs = new Map<string, K8sResource[]>();
      for (const r of nsLevelRes) {
        const ns = r.namespace || 'default';
        if (!byNs.has(ns)) byNs.set(ns, []);
        byNs.get(ns)!.push(r);
      }
      cursorY += 20;
      const nsCols = 4;
      for (const [nsName, resources] of [...byNs.entries()].sort(([a], [b]) => a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b))) {
        const { trees, orphans } = buildOwnershipTrees(resources);
        const treeSizes = trees.map(t => measureTree(t));
        const maxTreeW = treeSizes.length > 0 ? Math.max(...treeSizes.map(s => s.w)) : 0;
        const orphanColW = nsCols * (CARD_W + GAP) - GAP;
        const boxW = Math.max(nodesMaxW, maxTreeW + NS_PAD * 2, orphanColW + NS_PAD * 2);

        let contentH = 24; // namespace label
        for (const size of treeSizes) {
          contentH += size.h + GAP;
        }
        if (orphans.length > 0) {
          const orphanRows = Math.ceil(orphans.length / nsCols);
          contentH += orphanRows * (CARD_H + GAP);
        }
        if (trees.length > 0 || orphans.length > 0) contentH -= GAP;
        const boxH = NS_PAD + contentH + NS_PAD;

        nsLevelLayouts.push({ nsName, x: PAD, y: cursorY, w: boxW, h: boxH, trees, orphans });
        cursorY += boxH + GAP;
      }
    }

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

    return { totalW, totalH, cpX, cpY, CP_W, CP_H, nodeLayouts, nsLevelLayouts, csLayouts };
  }, [nodeData, nsLevelRes, clusterScoped, cpExpanded]);

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
    e.preventDefault();
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

  function renderCard(r: K8sResource, x: number, y: number, w = CARD_W, h = CARD_H) {
    const style = RESOURCE_STYLE[r.type] || RESOURCE_STYLE.pod;
    const maxChars = Math.floor((w - 40) / 6);
    const label = r.name.length > maxChars ? r.name.slice(0, maxChars - 1) + '…' : r.name;
    const status = r.metadata.status as string | undefined;
    const info = RESOURCE_INFO[r.type] || r.type;
    const tooltip = `${r.name} (${r.type})${r.namespace ? ` in ns/${r.namespace}` : ''}\n\n${info}`;
    return (
      <g key={r.id} style={{ cursor: 'pointer' }}>
        <title>{tooltip}</title>
        <rect x={x} y={y} width={w} height={h} rx={7} fill={style.bg} stroke={style.border} strokeWidth={1.5} />
        <text x={x + 10} y={y + (h / 2) - 4} fontSize={14}>{style.emoji}</text>
        <text x={x + 30} y={y + (h / 2) - 4} fill={style.text} fontSize={10} fontWeight={600} fontFamily="system-ui">{label}</text>
        <text x={x + 10} y={y + (h / 2) + 10} fill="#64748b" fontSize={8} fontFamily="system-ui">{r.type}</text>
        {status && (
          <text x={x + w - 8} y={y + (h / 2) + 10} fill={status === 'Running' ? '#10b981' : status.includes('Disabled') ? '#ef4444' : '#f59e0b'} fontSize={8} textAnchor="end" fontFamily="system-ui">● {status}</text>
        )}
      </g>
    );
  }

  function renderTree(tree: ResourceTree, x: number, y: number): React.ReactElement {
    const r = tree.resource;
    const style = RESOURCE_STYLE[r.type] || RESOURCE_STYLE.pod;

    if (tree.children.length === 0) {
      return renderCard(r, x, y);
    }

    const size = measureTree(tree);
    const info = RESOURCE_INFO[r.type] || r.type;
    const tooltip = `${r.name} (${r.type})${r.namespace ? ` in ns/${r.namespace}` : ''}\n\n${info}`;

    // Render as a group box: dashed border with parent label, children inside
    return (
      <g key={r.id}>
        <title>{tooltip}</title>
        {/* Group box */}
        <rect
          x={x} y={y} width={size.w} height={size.h}
          rx={9} fill={`${style.bg}44`}
          stroke={style.border} strokeWidth={1.5} strokeDasharray="6 3"
        />
        {/* Parent label row */}
        <text x={x + GROUP_PAD + 2} y={y + 20} fontSize={12}>{style.emoji}</text>
        <text x={x + GROUP_PAD + 20} y={y + 20} fill={style.text} fontSize={10} fontWeight={700} fontFamily="system-ui">
          {r.name}
        </text>
        <text x={x + size.w - GROUP_PAD} y={y + 20} fill="#64748b" fontSize={8} textAnchor="end" fontFamily="system-ui">
          {r.type}
        </text>
        {/* Children laid out horizontally */}
        {tree.children.map((child, i) => {
          const childSize = measureTree(child);
          const prevWidths = tree.children.slice(0, i).reduce((sum, c) => sum + measureTree(c).w + CHILD_GAP, 0);
          const cx = x + GROUP_PAD + prevWidths;
          const cy = y + GROUP_HEADER + GROUP_PAD;
          if (child.children.length > 0) {
            return renderTree(child, cx, cy);
          }
          return renderCard(child.resource, cx, cy, childSize.w, childSize.h);
        })}
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
            <g style={{ cursor: 'pointer' }} onClick={() => setCpExpanded(e => !e)}>
              <title>Control Plane (Master Node) — Click to {cpExpanded ? 'collapse' : 'expand'}. The brain of the cluster.</title>
              <text x={layout.cpX + 14} y={layout.cpY + 20} fill="#a78bfa" fontSize={10} fontWeight={700} fontFamily="system-ui">
                {cpExpanded ? '▼' : '▶'} 🧠 Control Plane (Master)
              </text>
              <text x={layout.cpX + layout.CP_W - 14} y={layout.cpY + 20} fill="#6366f1" fontSize={9} textAnchor="end" fontFamily="system-ui">
                {cpExpanded ? 'click to collapse' : 'click to expand'}
              </text>
            </g>
            {!cpExpanded && ['API Server', 'etcd', 'Scheduler', 'Controller Mgr'].map((comp, i) => {
              const cx = layout.cpX + 14 + i * 124;
              const cy = layout.cpY + 32;
              return (
                <g key={comp} style={{ cursor: 'pointer' }}>
                  <title>{CP_INFO[comp]}</title>
                  <rect x={cx} y={cy} width={114} height={28} rx={6} fill="#1e1b4b" stroke="#4f46e5" strokeWidth={1} />
                  <text x={cx + 57} y={cy + 18} fill="#818cf8" fontSize={9} fontFamily="system-ui" textAnchor="middle">{comp}</text>
                </g>
              );
            })}
            {cpExpanded && (() => {
              const userRes = cluster.resources.filter(r => r.type !== 'node');
              const typeCounts = new Map<string, number>();
              for (const r of userRes) typeCounts.set(r.type, (typeCounts.get(r.type) || 0) + 1);
              const compCards = [
                { name: 'API Server', icon: '🔌', desc: 'REST API gateway', color: '#6366f1' },
                { name: 'Scheduler', icon: '📋', desc: 'Pod placement', color: '#0ea5e9' },
                { name: 'Controller Mgr', icon: '⚙️', desc: 'State reconciliation', color: '#10b981' },
                { name: 'etcd', icon: '💾', desc: `${userRes.length} objects stored`, color: '#f59e0b' },
              ];
              return (
                <>
                  {compCards.map((comp, i) => {
                    const cx = layout.cpX + 14 + (i % 2) * 250;
                    const cy = layout.cpY + 32 + Math.floor(i / 2) * 56;
                    const isEtcd = comp.name === 'etcd';
                    return (
                      <g key={comp.name} style={{ cursor: 'pointer' }}>
                        <title>{CP_INFO[comp.name]}</title>
                        <rect x={cx} y={cy} width={236} height={isEtcd ? 48 : 42} rx={8} fill="#1e1b4b" stroke={comp.color} strokeWidth={1.5} />
                        <text x={cx + 12} y={cy + 18} fill={comp.color} fontSize={11} fontWeight={700} fontFamily="system-ui">{comp.icon} {comp.name}</text>
                        <text x={cx + 12} y={cy + 32} fill="#94a3b8" fontSize={9} fontFamily="system-ui">{comp.desc}</text>
                        {isEtcd && (
                          <text x={cx + 12} y={cy + 44} fill="#64748b" fontSize={8} fontFamily="system-ui">
                            {[...typeCounts.entries()].map(([t, n]) => `${t}:${n}`).join('  ')}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </>
              );
            })()}

            {/* Worker Nodes */}
            {layout.nodeLayouts.map(n => (
              <g key={n.name}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10} fill="#0c1222" stroke={n.status.includes('Disabled') ? '#ef4444' : '#0ea5e9'} strokeWidth={1.5} />
                <g style={{ cursor: 'pointer' }}>
                  <title>{`${n.name} — Worker Node\nStatus: ${n.status}${n.taints.length > 0 ? '\nTaints: ' + n.taints.join(', ') : ''}\n\n${RESOURCE_INFO.node}`}</title>
                  <text x={n.x + 14} y={n.y + 20} fill={n.status.includes('Disabled') ? '#fca5a5' : '#7dd3fc'} fontSize={10} fontWeight={700} fontFamily="system-ui">
                    🖥️ {n.name} (Worker)
                  </text>
                  <text x={n.x + n.w - 14} y={n.y + 20} fill={n.status === 'Ready' ? '#10b981' : '#ef4444'} fontSize={8} textAnchor="end" fontFamily="system-ui">● {n.status}</text>
                </g>
                {n.taints.length > 0 && (
                  <text x={n.x + 12} y={n.y + 32} fill="#f59e0b" fontSize={7.5} fontFamily="system-ui">⚠️ Taints: {n.taints.join(', ')}</text>
                )}

                {/* Namespace boxes inside this node */}
                {n.nsBoxes.map(ns => (
                  <g key={ns.name}>
                    <rect x={n.x + ns.x} y={n.y + ns.y} width={ns.w} height={ns.h} rx={8} fill="rgba(99,102,241,0.05)" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2" />
                    <g style={{ cursor: 'pointer' }}>
                      <title>{`Namespace: ${ns.name}\n${ns.trees.reduce((s, t) => s + 1 + t.children.length, 0) + ns.orphans.length} resource${ns.trees.length + ns.orphans.length !== 1 ? 's' : ''}\n\n${RESOURCE_INFO.namespace}`}</title>
                      <text x={n.x + ns.x + NS_PAD} y={n.y + ns.y + 16} fill="#a78bfa" fontSize={9} fontWeight={600} fontFamily="system-ui">📁 ns/{ns.name}</text>
                    </g>
                    {/* Render ownership trees */}
                    {(() => {
                      let treeY = 24; // after namespace label
                      return ns.trees.map(tree => {
                        const size = measureTree(tree);
                        const el = renderTree(tree, n.x + ns.x + NS_PAD, n.y + ns.y + NS_PAD + treeY);
                        treeY += size.h + GAP;
                        return el;
                      });
                    })()}
                    {/* Render orphan resources as flat cards */}
                    {(() => {
                      let treeH = 24;
                      for (const tree of ns.trees) {
                        treeH += measureTree(tree).h + GAP;
                      }
                      return ns.orphans.map((r, i) => {
                        const col = i % COLS;
                        const row = Math.floor(i / COLS);
                        const rx = n.x + ns.x + NS_PAD + col * (CARD_W + GAP);
                        const ry = n.y + ns.y + NS_PAD + treeH + row * (CARD_H + GAP);
                        return renderCard(r, rx, ry);
                      });
                    })()}
                  </g>
                ))}

                {/* Empty node message */}
                {n.nsBoxes.length === 0 && (
                  <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} fill="#1e293b" fontSize={9} textAnchor="middle" fontFamily="system-ui">no workloads scheduled</text>
                )}
              </g>
            ))}

            {/* Namespace-level API objects (Deployments, Services, ConfigMaps, Secrets, etc.) */}
            {layout.nsLevelLayouts.length > 0 && (
              <>
                <text x={layout.nsLevelLayouts[0].x} y={layout.nsLevelLayouts[0].y - 8} fill="#475569" fontSize={9} fontWeight={600} fontFamily="system-ui">📦 Namespace Resources (stored in etcd)</text>
                {layout.nsLevelLayouts.map(nl => {
                  const totalRes = nl.trees.reduce((s, t) => {
                    const count = (tree: ResourceTree): number => 1 + tree.children.reduce((a, c) => a + count(c), 0);
                    return s + count(t);
                  }, 0) + nl.orphans.length;
                  return (
                    <g key={nl.nsName}>
                      <rect x={nl.x} y={nl.y} width={nl.w} height={nl.h} rx={8} fill="rgba(99,102,241,0.05)" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2" />
                      <g style={{ cursor: 'pointer' }}>
                        <title>{`Namespace: ${nl.nsName}\n${totalRes} resource${totalRes !== 1 ? 's' : ''}\n\n${RESOURCE_INFO.namespace}`}</title>
                        <text x={nl.x + NS_PAD} y={nl.y + 16} fill="#a78bfa" fontSize={9} fontWeight={600} fontFamily="system-ui">📁 ns/{nl.nsName}</text>
                      </g>
                      {/* Render ownership trees */}
                      {(() => {
                        let treeY = 24;
                        return nl.trees.map(tree => {
                          const size = measureTree(tree);
                          const el = renderTree(tree, nl.x + NS_PAD, nl.y + NS_PAD + treeY);
                          treeY += size.h + GAP;
                          return el;
                        });
                      })()}
                      {/* Render orphan resources as flat cards */}
                      {(() => {
                        let treeH = 24;
                        for (const tree of nl.trees) {
                          treeH += measureTree(tree).h + GAP;
                        }
                        return nl.orphans.map((r, i) => {
                          const col = i % 4;
                          const row = Math.floor(i / 4);
                          const rx = nl.x + NS_PAD + col * (CARD_W + GAP);
                          const ry = nl.y + NS_PAD + treeH + row * (CARD_H + GAP);
                          return renderCard(r, rx, ry);
                        });
                      })()}
                    </g>
                  );
                })}
              </>
            )}

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
