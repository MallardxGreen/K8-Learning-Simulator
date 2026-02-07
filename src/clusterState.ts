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

  const pod = createResource('pod', podName, ns, labels, { image, status: 'Running' });
  return { state: { resources: [...state.resources, pod] }, result: { success: true, message: `pod/${podName} created`, resourcesCreated: [pod] } };
}

function handleCreate(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl create <type> <name>' } };

  const existing = state.resources.find(r => r.type === resourceType && r.name === name && (r.namespace === ns || resourceType === 'namespace'));
  if (existing) return { state, result: { success: false, message: `Error: ${resourceType} "${name}" already exists` } };

  const image = extractFlagValue(tokens, '--image=') || 'nginx';
  const replicas = parseInt(extractFlagValue(tokens, '--replicas=') || '1', 10);
  const created: K8sResource[] = [];

  switch (resourceType) {
    case 'deployment': {
      const dep = createResource('deployment', name, ns, { app: name }, { image, replicas, revision: 1 });
      const rs = createResource('replicaset', `${name}-rs`, ns, { app: name }, { image, replicas, managedBy: dep.id });
      created.push(dep, rs);
      for (let i = 0; i < replicas; i++) {
        created.push(createResource('pod', `${name}-pod-${i + 1}`, ns, { app: name }, { image, status: 'Running', managedBy: rs.id }));
      }
      break;
    }
    case 'pod': created.push(createResource('pod', name, ns, { app: name }, { image, status: 'Running' })); break;
    case 'namespace': created.push(createResource('namespace', name, '', {}, {})); break;
    case 'service': {
      const port = extractFlagValue(tokens, '--port=') || '80';
      const svcType = extractFlagValue(tokens, '--type=') || 'ClusterIP';
      const nodePort = svcType === 'NodePort' ? Math.floor(30000 + Math.random() * 2767) : undefined;
      const meta: Record<string, unknown> = { port, type: svcType };
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
    default: return { state, result: { success: false, message: `Unsupported resource type: ${resourceType}` } };
  }

  return { state: { resources: [...state.resources, ...created] }, result: { success: true, message: `${resourceType}/${name} created`, resourcesCreated: created } };
}

function handleDelete(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl delete <type> <name>' } };

  const target = state.resources.find(r => r.type === resourceType && r.name === name && (r.namespace === ns || r.type === 'namespace'));
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

  const allNs = tokens.includes('--all-namespaces') || tokens.includes('-A');
  const showLabels = tokens.includes('--show-labels');
  const filtered = state.resources.filter(r => {
    if (resourceType !== 'all' && r.type !== resourceType && r.type !== resourceType.replace(/s$/, '')) return false;
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
    const padType = r.type.padEnd(14);
    const labelStr = Object.entries(r.labels).map(([k, v]) => `${k}=${v}`).join(',') || '<none>';
    return showLabels
      ? `${padName}${padStatus}${padNs}${padType}${labelStr}`
      : `${padName}${padStatus}${padNs}${r.type}`;
  });
  return { state, result: { success: true, message: `${header}\n${lines.join('\n')}` } };
}

function handleExpose(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const targetType = tokens.shift();
  const targetName = tokens.shift();
  if (!targetType || !targetName) return { state, result: { success: false, message: 'Usage: kubectl expose <type> <name> --port=<port>' } };

  const target = state.resources.find(r => r.type === targetType && r.name === targetName && r.namespace === ns);
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
  if (!target) return { state, result: { success: false, message: 'Usage: kubectl scale deployment/<name> --replicas=<n>' } };

  const [type, name] = target.split('/');
  const replicaStr = extractFlagValue(tokens, '--replicas=');
  if (!replicaStr) return { state, result: { success: false, message: 'Missing --replicas flag' } };
  const replicas = parseInt(replicaStr, 10);

  const dep = state.resources.find(r => r.type === type && r.name === name && r.namespace === ns);
  if (!dep) return { state, result: { success: false, message: `Error: ${type} "${name}" not found` } };

  const rs = state.resources.find(r => r.type === 'replicaset' && r.metadata.managedBy === dep.id);
  const existingPods = state.resources.filter(r => r.type === 'pod' && r.metadata.managedBy === rs?.id);
  const image = (dep.metadata.image as string) || 'nginx';

  let newResources = [...state.resources];
  const created: K8sResource[] = [];
  const deleted: string[] = [];

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
  return { state: { resources: newResources }, result: { success: true, message: `deployment/${name} scaled to ${replicas} replicas`, resourcesCreated: created, resourcesDeleted: deleted } };
}

function handleRollout(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const subCmd = tokens.shift(); // status, history, undo, restart
  const target = tokens.shift(); // deployment/name
  if (!subCmd || !target) return { state, result: { success: false, message: 'Usage: kubectl rollout <status|history|undo|restart> deployment/<name>' } };

  const [type, name] = target.split('/');
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
      // Update pods image
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
      // Simulate pod restart by updating createdAt
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
  const subCmd = tokens.shift(); // image
  if (subCmd !== 'image') return { state, result: { success: false, message: 'Usage: kubectl set image deployment/<name> <container>=<image>' } };

  const target = tokens.shift(); // deployment/name
  const imageSpec = tokens.shift(); // container=image
  if (!target || !imageSpec) return { state, result: { success: false, message: 'Usage: kubectl set image deployment/<name> <container>=<image>' } };

  const [type, name] = target.split('/');
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

  const target = state.resources.find(r => r.type === resourceType && r.name === name && (r.namespace === ns || r.type === 'namespace'));
  if (!target) return { state, result: { success: false, message: `Error: ${resourceType} "${name}" not found` } };

  const newLabels = { ...target.labels };
  for (const token of tokens) {
    if (token.endsWith('-')) {
      // Remove label
      const key = token.slice(0, -1);
      delete newLabels[key];
    } else if (token.includes('=')) {
      const [k, v] = token.split('=');
      if (k) newLabels[k] = v || '';
    }
  }

  const newResources = state.resources.map(r =>
    r.id === target.id ? { ...r, labels: newLabels } : r
  );
  return { state: { resources: newResources }, result: { success: true, message: `${resourceType}/${name} labeled` } };
}

function handleDescribe(state: ClusterState, tokens: string[], ns: string): { state: ClusterState; result: CommandResult } {
  const resourceType = tokens.shift();
  const name = tokens.shift();
  if (!resourceType || !name) return { state, result: { success: false, message: 'Usage: kubectl describe <type> <name>' } };

  const target = state.resources.find(r => r.type === resourceType && r.name === name && (r.namespace === ns || r.type === 'namespace'));
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

function getHelpText(): string {
  return `Available commands:
  kubectl run <name> --image=<image>                    Create a Pod
  kubectl run <name> --image=<img> --labels=k=v         Create a Pod with labels
  kubectl create deployment <name> --image=<img>        Create a Deployment
  kubectl create deployment <name> --replicas=N         Create with N replicas
  kubectl create pod <name> --image=<image>             Create a Pod
  kubectl create service <name> --port=<port>           Create a ClusterIP Service
  kubectl create service <name> --port=P --type=T       Create Service (ClusterIP|NodePort|LoadBalancer|ExternalName)
  kubectl create namespace <name>                       Create a Namespace
  kubectl create configmap <name>                       Create a ConfigMap
  kubectl create secret <name>                          Create a Secret
  kubectl create ingress <name>                         Create an Ingress
  kubectl get <type>                                    List resources
  kubectl get <type> -A                                 List across all namespaces
  kubectl get <type> --show-labels                      List with labels
  kubectl describe <type> <name>                        Show details of a resource
  kubectl delete <type> <name>                          Delete a resource
  kubectl expose <type> <name> --port=<port>            Expose as ClusterIP Service
  kubectl expose <type> <name> --port=P --type=T        Expose with type (NodePort, LoadBalancer)
  kubectl scale deployment/<name> --replicas=N          Scale a Deployment
  kubectl set image deployment/<name> ctr=img:tag       Update container image (rolling update)
  kubectl rollout status deployment/<name>              Check rollout status
  kubectl rollout history deployment/<name>             View rollout history
  kubectl rollout undo deployment/<name>                Rollback to previous revision
  kubectl rollout restart deployment/<name>             Restart all pods
  kubectl label <type> <name> key=value                 Add/update labels
  kubectl label <type> <name> key-                      Remove a label
  kubectl cluster-info                                  Show cluster info
  kubectl help                                          Show this help
  clear                                                 Clear terminal`;
}
