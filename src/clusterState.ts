export interface K8sResource {
  id: string;
  type: string;
  name: string;
  namespace: string;
  labels: Record<string, string>;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface ClusterState {
  resources: K8sResource[];
}

interface CommandResult {
  success: boolean;
  message: string;
  resourcesCreated?: K8sResource[];
  resourcesDeleted?: string[];
}

let nextId = 100;
const genId = () => `res-${nextId++}`;

function createResource(
  type: string, name: string, namespace: string,
  labels: Record<string, string> = {}, metadata: Record<string, unknown> = {}
): K8sResource {
  return { id: genId(), type, name, namespace, labels, metadata, createdAt: Date.now() };
}


/** Normalize a resource type: handle abbreviations and strip trailing 's' for plurals. */
function normalizeType(input: string): string {
  const map: Record<string, string> = {
    pv: 'persistentvolume', pvs: 'persistentvolume',
    pvc: 'persistentvolumeclaim', pvcs: 'persistentvolumeclaim',
    sa: 'serviceaccount', sas: 'serviceaccount',
    svc: 'service', svcs: 'service',
    ns: 'namespace',
    netpol: 'networkpolicy', netpols: 'networkpolicy',
    deploy: 'deployment', deploys: 'deployment',
    ds: 'daemonset', sts: 'statefulset', rs: 'replicaset',
    cm: 'configmap', cms: 'configmap',
    ing: 'ingress', no: 'node', po: 'pod',
    rb: 'rolebinding', crb: 'clusterrolebinding', cr: 'clusterrole',
  };
  if (map[input]) return map[input];
  if (input.endsWith('s') && !input.endsWith('ss')) return input.slice(0, -1);
  return input;
}

const CLUSTER_SCOPED = ['namespace', 'persistentvolume', 'clusterrole', 'clusterrolebinding', 'node'];

export function parseAndExecute(state: ClusterState, input: string): { state: ClusterState; result: CommandResult } {
  const trimmed = input.trim();
  if (!trimmed.startsWith('kubectl')) {
    return { state, result: { success: false, message: `Unknown command. Commands start with "kubectl".` } };
  }

  const tokens = trimmed.split(/\s+/);
  tokens.shift(); // remove 'kubectl'
  const action = tokens.shift();
  const ns = extractFlag(tokens, ['-n', '--namespace']) || 'default';

  switch (action) {
    case 'run': return handleRun(state, tokens, ns);
    case 'create': return handleCreate(state, tokens, ns);
    case 'delete': return handleDelete(state, tokens, ns);
    case 'get': return handleGet(state, tokens, ns);
    case 'expose': return handleExpose(state, tokens, ns);
    case 'scale': return handleScale(state, tokens, ns);
    case 'describe': return handleDescribe(state, tokens, ns);
    case 'rollout': return handleRollout(state, tokens, ns);
    case 'set': return handleSet(state, tokens, ns);
    case 'label': return handleLabel(state, tokens, ns);
    case 'apply': return handleApply(state, tokens, ns);
    case 'auth': return handleAuth(state, tokens, ns);
    case 'taint': return handleTaint(state, tokens);
    case 'cordon': return handleCordon(state, tokens, true);
    case 'uncordon': return handleCordon(state, tokens, false);
    case 'drain': return handleDrain(state, tokens);
    case 'top': return handleTop(state, tokens, ns);
    case 'logs': return handleLogs(state, tokens, ns);
    case 'cluster-info':
      return { state, result: { success: true, message: 'Kubernetes control plane is running at https://127.0.0.1:6443\nCoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy' } };
    case 'help': return { state, result: { success: true, message: getHelpText() } };
    default:
      return { state, result: { success: false, message: `Unknown action "${action}". Type "kubectl help" for available commands.` } };
  }
}

function extractFlag(tokens: string[], flags: string[]): string | undefined {
  for (const flag of flags) {
    const idx = tokens.indexOf(flag);
    if (idx !== -1 && idx + 1 < tokens.length) {
      const val = tokens[idx + 1];
      tokens.splice(idx, 2);
      return val;
    }
  }
  return undefined;
}

function extractFlagValue(tokens: string[], prefix: string): string | undefined {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].startsWith(prefix)) {
      const val = tokens[i].substring(prefix.length);
      tokens.splice(i, 1);
      return val;
    }
  }
  return undefined;
}

function handleRun(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const podName = tokens.shift();
  if (!podName) return { state, result: { success: false, message: 'Usage: kubectl run <name> --image=<image>' } };

  const image = extractFlagValue(tokens, '--image=') || 'nginx';
  const labelStr = extractFlagValue(tokens, '--labels=');
  const labels: Record<string, string> = { app: podName };
  if (labelStr) {
    for (const pair of labelStr.split(',')) {
      const [k, v] = pair.split('=');
      if (k && v) labels[k] = v;
    }
  }
  const existing = state.resources.find(r => r.type === 'pod' && r.name === podName && r.namespace === ns);
  if (existing) return { state, result: { success: false, message: `Error: pod "${podName}" already exists` } };

  const livenessProbe = extractFlagValue(tokens, '--liveness-probe=');
  const readinessProbe = extractFlagValue(tokens, '--readiness-probe=');
  const startupProbe = extractFlagValue(tokens, '--startup-probe=');
  const runAsNonRoot = tokens.includes('--run-as-non-root');
  if (runAsNonRoot) tokens.splice(tokens.indexOf('--run-as-non-root'), 1);
  const dropCaps = extractFlagValue(tokens, '--drop-capabilities=');
  const readOnlyRoot = tokens.includes('--read-only-root');
  if (readOnlyRoot) tokens.splice(tokens.indexOf('--read-only-root'), 1);

  const meta: Record<string, unknown> = { image, status: 'Running' };
  if (livenessProbe) meta.livenessProbe = livenessProbe;
  if (readinessProbe) meta.readinessProbe = readinessProbe;
  if (startupProbe) meta.startupProbe = startupProbe;
  if (runAsNonRoot) meta.runAsNonRoot = true;
  if (dropCaps) meta.dropCapabilities = dropCaps;
  if (readOnlyRoot) meta.readOnlyRootFilesystem = true;

  const pod = createResource('pod', podName, ns, labels, meta);
  return { state: { resources: [...state.resources, pod] }, result: { success: true, message: `pod/${podName} created`, resourcesCreated: [pod] } };
}

function handleCreate(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl create <type> <name>' } };

  const normalizedType = normalizeType(resourceType);

  const clusterScoped = CLUSTER_SCOPED.includes(normalizedType);
  const existing = state.resources.find(r => r.type === normalizedType && r.name === name && (r.namespace === ns || clusterScoped));
  if (existing) return { state, result: { success: false, message: `Error: ${resourceType} "${name}" already exists` } };

  const image = extractFlagValue(tokens, '--image=') || 'nginx';
  const replicas = parseInt(extractFlagValue(tokens, '--replicas=') || '1', 10);
  const created: K8sResource[] = [];

  switch (normalizedType) {
    case 'deployment': {
      const dep = createResource('deployment', name, ns, { app: name }, { image, replicas, revision: 1 });
      const rs = createResource('replicaset', `${name}-rs`, ns, { app: name }, { image, replicas, managedBy: dep.id });
      created.push(dep, rs);
      for (let i = 0; i < replicas; i++) {
        created.push(createResource('pod', `${name}-pod-${i + 1}`, ns, { app: name }, { image, status: 'Running', managedBy: rs.id }));
      }
      break;
    }
    case 'statefulset': {
      const serviceName = extractFlagValue(tokens, '--service=') || `${name}-headless`;
      const ss = createResource('statefulset', name, ns, { app: name }, { image, replicas, serviceName });
      created.push(ss);
      for (let i = 0; i < replicas; i++) {
        created.push(createResource('pod', `${name}-${i}`, ns, { app: name, 'statefulset.kubernetes.io/pod-name': `${name}-${i}` }, { image, status: 'Running', managedBy: ss.id, ordinal: i }));
      }
      // Auto-create headless service if not exists
      if (!state.resources.find(r => r.type === 'service' && r.name === serviceName && r.namespace === ns)) {
        created.push(createResource('service', serviceName, ns, { app: name }, { type: 'ClusterIP', clusterIP: 'None', port: '80' }));
      }
      break;
    }
    case 'daemonset': {
      const ds = createResource('daemonset', name, ns, { app: name }, { image, desiredNodes: 2 });
      created.push(ds);
      // Create one pod per node
      const nodes = state.resources.filter(r => r.type === 'node');
      nodes.forEach((node) => {
        created.push(createResource('pod', `${name}-${node.name}`, ns, { app: name }, { image, status: 'Running', managedBy: ds.id, nodeName: node.name }));
      });
      break;
    }
    case 'job': {
      const completions = parseInt(extractFlagValue(tokens, '--completions=') || '1', 10);
      const parallelism = parseInt(extractFlagValue(tokens, '--parallelism=') || '1', 10);
      const job = createResource('job', name, ns, { 'job-name': name }, { image, completions, parallelism, status: 'Running', succeeded: 0 });
      created.push(job);
      for (let i = 0; i < Math.min(parallelism, completions); i++) {
        created.push(createResource('pod', `${name}-${genShort()}`, ns, { 'job-name': name }, { image, status: 'Running', managedBy: job.id }));
      }
      break;
    }
    case 'cronjob': {
      const schedule = extractFlagValue(tokens, '--schedule=') || '*/5 * * * *';
      created.push(createResource('cronjob', name, ns, {}, { image, schedule, suspend: false, lastSchedule: 'N/A' }));
      break;
    }
    case 'pod': created.push(createResource('pod', name, ns, { app: name }, { image, status: 'Running' })); break;
    case 'namespace': created.push(createResource('namespace', name, '', {}, {})); break;
    case 'service': {
      const port = extractFlagValue(tokens, '--port=') || '80';
      const svcType = extractFlagValue(tokens, '--type=') || 'ClusterIP';
      const clusterIP = extractFlagValue(tokens, '--cluster-ip=');
      const nodePort = svcType === 'NodePort' ? Math.floor(30000 + Math.random() * 2767) : undefined;
      const meta: Record<string, unknown> = { port, type: svcType };
      if (clusterIP === 'None') meta.clusterIP = 'None';
      if (nodePort) meta.nodePort = nodePort;
      if (svcType === 'LoadBalancer') meta.externalIP = `203.0.113.${Math.floor(Math.random() * 255)}`;
      if (svcType === 'ExternalName') {
        const extName = extractFlagValue(tokens, '--external-name=') || 'example.com';
        meta.externalName = extName;
      }
      created.push(createResource('service', name, ns, {}, meta));
      break;
    }
    case 'configmap': created.push(createResource('configmap', name, ns, {}, {})); break;
    case 'secret': created.push(createResource('secret', name, ns, {}, { type: 'Opaque' })); break;
    case 'ingress': created.push(createResource('ingress', name, ns, {}, {})); break;
    case 'persistentvolume': {
      const capacity = extractFlagValue(tokens, '--capacity=') || '10Gi';
      const accessMode = extractFlagValue(tokens, '--access-mode=') || 'ReadWriteOnce';
      const storageClass = extractFlagValue(tokens, '--storage-class=') || 'standard';
      created.push(createResource('persistentvolume', name, '', {}, { capacity, accessMode, storageClass, status: 'Available', reclaimPolicy: 'Retain' }));
      break;
    }
    case 'persistentvolumeclaim': {
      const request = extractFlagValue(tokens, '--request=') || '5Gi';
      const accessMode = extractFlagValue(tokens, '--access-mode=') || 'ReadWriteOnce';
      const storageClass = extractFlagValue(tokens, '--storage-class=') || 'standard';
      created.push(createResource('persistentvolumeclaim', name, ns, {}, { request, accessMode, storageClass, status: 'Bound' }));
      break;
    }
    case 'serviceaccount': {
      created.push(createResource('serviceaccount', name, ns, {}, {}));
      break;
    }
    case 'role': {
      const verb = extractFlagValue(tokens, '--verb=') || 'get,list,watch';
      const resource = extractFlagValue(tokens, '--resource=') || 'pods';
      created.push(createResource('role', name, ns, {}, { verbs: verb, resources: resource }));
      break;
    }
    case 'clusterrole': {
      const verb = extractFlagValue(tokens, '--verb=') || 'get,list,watch';
      const resource = extractFlagValue(tokens, '--resource=') || 'pods';
      created.push(createResource('clusterrole', name, '', {}, { verbs: verb, resources: resource }));
      break;
    }
    case 'rolebinding': {
      const roleRef = extractFlagValue(tokens, '--role=') || extractFlagValue(tokens, '--clusterrole=') || '';
      const user = extractFlagValue(tokens, '--user=') || '';
      const sa = extractFlagValue(tokens, '--serviceaccount=') || '';
      const subject = user || sa || 'default';
      created.push(createResource('rolebinding', name, ns, {}, { roleRef, subject, subjectKind: user ? 'User' : 'ServiceAccount' }));
      break;
    }
    case 'clusterrolebinding': {
      const roleRef = extractFlagValue(tokens, '--clusterrole=') || '';
      const user = extractFlagValue(tokens, '--user=') || '';
      const sa = extractFlagValue(tokens, '--serviceaccount=') || '';
      const subject = user || sa || 'default';
      created.push(createResource('clusterrolebinding', name, '', {}, { roleRef, subject, subjectKind: user ? 'User' : 'ServiceAccount' }));
      break;
    }
    case 'networkpolicy': {
      const podSelector = extractFlagValue(tokens, '--pod-selector=') || '';
      const policyType = extractFlagValue(tokens, '--policy-type=') || 'Ingress';
      created.push(createResource('networkpolicy', name, ns, {}, { podSelector, policyTypes: policyType }));
      break;
    }
    default: return { state, result: { success: false, message: `Unsupported resource type: ${resourceType}. Type "kubectl help" for available types.` } };
  }

  return { state: { resources: [...state.resources, ...created] }, result: { success: true, message: `${resourceType}/${name} created`, resourcesCreated: created } };
}

function genShort(): string {
  return Math.random().toString(36).substring(2, 7);
}

function handleDelete(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl delete <type> <name>' } };

  const normalizedType = normalizeType(resourceType);
  const clusterScoped = CLUSTER_SCOPED.includes(normalizedType);

  const target = state.resources.find(r => r.type === normalizedType && r.name === name && (r.namespace === ns || clusterScoped));
  if (!target) return { state, result: { success: false, message: `Error: ${resourceType} "${name}" not found` } };

  const idsToDelete = new Set<string>([target.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of state.resources) {
      if (!idsToDelete.has(r.id) && typeof r.metadata.managedBy === 'string' && idsToDelete.has(r.metadata.managedBy)) {
        idsToDelete.add(r.id);
        changed = true;
      }
    }
  }

  return { state: { resources: state.resources.filter(r => !idsToDelete.has(r.id)) }, result: { success: true, message: `${resourceType}/${name} deleted`, resourcesDeleted: [...idsToDelete] } };
}

function handleGet(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  if (!resourceType) return { state, result: { success: false, message: 'Usage: kubectl get <type>' } };

  const normalizedType = normalizeType(resourceType);

  const allNs = tokens.includes('--all-namespaces') || tokens.includes('-A');
  const showLabels = tokens.includes('--show-labels');
  const filtered = state.resources.filter(r => {
    if (normalizedType !== 'all' && r.type !== normalizedType) return false;
    if (!allNs && r.namespace && r.namespace !== ns) return false;
    return true;
  });

  if (filtered.length === 0) return { state, result: { success: true, message: `No resources found.` } };

  const header = showLabels
    ? 'NAME                    STATUS    NAMESPACE     TYPE          LABELS'
    : 'NAME                    STATUS    NAMESPACE     TYPE';
  const lines = filtered.map(r => {
    const status = (r.metadata.status as string) || (r.metadata.type as string) || 'Active';
    const padName = `${r.type}/${r.name}`.padEnd(24);
    const padStatus = status.padEnd(10);
    const padNs = (r.namespace || '-').padEnd(14);
    const labelStr = Object.entries(r.labels).map(([k, v]) => `${k}=${v}`).join(',') || '<none>';
    return showLabels
      ? `${padName}${padStatus}${padNs}${r.type.padEnd(14)}${labelStr}`
      : `${padName}${padStatus}${padNs}${r.type}`;
  });
  return { state, result: { success: true, message: `${header}\n${lines.join('\n')}` } };
}

function handleExpose(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const targetType = tokens.shift();
  const targetName = tokens.shift();
  if (!targetType || !targetName) return { state, result: { success: false, message: 'Usage: kubectl expose <type> <name> --port=<port>' } };

  const nType = normalizeType(targetType);
  const target = state.resources.find(r => r.type === nType && r.name === targetName && r.namespace === ns);
  if (!target) return { state, result: { success: false, message: `Error: ${targetType} "${targetName}" not found` } };

  const port = extractFlagValue(tokens, '--port=') || '80';
  const svcType = extractFlagValue(tokens, '--type=') || 'ClusterIP';
  const svcName = extractFlagValue(tokens, '--name=') || targetName;
  const targetPort = extractFlagValue(tokens, '--target-port=') || port;

  const meta: Record<string, unknown> = { port, targetPort, type: svcType, targetRef: target.id };
  if (svcType === 'NodePort') meta.nodePort = Math.floor(30000 + Math.random() * 2767);
  if (svcType === 'LoadBalancer') meta.externalIP = `203.0.113.${Math.floor(Math.random() * 255)}`;

  const svc = createResource('service', svcName, ns, { ...target.labels }, meta);
  return { state: { resources: [...state.resources, svc] }, result: { success: true, message: `service/${svcName} exposed (${svcType}, port ${port})`, resourcesCreated: [svc] } };
}

function handleScale(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const target = tokens.shift();
  if (!target) return { state, result: { success: false, message: 'Usage: kubectl scale <type>/<name> --replicas=<n>' } };

  const [rawType, name] = target.split('/');
  const type = normalizeType(rawType);
  const replicaStr = extractFlagValue(tokens, '--replicas=');
  if (!replicaStr) return { state, result: { success: false, message: 'Missing --replicas flag' } };
  const replicas = parseInt(replicaStr, 10);

  const dep = state.resources.find(r => r.type === type && r.name === name && r.namespace === ns);
  if (!dep) return { state, result: { success: false, message: `Error: ${type} "${name}" not found` } };

  const image = (dep.metadata.image as string) || 'nginx';
  let newResources = [...state.resources];
  const created: K8sResource[] = [];
  const deleted: string[] = [];

  if (type === 'statefulset') {
    const existingPods = state.resources.filter(r => r.type === 'pod' && r.metadata.managedBy === dep.id);
    if (replicas > existingPods.length) {
      for (let i = existingPods.length; i < replicas; i++) {
        const pod = createResource('pod', `${name}-${i}`, ns, { app: name }, { image, status: 'Running', managedBy: dep.id, ordinal: i });
        created.push(pod);
        newResources.push(pod);
      }
    } else if (replicas < existingPods.length) {
      // StatefulSets scale down in reverse order
      const sorted = existingPods.sort((a, b) => ((b.metadata.ordinal as number) || 0) - ((a.metadata.ordinal as number) || 0));
      const toRemove = sorted.slice(0, existingPods.length - replicas);
      toRemove.forEach(p => deleted.push(p.id));
      newResources = newResources.filter(r => !deleted.includes(r.id));
    }
    newResources = newResources.map(r => r.id === dep.id ? { ...r, metadata: { ...r.metadata, replicas } } : r);
    return { state: { resources: newResources }, result: { success: true, message: `statefulset/${name} scaled to ${replicas} replicas`, resourcesCreated: created, resourcesDeleted: deleted } };
  }

  // Deployment scaling
  const rs = state.resources.find(r => r.type === 'replicaset' && r.metadata.managedBy === dep.id);
  const existingPods = state.resources.filter(r => r.type === 'pod' && r.metadata.managedBy === rs?.id);

  if (replicas > existingPods.length) {
    for (let i = existingPods.length; i < replicas; i++) {
      const pod = createResource('pod', `${name}-pod-${i + 1}`, ns, { app: name }, { image, status: 'Running', managedBy: rs?.id });
      created.push(pod);
      newResources.push(pod);
    }
  } else if (replicas < existingPods.length) {
    const toRemove = existingPods.slice(replicas);
    toRemove.forEach(p => deleted.push(p.id));
    newResources = newResources.filter(r => !deleted.includes(r.id));
  }

  newResources = newResources.map(r => r.id === dep.id ? { ...r, metadata: { ...r.metadata, replicas } } : r);
  return { state: { resources: newResources }, result: { success: true, message: `${type}/${name} scaled to ${replicas} replicas`, resourcesCreated: created, resourcesDeleted: deleted } };
}

function handleRollout(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const subCmd = tokens.shift();
  const target = tokens.shift();
  if (!subCmd || !target) return { state, result: { success: false, message: 'Usage: kubectl rollout <status|history|undo|restart> deployment/<name>' } };

  const [rawType, name] = target.split('/');
  const type = normalizeType(rawType);
  const dep = state.resources.find(r => r.type === type && r.name === name && r.namespace === ns);
  if (!dep) return { state, result: { success: false, message: `Error: ${type} "${name}" not found` } };

  const revision = (dep.metadata.revision as number) || 1;

  switch (subCmd) {
    case 'status':
      return { state, result: { success: true, message: `deployment "${name}" successfully rolled out\nRevision: ${revision}\nReplicas: ${dep.metadata.replicas} desired | ${dep.metadata.replicas} available` } };
    case 'history': {
      const lines = [`deployment.apps/${name}`, 'REVISION  CHANGE-CAUSE'];
      for (let i = 1; i <= revision; i++) {
        lines.push(`${i}         ${i === 1 ? '<none>' : `Updated image to ${dep.metadata.image}`}`);
      }
      return { state, result: { success: true, message: lines.join('\n') } };
    }
    case 'undo': {
      if (revision <= 1) return { state, result: { success: false, message: `Error: no previous revision to roll back to` } };
      const newImage = 'nginx:previous';
      const newRevision = revision + 1;
      let newResources = state.resources.map(r => {
        if (r.id === dep.id) return { ...r, metadata: { ...r.metadata, image: newImage, revision: newRevision } };
        return r;
      });
      const rs = newResources.find(r => r.type === 'replicaset' && r.metadata.managedBy === dep.id);
      if (rs) {
        newResources = newResources.map(r => {
          if (r.type === 'pod' && r.metadata.managedBy === rs.id) return { ...r, metadata: { ...r.metadata, image: newImage, status: 'Running' } };
          if (r.id === rs.id) return { ...r, metadata: { ...r.metadata, image: newImage } };
          return r;
        });
      }
      return { state: { resources: newResources }, result: { success: true, message: `deployment.apps/${name} rolled back to previous revision (now revision ${newRevision})` } };
    }
    case 'restart': {
      const newRevision = revision + 1;
      let newResources = state.resources.map(r => {
        if (r.id === dep.id) return { ...r, metadata: { ...r.metadata, revision: newRevision } };
        return r;
      });
      const rs = newResources.find(r => r.type === 'replicaset' && r.metadata.managedBy === dep.id);
      if (rs) {
        newResources = newResources.map(r => {
          if (r.type === 'pod' && r.metadata.managedBy === rs.id) return { ...r, createdAt: Date.now(), metadata: { ...r.metadata, status: 'Running' } };
          return r;
        });
      }
      return { state: { resources: newResources }, result: { success: true, message: `deployment.apps/${name} restarted (revision ${newRevision})` } };
    }
    default:
      return { state, result: { success: false, message: `Unknown rollout command "${subCmd}". Use: status, history, undo, restart` } };
  }
}

function handleSet(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const subCmd = tokens.shift();
  if (subCmd !== 'image') return { state, result: { success: false, message: 'Usage: kubectl set image deployment/<name> <container>=<image>' } };

  const target = tokens.shift();
  const imageSpec = tokens.shift();
  if (!target || !imageSpec) return { state, result: { success: false, message: 'Usage: kubectl set image deployment/<name> <container>=<image>' } };

  const [rawType, name] = target.split('/');
  const type = normalizeType(rawType);
  const [, newImage] = imageSpec.split('=');
  if (!newImage) return { state, result: { success: false, message: 'Invalid image spec. Use: container=image:tag' } };

  const dep = state.resources.find(r => r.type === type && r.name === name && r.namespace === ns);
  if (!dep) return { state, result: { success: false, message: `Error: ${type} "${name}" not found` } };

  const oldRevision = (dep.metadata.revision as number) || 1;
  const newRevision = oldRevision + 1;

  let newResources = state.resources.map(r => {
    if (r.id === dep.id) return { ...r, metadata: { ...r.metadata, image: newImage, revision: newRevision } };
    return r;
  });

  const rs = newResources.find(r => r.type === 'replicaset' && r.metadata.managedBy === dep.id);
  if (rs) {
    newResources = newResources.map(r => {
      if (r.type === 'pod' && r.metadata.managedBy === rs.id) return { ...r, metadata: { ...r.metadata, image: newImage, status: 'Running' } };
      if (r.id === rs.id) return { ...r, metadata: { ...r.metadata, image: newImage } };
      return r;
    });
  }

  return { state: { resources: newResources }, result: { success: true, message: `deployment.apps/${name} image updated to ${newImage} (revision ${newRevision})` } };
}

function handleLabel(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl label <type> <name> key=value' } };

  const nType = normalizeType(resourceType);
  const isClusterScoped = CLUSTER_SCOPED.includes(nType);
  const target = state.resources.find(r => r.type === nType && r.name === name && (r.namespace === ns || isClusterScoped));
  if (!target) return { state, result: { success: false, message: `Error: ${resourceType} "${name}" not found` } };

  const newLabels = { ...target.labels };
  for (const token of tokens) {
    if (token.startsWith('-') || token.startsWith('--')) continue;
    if (token.endsWith('-')) {
      delete newLabels[token.slice(0, -1)];
    } else if (token.includes('=')) {
      const [k, v] = token.split('=');
      if (k) newLabels[k] = v || '';
    }
  }

  const newResources = state.resources.map(r => r.id === target.id ? { ...r, labels: newLabels } : r);
  return { state: { resources: newResources }, result: { success: true, message: `${resourceType}/${name} labeled` } };
}

function handleDescribe(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl describe <type> <name>' } };

  const nType = normalizeType(resourceType);
  const isClusterScoped = CLUSTER_SCOPED.includes(nType);
  const target = state.resources.find(r => r.type === nType && r.name === name && (r.namespace === ns || isClusterScoped));
  if (!target) return { state, result: { success: false, message: `Error: ${resourceType} "${name}" not found` } };

  const lines = [
    `Name:         ${target.name}`,
    `Namespace:    ${target.namespace || '-'}`,
    `Type:         ${target.type}`,
    `Labels:       ${Object.entries(target.labels).map(([k, v]) => `${k}=${v}`).join(', ') || '<none>'}`,
    `Created:      ${new Date(target.createdAt).toISOString()}`,
    ...Object.entries(target.metadata).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}:      ${v}`),
  ];
  return { state, result: { success: true, message: lines.join('\n') } };
}

function handleApply(state: ClusterState, tokens: string[], _ns: string): { state: ClusterState; result: CommandResult } {
  // Simulate kubectl apply -f for networkpolicy YAML-like creation
  const fFlag = extractFlagValue(tokens, '-f=') || extractFlag(tokens, ['-f']);
  if (fFlag) {
    return { state, result: { success: true, message: `Applied resource from ${fFlag} (simulated)` } };
  }
  return { state, result: { success: false, message: 'Usage: kubectl apply -f <filename>' } };
}

function handleAuth(state: ClusterState, tokens: string[], _ns: string): { state: ClusterState; result: CommandResult } {
  const subCmd = tokens.shift();
  if (subCmd !== 'can-i') return { state, result: { success: false, message: 'Usage: kubectl auth can-i <verb> <resource>' } };

  const verb = tokens.shift();
  const resource = tokens.shift();
  if (!verb || !resource) return { state, result: { success: false, message: 'Usage: kubectl auth can-i <verb> <resource>' } };

  const roles = state.resources.filter(r => r.type === 'role' || r.type === 'clusterrole');
  const hasPermission = roles.some(r => {
    const verbs = (r.metadata.verbs as string || '').split(',');
    const resources = (r.metadata.resources as string || '').split(',');
    return (verbs.includes(verb) || verbs.includes('*')) && (resources.includes(resource) || resources.includes('*'));
  });

  return { state, result: { success: true, message: hasPermission ? 'yes' : 'no - no RBAC policy matched' } };
}

function handleTaint(state: ClusterState, tokens: string[]): { state: ClusterState; result: CommandResult } {
  const nodeType = tokens.shift(); // 'node' or 'nodes'
  const nodeName = tokens.shift();
  const taintSpec = tokens.shift();
  if (!nodeType || !nodeName || !taintSpec) return { state, result: { success: false, message: 'Usage: kubectl taint node <name> key=value:effect' } };

  const node = state.resources.find(r => r.type === 'node' && r.name === nodeName);
  if (!node) return { state, result: { success: false, message: `Error: node "${nodeName}" not found` } };

  const taints = ((node.metadata.taints as string[]) || []).slice();
  if (taintSpec.endsWith('-')) {
    const key = taintSpec.slice(0, -1).split(':')[0].split('=')[0];
    const idx = taints.findIndex(t => t.startsWith(key));
    if (idx >= 0) taints.splice(idx, 1);
  } else {
    taints.push(taintSpec);
  }

  const newResources = state.resources.map(r => r.id === node.id ? { ...r, metadata: { ...r.metadata, taints } } : r);
  return { state: { resources: newResources }, result: { success: true, message: `node/${nodeName} tainted` } };
}

function handleCordon(state: ClusterState, tokens: string[], cordon: boolean): { state: ClusterState; result: CommandResult } {
  const nodeName = tokens.shift();
  if (!nodeName) return { state, result: { success: false, message: `Usage: kubectl ${cordon ? 'cordon' : 'uncordon'} <node>` } };

  const node = state.resources.find(r => r.type === 'node' && r.name === nodeName);
  if (!node) return { state, result: { success: false, message: `Error: node "${nodeName}" not found` } };

  const newStatus = cordon ? 'Ready,SchedulingDisabled' : 'Ready';
  const newResources = state.resources.map(r => r.id === node.id ? { ...r, metadata: { ...r.metadata, status: newStatus } } : r);
  return { state: { resources: newResources }, result: { success: true, message: `node/${nodeName} ${cordon ? 'cordoned' : 'uncordoned'}` } };
}

function handleDrain(state: ClusterState, tokens: string[]): { state: ClusterState; result: CommandResult } {
  const nodeName = tokens.shift();
  if (!nodeName) return { state, result: { success: false, message: 'Usage: kubectl drain <node> [--ignore-daemonsets]' } };

  const node = state.resources.find(r => r.type === 'node' && r.name === nodeName);
  if (!node) return { state, result: { success: false, message: `Error: node "${nodeName}" not found` } };

  // Check for --ignore-daemonsets flag
  const ignoreDaemonsets = tokens.includes('--ignore-daemonsets');

  // Cordon the node first
  const newResources = state.resources.map(r => {
    if (r.id === node.id) return { ...r, metadata: { ...r.metadata, status: 'Ready,SchedulingDisabled' } };
    return r;
  });

  // Evict non-daemonset pods on this node
  const podsOnNode = newResources.filter(r =>
    r.type === 'pod' && (r.metadata.nodeName === nodeName)
  );
  const daemonsetPods = podsOnNode.filter(r => {
    const manager = newResources.find(m => m.id === r.metadata.managedBy);
    return manager?.type === 'daemonset';
  });
  const podsToEvict = ignoreDaemonsets
    ? podsOnNode.filter(p => !daemonsetPods.includes(p))
    : podsOnNode;

  if (!ignoreDaemonsets && daemonsetPods.length > 0) {
    return { state, result: { success: false, message: `Cannot drain node "${nodeName}": pods managed by DaemonSet found. Use --ignore-daemonsets to proceed.` } };
  }

  const evictedIds = new Set(podsToEvict.map(p => p.id));
  const finalResources = newResources.filter(r => !evictedIds.has(r.id));

  const evictedCount = podsToEvict.length;
  return {
    state: { resources: finalResources },
    result: { success: true, message: `node/${nodeName} drained (${evictedCount} pod${evictedCount !== 1 ? 's' : ''} evicted)`, resourcesDeleted: [...evictedIds] }
  };
}

function handleTop(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  if (!resourceType) return { state, result: { success: false, message: 'Usage: kubectl top <pods|nodes>' } };
  const nType = normalizeType(resourceType);
  const showContainers = tokens.includes('--containers');

  if (nType === 'node') {
    const nodes = state.resources.filter(r => r.type === 'node');
    if (nodes.length === 0) return { state, result: { success: true, message: 'No nodes found.' } };
    const header = 'NAME           CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%';
    const lines = nodes.map(n => {
      const cpu = Math.floor(100 + Math.random() * 400);
      const mem = Math.floor(512 + Math.random() * 1536);
      return `${n.name.padEnd(15)}${(cpu + 'm').padEnd(13)}${(Math.floor(cpu / 20) + '%').padEnd(7)}${(mem + 'Mi').padEnd(16)}${Math.floor(mem / 40) + '%'}`;
    });
    return { state, result: { success: true, message: `${header}\n${lines.join('\n')}` } };
  }

  if (nType === 'pod') {
    const pods = state.resources.filter(r => r.type === 'pod' && (r.namespace === ns || tokens.includes('-A') || tokens.includes('--all-namespaces')));
    if (pods.length === 0) return { state, result: { success: true, message: 'No pods found.' } };
    const header = showContainers
      ? 'POD                     CONTAINER    CPU(cores)   MEMORY(bytes)'
      : 'NAME                    CPU(cores)   MEMORY(bytes)';
    const lines = pods.map(p => {
      const cpu = Math.floor(1 + Math.random() * 50);
      const mem = Math.floor(10 + Math.random() * 200);
      if (showContainers) {
        const container = (p.metadata.image as string) || 'main';
        return `${p.name.padEnd(24)}${container.padEnd(13)}${(cpu + 'm').padEnd(13)}${mem + 'Mi'}`;
      }
      return `${p.name.padEnd(24)}${(cpu + 'm').padEnd(13)}${mem + 'Mi'}`;
    });
    return { state, result: { success: true, message: `${header}\n${lines.join('\n')}` } };
  }

  return { state, result: { success: false, message: `error: unknown resource type "${resourceType}"` } };
}

function handleLogs(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const podName = tokens.shift();
  if (!podName) return { state, result: { success: false, message: 'Usage: kubectl logs <pod-name>' } };

  const pod = state.resources.find(r => r.type === 'pod' && r.name === podName && r.namespace === ns);
  if (!pod) return { state, result: { success: false, message: `Error: pod "${podName}" not found` } };

  const image = (pod.metadata.image as string) || 'app';
  const timestamp = new Date().toISOString();
  const lines = [
    `${timestamp} Starting ${image}...`,
    `${timestamp} Listening on port 8080`,
    `${timestamp} Ready to accept connections`,
    `${timestamp} GET / 200 OK (2ms)`,
    `${timestamp} Health check passed`,
  ];
  return { state, result: { success: true, message: lines.join('\n') } };
}

function getHelpText(): string {
  return `Available commands:
  kubectl run <name> --image=<image>                    Create a Pod
  kubectl run <name> --image=<img> --labels=k=v         Create a Pod with labels
  kubectl create deployment <name> --image=<img>        Create a Deployment
  kubectl create deployment <name> --replicas=N         Create with N replicas
  kubectl create statefulset <name> --image=<img>       Create a StatefulSet
  kubectl create daemonset <name> --image=<img>         Create a DaemonSet
  kubectl create job <name> --image=<img>               Create a Job
  kubectl create cronjob <name> --image=<img>           Create a CronJob
  kubectl create pod <name> --image=<image>             Create a Pod
  kubectl create service <name> --port=<port>           Create a ClusterIP Service
  kubectl create service <name> --port=P --type=T       Service types: ClusterIP|NodePort|LoadBalancer|ExternalName
  kubectl create namespace <name>                       Create a Namespace
  kubectl create configmap <name>                       Create a ConfigMap
  kubectl create secret <name>                          Create a Secret
  kubectl create ingress <name>                         Create an Ingress
  kubectl create pv <name> --capacity=10Gi              Create a PersistentVolume
  kubectl create pvc <name> --request=5Gi               Create a PersistentVolumeClaim
  kubectl create sa <name>                              Create a ServiceAccount
  kubectl create role <name> --verb=get --resource=pods Create a Role
  kubectl create clusterrole <name> --verb=get          Create a ClusterRole
  kubectl create rolebinding <name> --role=R --user=U   Create a RoleBinding
  kubectl create clusterrolebinding <name>              Create a ClusterRoleBinding
  kubectl create networkpolicy <name>                   Create a NetworkPolicy
  kubectl get <type>                                    List resources (pv, pvc, sa, roles, etc.)
  kubectl get <type> -A                                 List across all namespaces
  kubectl get <type> --show-labels                      List with labels
  kubectl describe <type> <name>                        Show details of a resource
  kubectl delete <type> <name>                          Delete a resource
  kubectl expose <type> <name> --port=<port>            Expose as ClusterIP Service
  kubectl expose <type> <name> --port=P --type=T        Expose with type (NodePort, LoadBalancer)
  kubectl scale <type>/<name> --replicas=N              Scale Deployment or StatefulSet
  kubectl set image deployment/<name> ctr=img:tag       Update container image (rolling update)
  kubectl rollout status deployment/<name>              Check rollout status
  kubectl rollout history deployment/<name>             View rollout history
  kubectl rollout undo deployment/<name>                Rollback to previous revision
  kubectl rollout restart deployment/<name>             Restart all pods
  kubectl label <type> <name> key=value                 Add/update labels
  kubectl label <type> <name> key-                      Remove a label
  kubectl taint node <name> key=val:effect              Add a taint to a node
  kubectl taint node <name> key:effect-                 Remove a taint
  kubectl cordon <node>                                 Mark node as unschedulable
  kubectl uncordon <node>                               Mark node as schedulable
  kubectl auth can-i <verb> <resource>                  Check RBAC permissions
  kubectl cluster-info                                  Show cluster info
  kubectl help                                          Show this help
  clear                                                 Clear terminal`;
}
