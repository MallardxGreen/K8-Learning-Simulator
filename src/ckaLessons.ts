import type { Lesson } from './types';

export const ckaLessons: Lesson[] = [
  // ── CLUSTER ARCHITECTURE, INSTALLATION & CONFIGURATION (25%) ──
  {
    id: 'cka-cluster-install',
    title: 'Cluster Installation with kubeadm',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>Cluster Installation with kubeadm</h2>
<p>The CKA exam expects you to install a Kubernetes cluster from scratch using <strong>kubeadm</strong>. This is the official bootstrapping tool maintained by the Kubernetes project.</p>

<h3>kubeadm Workflow</h3>
<ol>
  <li><strong>kubeadm init</strong> — Initializes the control plane node</li>
  <li><strong>Join workers</strong> — Use the token from init to join worker nodes</li>
  <li><strong>Install CNI</strong> — Deploy a pod network (Calico, Flannel, etc.)</li>
</ol>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> You must know how to bootstrap a cluster, add nodes, and upgrade cluster versions using kubeadm. The exam provides documentation access.
</div>

<h3>Key Commands</h3>
<pre><code># Initialize control plane
kubeadm init --pod-network-cidr=10.244.0.0/16

# Join a worker node
kubeadm join &lt;control-plane-ip&gt;:6443 --token &lt;token&gt; --discovery-token-ca-cert-hash sha256:&lt;hash&gt;

# Upgrade cluster
kubeadm upgrade plan
kubeadm upgrade apply v1.30.0</code></pre>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get nodes
kubectl get pods -n kube-system
kubectl cluster-info</code></pre>
`,
    example: 'kubectl get nodes',
    expectedCommands: ['kubectl get nodes', 'kubectl get pods -n kube-system'],
    challenges: [
      { id: 'cka-install-1', task: 'Check the nodes in your cluster', hint: 'kubectl get nodes', answer: 'kubectl get nodes', validate: () => true },
    ],
  },
  {
    id: 'cka-etcd-backup',
    title: 'etcd Backup & Restore',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>etcd Backup & Restore</h2>
<p><strong>etcd</strong> is the key-value store that holds all cluster state. Backing it up and restoring it is a critical CKA skill.</p>

<h3>Why etcd Matters</h3>
<p>Every resource you create — pods, services, secrets — is stored in etcd. Losing etcd means losing your entire cluster configuration.</p>

<h3>Backup</h3>
<pre><code>ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db \\
  --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key</code></pre>

<h3>Restore</h3>
<pre><code>ETCDCTL_API=3 etcdctl snapshot restore /tmp/etcd-backup.db \\
  --data-dir=/var/lib/etcd-restored</code></pre>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Always specify the <code>--endpoints</code>, <code>--cacert</code>, <code>--cert</code>, and <code>--key</code> flags. The exam will provide the paths.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pods -n kube-system
kubectl describe pod etcd-node-1 -n kube-system</code></pre>
`,
    example: 'kubectl get pods -n kube-system',
    challenges: [
      { id: 'cka-etcd-1', task: 'List pods in kube-system namespace', hint: 'kubectl get pods -n kube-system', answer: 'kubectl get pods -n kube-system', validate: () => true },
    ],
  },
  {
    id: 'cka-rbac-deep',
    title: 'RBAC Deep Dive',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>RBAC Deep Dive</h2>
<p>The CKA goes deeper into RBAC than the KCNA. You need to create Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings from scratch.</p>

<h3>Role vs ClusterRole</h3>
<ul>
  <li><strong>Role</strong> — Grants permissions within a specific namespace</li>
  <li><strong>ClusterRole</strong> — Grants permissions cluster-wide or across namespaces</li>
</ul>

<h3>Creating RBAC Resources</h3>
<pre><code># Create a role
kubectl create role pod-reader --verb=get,list,watch --resource=pods -n dev

# Bind it to a user
kubectl create rolebinding pod-reader-binding --role=pod-reader --user=jane -n dev

# Create a cluster role
kubectl create clusterrole node-reader --verb=get,list --resource=nodes

# Bind cluster-wide
kubectl create clusterrolebinding node-reader-binding --clusterrole=node-reader --user=jane</code></pre>

<h3>Verifying Access</h3>
<pre><code># Check if you can do something
kubectl auth can-i get pods --as jane -n dev
kubectl auth can-i delete nodes --as jane</code></pre>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create role dev-reader --verb=get,list --resource=pods -n default
kubectl auth can-i get pods --as jane</code></pre>
`,
    example: 'kubectl auth can-i get pods --as jane',
    challenges: [
      { id: 'cka-rbac-1', task: 'Create a role called "dev-reader" that can get and list pods', hint: 'kubectl create role dev-reader --verb=get,list --resource=pods', answer: 'kubectl create role dev-reader --verb=get,list --resource=pods', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'dev-reader') },
      { id: 'cka-rbac-2', task: 'Check if user "jane" can get pods', hint: 'kubectl auth can-i get pods --as jane', answer: 'kubectl auth can-i get pods --as jane', validate: () => true },
    ],
  },

  // ── WORKLOADS & SCHEDULING (15%) ──
  {
    id: 'cka-scheduling-advanced',
    title: 'Advanced Scheduling',
    category: 'Workloads & Scheduling',
    course: 'cka',
    content: `
<h2>Advanced Scheduling</h2>
<p>The CKA tests your ability to control pod placement using taints, tolerations, node affinity, and manual scheduling.</p>

<h3>Node Selectors</h3>
<pre><code># Label a node
kubectl label node node-1 disktype=ssd

# Use nodeSelector in pod spec
spec:
  nodeSelector:
    disktype: ssd</code></pre>

<h3>Taints & Tolerations</h3>
<pre><code># Taint a node
kubectl taint nodes node-1 key=value:NoSchedule

# Remove a taint
kubectl taint nodes node-1 key=value:NoSchedule-</code></pre>

<h3>Node Affinity</h3>
<p>More expressive than nodeSelector — supports "preferred" and "required" rules with operators like In, NotIn, Exists.</p>

<h3>Static Pods</h3>
<p>Pods managed directly by the kubelet (not the API server). Place manifests in <code>/etc/kubernetes/manifests/</code>.</p>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Know how to schedule a pod on a specific node using nodeName, nodeSelector, and affinity. Also know how to create static pods.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl label node node-1 disktype=ssd
kubectl taint nodes node-2 maintenance=true:NoSchedule
kubectl get nodes --show-labels</code></pre>
`,
    example: 'kubectl get nodes --show-labels',
    challenges: [
      { id: 'cka-sched-1', task: 'Label node-1 with disktype=ssd', hint: 'kubectl label node node-1 disktype=ssd', answer: 'kubectl label node node-1 disktype=ssd', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.labels['disktype'] === 'ssd') },
      { id: 'cka-sched-2', task: 'Taint node-2 with maintenance=true:NoSchedule', hint: 'kubectl taint nodes node-2 maintenance=true:NoSchedule', answer: 'kubectl taint nodes node-2 maintenance=true:NoSchedule', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && Array.isArray((r.metadata as Record<string, unknown>)?.taints)) },
    ],
  },
  {
    id: 'cka-resource-limits',
    title: 'Resource Requests & Limits',
    category: 'Workloads & Scheduling',
    course: 'cka',
    content: `
<h2>Resource Requests & Limits</h2>
<p>Kubernetes uses <strong>requests</strong> for scheduling decisions and <strong>limits</strong> to enforce maximum resource usage.</p>

<h3>How They Work</h3>
<ul>
  <li><strong>Requests</strong> — Minimum resources guaranteed to the container. The scheduler uses this to find a suitable node.</li>
  <li><strong>Limits</strong> — Maximum resources the container can use. Exceeding CPU causes throttling; exceeding memory causes OOMKill.</li>
</ul>

<h3>LimitRange</h3>
<p>Sets default requests/limits for a namespace so every pod gets resource constraints.</p>

<h3>ResourceQuota</h3>
<p>Limits total resource consumption across an entire namespace.</p>

<pre><code># Create a resource quota
kubectl create quota my-quota --hard=cpu=4,memory=8Gi,pods=10 -n dev</code></pre>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> If a namespace has a ResourceQuota, every pod must specify resource requests. Otherwise the pod will be rejected.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run limited --image=nginx
kubectl describe pod limited
kubectl create namespace dev
kubectl create quota my-quota --hard=pods=10 -n dev</code></pre>
`,
    example: 'kubectl run limited --image=nginx',
    challenges: [
      { id: 'cka-res-1', task: 'Create a namespace called "dev"', hint: 'kubectl create namespace dev', answer: 'kubectl create namespace dev', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'dev') },
      { id: 'cka-res-2', task: 'Run a pod called "limited" with nginx image', hint: 'kubectl run limited --image=nginx', answer: 'kubectl run limited --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'limited') },
    ],
  },

  // ── SERVICES & NETWORKING (20%) ──
  {
    id: 'cka-services-networking',
    title: 'Services & DNS',
    category: 'Services & Networking',
    course: 'cka',
    content: `
<h2>Services & DNS</h2>
<p>Services provide stable networking for pods. The CKA expects you to create and troubleshoot services, understand DNS resolution, and work with different service types.</p>

<h3>Service Types</h3>
<ul>
  <li><strong>ClusterIP</strong> — Internal only (default)</li>
  <li><strong>NodePort</strong> — Exposes on each node's IP at a static port (30000-32767)</li>
  <li><strong>LoadBalancer</strong> — Provisions an external load balancer</li>
  <li><strong>ExternalName</strong> — Maps to a DNS name</li>
</ul>

<h3>DNS Resolution</h3>
<p>Every service gets a DNS entry: <code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code></p>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run web --image=nginx
kubectl expose pod web --port=80 --name=web-svc
kubectl get svc
kubectl run web2 --image=nginx
kubectl expose pod web2 --port=80 --type=NodePort --name=web2-svc</code></pre>
`,
    example: 'kubectl get svc',
    challenges: [
      { id: 'cka-svc-1', task: 'Run a pod called "web" with nginx and expose it as a ClusterIP service on port 80', hint: 'kubectl run web --image=nginx && kubectl expose pod web --port=80 --name=web-svc', answer: 'kubectl expose pod web --port=80 --name=web-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'web-svc') },
    ],
  },
  {
    id: 'cka-ingress-deep',
    title: 'Ingress Controllers & Rules',
    category: 'Services & Networking',
    course: 'cka',
    content: `
<h2>Ingress Controllers & Rules</h2>
<p>Ingress provides HTTP/HTTPS routing to services. Unlike the KCNA, the CKA expects you to create Ingress resources from YAML.</p>

<h3>Ingress Resource</h3>
<pre><code>apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80</code></pre>

<h3>Key Concepts</h3>
<ul>
  <li>An <strong>Ingress Controller</strong> (like nginx-ingress) must be running for Ingress resources to work</li>
  <li>Path types: <code>Prefix</code>, <code>Exact</code>, <code>ImplementationSpecific</code></li>
  <li>TLS can be configured with a Secret reference</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> You'll likely need to create an Ingress from scratch or modify an existing one. Bookmark the Ingress docs page.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run web --image=nginx
kubectl expose pod web --port=80 --name=web-svc
kubectl create ingress my-ingress --rule="app.example.com/=web-svc:80"
kubectl get ingress</code></pre>
`,
    example: 'kubectl get ingress',
    challenges: [
      { id: 'cka-ing-1', task: 'Create an ingress called "my-ingress" routing to web-svc', hint: 'kubectl create ingress my-ingress --rule="app.example.com/=web-svc:80"', answer: 'kubectl create ingress my-ingress --rule="app.example.com/=web-svc:80"', validate: (c) => c.resources.some(r => r.type === 'ingress' && r.name === 'my-ingress') },
    ],
  },
  {
    id: 'cka-networkpolicy',
    title: 'Network Policies in Practice',
    category: 'Services & Networking',
    course: 'cka',
    content: `
<h2>Network Policies in Practice</h2>
<p>Network Policies control pod-to-pod traffic. The CKA expects you to write policies that allow or deny specific traffic patterns.</p>

<h3>Default Deny All</h3>
<pre><code>apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress</code></pre>

<h3>Allow Specific Traffic</h3>
<pre><code>apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 80</code></pre>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Remember — if no NetworkPolicy selects a pod, all traffic is allowed. Once any policy selects it, only explicitly allowed traffic gets through.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run web --image=nginx --labels=app=web
kubectl run frontend --image=nginx --labels=app=frontend
kubectl get pods --show-labels</code></pre>
`,
    example: 'kubectl get pods --show-labels',
    challenges: [
      { id: 'cka-np-1', task: 'Create a pod "web" with label app=web', hint: 'kubectl run web --image=nginx --labels=app=web', answer: 'kubectl run web --image=nginx --labels=app=web', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'web' && r.labels['app'] === 'web') },
      { id: 'cka-np-2', task: 'Create a pod "frontend" with label app=frontend', hint: 'kubectl run frontend --image=nginx --labels=app=frontend', answer: 'kubectl run frontend --image=nginx --labels=app=frontend', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'frontend' && r.labels['app'] === 'frontend') },
    ],
  },

  // ── STORAGE (10%) ──
  {
    id: 'cka-storage',
    title: 'Persistent Volumes & Claims',
    category: 'Storage',
    course: 'cka',
    content: `
<h2>Persistent Volumes & Claims</h2>
<p>The CKA requires you to create PVs, PVCs, and mount them into pods. You also need to understand StorageClasses and dynamic provisioning.</p>

<h3>PV → PVC → Pod Flow</h3>
<ol>
  <li>Admin creates a <strong>PersistentVolume</strong> (PV) — the actual storage</li>
  <li>User creates a <strong>PersistentVolumeClaim</strong> (PVC) — a request for storage</li>
  <li>Kubernetes binds a matching PV to the PVC</li>
  <li>Pod mounts the PVC as a volume</li>
</ol>

<h3>Access Modes</h3>
<ul>
  <li><strong>ReadWriteOnce (RWO)</strong> — Single node read-write</li>
  <li><strong>ReadOnlyMany (ROX)</strong> — Multiple nodes read-only</li>
  <li><strong>ReadWriteMany (RWX)</strong> — Multiple nodes read-write</li>
</ul>

<h3>Reclaim Policies</h3>
<ul>
  <li><strong>Retain</strong> — Keep the data after PVC is deleted</li>
  <li><strong>Delete</strong> — Delete the storage when PVC is deleted</li>
  <li><strong>Recycle</strong> — Basic scrub (deprecated)</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Know how to create PVs and PVCs from YAML, and how to mount them in a pod spec. Also understand StorageClass for dynamic provisioning.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pv
kubectl get pvc
kubectl run db --image=postgres</code></pre>
`,
    example: 'kubectl get pv',
    challenges: [
      { id: 'cka-storage-1', task: 'Run a pod called "db" with postgres image', hint: 'kubectl run db --image=postgres', answer: 'kubectl run db --image=postgres', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'db') },
    ],
  },

  // ── TROUBLESHOOTING (30%) ──
  {
    id: 'cka-troubleshoot-cluster',
    title: 'Troubleshooting Clusters',
    category: 'Troubleshooting',
    course: 'cka',
    content: `
<h2>Troubleshooting Clusters</h2>
<p>Troubleshooting is the <strong>largest section</strong> of the CKA (30%). You need to diagnose and fix issues with nodes, pods, services, and networking.</p>

<h3>Node Troubleshooting</h3>
<pre><code># Check node status
kubectl get nodes
kubectl describe node node-1

# Check kubelet on the node
systemctl status kubelet
journalctl -u kubelet -f</code></pre>

<h3>Pod Troubleshooting</h3>
<pre><code># Check pod status and events
kubectl get pods
kubectl describe pod &lt;name&gt;
kubectl logs &lt;name&gt;
kubectl logs &lt;name&gt; --previous

# Debug with ephemeral container
kubectl exec -it &lt;name&gt; -- /bin/sh</code></pre>

<h3>Common Issues</h3>
<ul>
  <li><strong>ImagePullBackOff</strong> — Wrong image name or registry auth issue</li>
  <li><strong>CrashLoopBackOff</strong> — Container starts and immediately crashes (check logs)</li>
  <li><strong>Pending</strong> — No node can schedule the pod (resource constraints, taints, affinity)</li>
  <li><strong>NodeNotReady</strong> — Kubelet is down or node has issues</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Always start with <code>kubectl describe</code> and <code>kubectl logs</code>. The Events section in describe output is your best friend.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get nodes
kubectl describe node node-1
kubectl run broken --image=nonexistent-image
kubectl describe pod broken</code></pre>
`,
    example: 'kubectl get nodes',
    challenges: [
      { id: 'cka-trouble-1', task: 'Describe node-1 to check its status', hint: 'kubectl describe node node-1', answer: 'kubectl describe node node-1', validate: () => true },
      { id: 'cka-trouble-2', task: 'Run a pod called "broken" with a nonexistent image to see failure', hint: 'kubectl run broken --image=nonexistent', answer: 'kubectl run broken --image=nonexistent', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'broken') },
    ],
  },
  {
    id: 'cka-troubleshoot-apps',
    title: 'Troubleshooting Applications',
    category: 'Troubleshooting',
    course: 'cka',
    content: `
<h2>Troubleshooting Applications</h2>
<p>Beyond cluster-level issues, you need to debug application-level problems: services not routing, pods not connecting, config issues.</p>

<h3>Service Troubleshooting</h3>
<pre><code># Verify service endpoints
kubectl get endpoints &lt;svc-name&gt;

# Check if service selectors match pod labels
kubectl get svc &lt;name&gt; -o wide
kubectl get pods --show-labels

# Test connectivity from within the cluster
kubectl run test --image=busybox --rm -it -- wget -qO- http://&lt;svc-name&gt;</code></pre>

<h3>DNS Troubleshooting</h3>
<pre><code># Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Test DNS resolution
kubectl run dns-test --image=busybox --rm -it -- nslookup &lt;svc-name&gt;</code></pre>

<h3>Checklist</h3>
<ol>
  <li>Is the pod running? → <code>kubectl get pods</code></li>
  <li>Are there errors? → <code>kubectl logs</code> / <code>kubectl describe</code></li>
  <li>Does the service have endpoints? → <code>kubectl get endpoints</code></li>
  <li>Do labels match? → Compare service selector with pod labels</li>
  <li>Is DNS working? → Test with nslookup from a debug pod</li>
</ol>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run app --image=nginx --labels=app=myapp
kubectl expose pod app --port=80 --name=app-svc
kubectl get endpoints app-svc
kubectl describe svc app-svc</code></pre>
`,
    example: 'kubectl get endpoints',
    challenges: [
      { id: 'cka-troubleapp-1', task: 'Run a pod "app" with label app=myapp and expose it as "app-svc"', hint: 'kubectl run app --image=nginx --labels=app=myapp then kubectl expose pod app --port=80 --name=app-svc', answer: 'kubectl expose pod app --port=80 --name=app-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'app-svc') },
    ],
  },

  // ── CKA: CLUSTER ARCHITECTURE ADDITIONS ──
  {
    id: 'cka-ha-control-plane',
    title: 'High Availability Control Plane',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>High Availability Control Plane</h2>
<p>A production cluster needs a highly available (HA) control plane to survive node failures. The CKA expects you to understand how HA works.</p>

<h3>HA Architecture</h3>
<ul>
  <li><strong>Multiple control plane nodes</strong> — At least 3 for etcd quorum</li>
  <li><strong>Load balancer</strong> — Distributes API server traffic across control plane nodes</li>
  <li><strong>Stacked etcd</strong> — etcd runs on the same nodes as the control plane (simpler)</li>
  <li><strong>External etcd</strong> — etcd runs on dedicated nodes (more resilient)</li>
</ul>

<h3>kubeadm HA Setup</h3>
<pre><code># Initialize first control plane
kubeadm init --control-plane-endpoint "lb.example.com:6443" --upload-certs

# Join additional control plane nodes
kubeadm join lb.example.com:6443 --token &lt;token&gt; \\
  --discovery-token-ca-cert-hash sha256:&lt;hash&gt; \\
  --control-plane --certificate-key &lt;key&gt;</code></pre>

<h3>etcd Quorum</h3>
<table style="width:100%; border-collapse:collapse; font-size:0.85em; margin:12px 0;">
  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Nodes</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Quorum</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Tolerated Failures</th>
  </tr>
  <tr><td style="padding:6px 8px;">1</td><td style="padding:6px 8px;">1</td><td style="padding:6px 8px;">0</td></tr>
  <tr><td style="padding:6px 8px;">3</td><td style="padding:6px 8px;">2</td><td style="padding:6px 8px;">1</td></tr>
  <tr><td style="padding:6px 8px;">5</td><td style="padding:6px 8px;">3</td><td style="padding:6px 8px;">2</td></tr>
</table>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Always use an odd number of etcd members. Quorum = (n/2)+1. With 3 nodes you can lose 1; with 5 you can lose 2.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get nodes
kubectl get pods -n kube-system</code></pre>
`,
    example: 'kubectl get nodes',
    challenges: [
      { id: 'cka-ha-1', task: 'List all pods in kube-system to see control plane components', hint: 'kubectl get pods -n kube-system', answer: 'kubectl get pods -n kube-system', validate: () => true },
    ],
  },
  {
    id: 'cka-helm-kustomize',
    title: 'Helm & Kustomize',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>Helm & Kustomize</h2>
<p>The CKA now includes Helm and Kustomize as tools for installing and managing cluster components.</p>

<h3>Helm</h3>
<pre><code># Add a repo
helm repo add bitnami https://charts.bitnami.com/bitnami

# Search for charts
helm search repo nginx

# Install a release
helm install my-nginx bitnami/nginx -n web --create-namespace

# List releases
helm list -A

# Upgrade
helm upgrade my-nginx bitnami/nginx --set replicaCount=3

# Rollback
helm rollback my-nginx 1

# Uninstall
helm uninstall my-nginx -n web</code></pre>

<h3>Kustomize</h3>
<p>Kustomize is built into kubectl. It lets you customize YAML without templates.</p>
<pre><code># Directory structure
base/
  deployment.yaml
  kustomization.yaml
overlays/
  production/
    kustomization.yaml  # patches for prod

# Apply with kustomize
kubectl apply -k overlays/production/

# Preview what will be applied
kubectl kustomize overlays/production/</code></pre>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Know <code>kubectl apply -k</code> for Kustomize and basic Helm commands (install, upgrade, rollback, list, uninstall). Both are now on the exam.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create deployment helm-test --image=nginx --replicas=2
kubectl get deployments</code></pre>
`,
    example: 'kubectl get deployments',
    challenges: [
      { id: 'cka-helm-1', task: 'Create a deployment "helm-test" with 2 replicas', hint: 'kubectl create deployment helm-test --image=nginx --replicas=2', answer: 'kubectl create deployment helm-test --image=nginx --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'helm-test') },
    ],
  },
  {
    id: 'cka-cni-csi-cri',
    title: 'Extension Interfaces: CNI, CSI, CRI',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>Extension Interfaces: CNI, CSI, CRI</h2>
<p>Kubernetes uses plugin interfaces to keep the core modular. The CKA expects you to understand what each interface does.</p>

<h3>CRI — Container Runtime Interface</h3>
<p>Defines how the kubelet communicates with container runtimes.</p>
<ul>
  <li><strong>containerd</strong> — Most common, default in many distributions</li>
  <li><strong>CRI-O</strong> — Lightweight, designed specifically for Kubernetes</li>
  <li>Docker was removed as a direct runtime in K8s 1.24 (dockershim deprecation)</li>
</ul>

<h3>CNI — Container Network Interface</h3>
<p>Plugins that configure pod networking. Every cluster needs one.</p>
<ul>
  <li><strong>Calico</strong> — Network policies + BGP routing</li>
  <li><strong>Flannel</strong> — Simple overlay network (VXLAN)</li>
  <li><strong>Cilium</strong> — eBPF-based, advanced observability</li>
  <li><strong>Weave Net</strong> — Mesh networking</li>
</ul>

<h3>CSI — Container Storage Interface</h3>
<p>Standardized interface for storage providers to integrate with Kubernetes.</p>
<ul>
  <li>Enables dynamic provisioning via StorageClasses</li>
  <li>Providers: AWS EBS, GCE PD, Azure Disk, NFS, Ceph, etc.</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> You won't install these from scratch, but you need to know what each interface does, which plugins exist, and how to verify they're working (e.g., <code>kubectl get pods -n kube-system</code> to check CNI pods).
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pods -n kube-system
kubectl get nodes -o wide</code></pre>
`,
    example: 'kubectl get pods -n kube-system',
    challenges: [
      { id: 'cka-cni-1', task: 'List pods in kube-system to identify CNI components', hint: 'kubectl get pods -n kube-system', answer: 'kubectl get pods -n kube-system', validate: () => true },
    ],
  },
  {
    id: 'cka-crds-operators',
    title: 'CRDs & Operators',
    category: 'Cluster Setup',
    course: 'cka',
    content: `
<h2>CRDs & Operators</h2>
<p>Custom Resource Definitions (CRDs) extend the Kubernetes API with new resource types. Operators use CRDs to automate complex application management.</p>

<h3>Custom Resource Definitions</h3>
<pre><code>apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: databases.example.com
spec:
  group: example.com
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              engine:
                type: string
              replicas:
                type: integer
  scope: Namespaced
  names:
    plural: databases
    singular: database
    kind: Database
    shortNames: [db]</code></pre>

<h3>Operators</h3>
<p>An Operator = CRD + Controller. The controller watches for custom resources and takes action.</p>
<ul>
  <li><strong>Prometheus Operator</strong> — Manages Prometheus instances</li>
  <li><strong>Cert-Manager</strong> — Automates TLS certificate management</li>
  <li><strong>Database Operators</strong> — Manage database clusters (PostgreSQL, MySQL, etc.)</li>
</ul>

<pre><code># List CRDs in the cluster
kubectl get crds

# Create a custom resource
kubectl apply -f my-database.yaml

# List custom resources
kubectl get databases</code></pre>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Know how to list CRDs (<code>kubectl get crds</code>), understand what an Operator does, and be able to install one from a YAML manifest.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pods -n kube-system
kubectl get nodes</code></pre>
`,
    example: 'kubectl get nodes',
    challenges: [
      { id: 'cka-crd-1', task: 'Check the nodes in your cluster', hint: 'kubectl get nodes', answer: 'kubectl get nodes', validate: () => true },
    ],
  },

  // ── CKA: WORKLOADS ADDITIONS ──
  {
    id: 'cka-autoscaling',
    title: 'Workload Autoscaling',
    category: 'Workloads & Scheduling',
    course: 'cka',
    content: `
<h2>Workload Autoscaling</h2>
<p>The CKA now covers autoscaling. You need to understand HPA (Horizontal Pod Autoscaler) and how it works with the Metrics Server.</p>

<h3>Horizontal Pod Autoscaler (HPA)</h3>
<pre><code># Create an HPA
kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=80

# Check HPA status
kubectl get hpa

# Describe for details
kubectl describe hpa web</code></pre>

<h3>How HPA Works</h3>
<ol>
  <li>Metrics Server collects CPU/memory usage from kubelets</li>
  <li>HPA controller queries Metrics Server every 15 seconds</li>
  <li>Calculates desired replicas: <code>ceil(currentReplicas × (currentMetric / targetMetric))</code></li>
  <li>Scales the deployment up or down</li>
</ol>

<h3>Requirements</h3>
<ul>
  <li>Metrics Server must be installed</li>
  <li>Pods must have resource <strong>requests</strong> defined (HPA uses requests as the baseline)</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> HPA requires resource requests on pods. Without them, HPA can't calculate utilization percentage. Always set requests when using autoscaling.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create deployment web --image=nginx --replicas=2
kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=80
kubectl get hpa</code></pre>
`,
    example: 'kubectl create deployment web --image=nginx --replicas=2',
    challenges: [
      { id: 'cka-auto-1', task: 'Create deployment "web" with 2 replicas', hint: 'kubectl create deployment web --image=nginx --replicas=2', answer: 'kubectl create deployment web --image=nginx --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web') },
    ],
  },
  {
    id: 'cka-configmaps-secrets',
    title: 'ConfigMaps & Secrets for Admins',
    category: 'Workloads & Scheduling',
    course: 'cka',
    content: `
<h2>ConfigMaps & Secrets for Admins</h2>
<p>As a cluster admin, you need to manage application configuration and sensitive data across namespaces.</p>

<h3>ConfigMaps</h3>
<pre><code># Create from literals
kubectl create configmap app-config --from-literal=LOG_LEVEL=info --from-literal=ENV=prod

# Create from file
kubectl create configmap nginx-conf --from-file=nginx.conf

# View
kubectl get configmap app-config -o yaml</code></pre>

<h3>Secrets</h3>
<pre><code># Create generic secret
kubectl create secret generic db-creds --from-literal=username=admin --from-literal=password=s3cret

# Create TLS secret
kubectl create secret tls my-tls --cert=tls.crt --key=tls.key

# Create docker registry secret
kubectl create secret docker-registry regcred --docker-server=registry.io --docker-username=user --docker-password=pass</code></pre>

<h3>Consuming in Pods</h3>
<ul>
  <li><strong>Environment variables</strong> — <code>envFrom</code> or individual <code>valueFrom</code></li>
  <li><strong>Volume mounts</strong> — Files projected into the container filesystem</li>
  <li><strong>Secret types</strong> — Opaque, kubernetes.io/tls, kubernetes.io/dockerconfigjson</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Secrets are base64-encoded, not encrypted. For encryption at rest, configure <code>EncryptionConfiguration</code> on the API server.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create configmap app-config --from-literal=ENV=production
kubectl create secret generic db-creds --from-literal=user=admin
kubectl get configmaps
kubectl get secrets</code></pre>
`,
    example: 'kubectl get configmaps',
    challenges: [
      { id: 'cka-cm-1', task: 'Create configmap "app-config" with ENV=production', hint: 'kubectl create configmap app-config --from-literal=ENV=production', answer: 'kubectl create configmap app-config --from-literal=ENV=production', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-config') },
      { id: 'cka-cm-2', task: 'Create secret "db-creds" with user=admin', hint: 'kubectl create secret generic db-creds --from-literal=user=admin', answer: 'kubectl create secret generic db-creds --from-literal=user=admin', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-creds') },
    ],
  },

  // ── CKA: STORAGE ADDITIONS ──
  {
    id: 'cka-storageclasses',
    title: 'StorageClasses & Dynamic Provisioning',
    category: 'Storage',
    course: 'cka',
    content: `
<h2>StorageClasses & Dynamic Provisioning</h2>
<p>StorageClasses enable dynamic provisioning — PVCs automatically create PVs without admin intervention.</p>

<h3>StorageClass Definition</h3>
<pre><code>apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  fsType: ext4
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer</code></pre>

<h3>Volume Binding Modes</h3>
<ul>
  <li><strong>Immediate</strong> — PV is provisioned as soon as PVC is created</li>
  <li><strong>WaitForFirstConsumer</strong> — PV is provisioned when a pod using the PVC is scheduled (topology-aware)</li>
</ul>

<h3>Using a StorageClass</h3>
<pre><code>apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: fast-storage
  resources:
    requests:
      storage: 10Gi</code></pre>

<h3>Volume Types</h3>
<ul>
  <li><strong>emptyDir</strong> — Temporary, deleted when pod is removed</li>
  <li><strong>hostPath</strong> — Mounts a path from the host node (testing only)</li>
  <li><strong>PersistentVolumeClaim</strong> — Durable storage via PV/PVC</li>
  <li><strong>configMap / secret</strong> — Project config data as files</li>
  <li><strong>projected</strong> — Combine multiple volume sources</li>
</ul>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Know the difference between <code>Immediate</code> and <code>WaitForFirstConsumer</code> binding modes. Use <code>WaitForFirstConsumer</code> for topology-constrained storage (e.g., EBS volumes in specific AZs).
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get storageclass
kubectl get pv
kubectl get pvc</code></pre>
`,
    example: 'kubectl get pv',
    challenges: [
      { id: 'cka-sc-1', task: 'List persistent volumes in the cluster', hint: 'kubectl get pv', answer: 'kubectl get pv', validate: () => true },
    ],
  },

  // ── CKA: TROUBLESHOOTING ADDITIONS ──
  {
    id: 'cka-troubleshoot-components',
    title: 'Troubleshooting Cluster Components',
    category: 'Troubleshooting',
    course: 'cka',
    content: `
<h2>Troubleshooting Cluster Components</h2>
<p>The CKA expects you to diagnose issues with control plane components: API server, scheduler, controller-manager, etcd, and kubelet.</p>

<h3>Control Plane Components</h3>
<pre><code># Check static pod manifests
ls /etc/kubernetes/manifests/
# kube-apiserver.yaml, kube-controller-manager.yaml, kube-scheduler.yaml, etcd.yaml

# Check component status via pods
kubectl get pods -n kube-system

# View logs for control plane components
kubectl logs kube-apiserver-controlplane -n kube-system
kubectl logs kube-scheduler-controlplane -n kube-system</code></pre>

<h3>Kubelet Troubleshooting</h3>
<pre><code># Check kubelet status
systemctl status kubelet

# View kubelet logs
journalctl -u kubelet -f

# Common fixes
systemctl restart kubelet
systemctl enable kubelet</code></pre>

<h3>Common Component Issues</h3>
<table style="width:100%; border-collapse:collapse; font-size:0.85em; margin:12px 0;">
  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Component</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Symptom</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Check</th>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">API Server</td>
    <td style="padding:6px 8px;">kubectl commands fail</td>
    <td style="padding:6px 8px;">Static pod manifest, certs</td>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">Scheduler</td>
    <td style="padding:6px 8px;">Pods stuck in Pending</td>
    <td style="padding:6px 8px;">Scheduler pod logs</td>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">Controller Manager</td>
    <td style="padding:6px 8px;">Deployments don't scale</td>
    <td style="padding:6px 8px;">Controller manager logs</td>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">etcd</td>
    <td style="padding:6px 8px;">Cluster data inconsistent</td>
    <td style="padding:6px 8px;">etcd pod, member list</td>
  </tr>
  <tr>
    <td style="padding:6px 8px;">Kubelet</td>
    <td style="padding:6px 8px;">Node NotReady</td>
    <td style="padding:6px 8px;">systemctl, journalctl</td>
  </tr>
</table>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> Control plane components run as static pods managed by kubelet. If the API server is down, you can't use kubectl — check the manifest files directly on the node.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pods -n kube-system
kubectl describe node node-1
kubectl get events -n kube-system</code></pre>
`,
    example: 'kubectl get pods -n kube-system',
    challenges: [
      { id: 'cka-comp-1', task: 'List all pods in kube-system namespace', hint: 'kubectl get pods -n kube-system', answer: 'kubectl get pods -n kube-system', validate: () => true },
    ],
  },
  {
    id: 'cka-monitoring',
    title: 'Monitoring Resource Usage',
    category: 'Troubleshooting',
    course: 'cka',
    content: `
<h2>Monitoring Resource Usage</h2>
<p>The CKA tests your ability to monitor cluster and application resource usage using built-in tools.</p>

<h3>kubectl top</h3>
<pre><code># Node resource usage (requires Metrics Server)
kubectl top nodes

# Pod resource usage
kubectl top pods
kubectl top pods -n kube-system
kubectl top pods --sort-by=cpu
kubectl top pods --sort-by=memory

# Specific pod containers
kubectl top pod &lt;name&gt; --containers</code></pre>

<h3>Container Logs</h3>
<pre><code># Current logs
kubectl logs &lt;pod-name&gt;

# Follow logs in real-time
kubectl logs -f &lt;pod-name&gt;

# Previous container logs (after restart)
kubectl logs &lt;pod-name&gt; --previous

# Multi-container pod
kubectl logs &lt;pod-name&gt; -c &lt;container-name&gt;

# Last N lines
kubectl logs &lt;pod-name&gt; --tail=50

# Logs since a time
kubectl logs &lt;pod-name&gt; --since=1h</code></pre>

<h3>Events</h3>
<pre><code># All events in namespace
kubectl get events --sort-by='.lastTimestamp'

# Events for a specific resource
kubectl describe pod &lt;name&gt;  # Events section at bottom</code></pre>

<div class="info-box">
  <strong>💡 CKA Tip:</strong> <code>kubectl top</code> requires Metrics Server. Know how to sort by CPU or memory, and how to get logs from previous container instances and specific containers in multi-container pods.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run monitor-test --image=nginx
kubectl describe pod monitor-test
kubectl get events</code></pre>
`,
    example: 'kubectl get events',
    challenges: [
      { id: 'cka-mon-1', task: 'Run a pod "monitor-test" and check its events', hint: 'kubectl run monitor-test --image=nginx then kubectl describe pod monitor-test', answer: 'kubectl run monitor-test --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'monitor-test') },
    ],
  },

  // ── CKA LAB ──
  {
    id: 'cka-lab-full',
    title: 'Lab: CKA Practice Scenario',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: CKA Practice Scenario</h2>
<p>This lab simulates a CKA-style scenario. Complete all tasks to practice for the exam.</p>

<h3>Scenario</h3>
<p>You're a cluster administrator. Set up the following environment:</p>
<ol>
  <li>Create a namespace called <code>production</code></li>
  <li>Deploy an nginx pod called <code>web-server</code> in production</li>
  <li>Expose it as a NodePort service called <code>web-service</code></li>
  <li>Label node-1 with <code>env=production</code></li>
  <li>Create a role called <code>deployer</code> that can manage pods</li>
</ol>
`,
    example: 'kubectl create namespace production',
    challenges: [
      { id: 'cka-lab-1', task: 'Create namespace "production"', hint: 'kubectl create namespace production', answer: 'kubectl create namespace production', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'production') },
      { id: 'cka-lab-2', task: 'Run pod "web-server" with nginx in production namespace', hint: 'kubectl run web-server --image=nginx -n production', answer: 'kubectl run web-server --image=nginx -n production', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'web-server') },
      { id: 'cka-lab-3', task: 'Expose web-server as NodePort service "web-service"', hint: 'kubectl expose pod web-server --port=80 --type=NodePort --name=web-service -n production', answer: 'kubectl expose pod web-server --port=80 --type=NodePort --name=web-service -n production', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'web-service') },
      { id: 'cka-lab-4', task: 'Label node-1 with env=production', hint: 'kubectl label node node-1 env=production', answer: 'kubectl label node node-1 env=production', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.labels['env'] === 'production') },
      { id: 'cka-lab-5', task: 'Create role "deployer" that can get,list,create,delete pods', hint: 'kubectl create role deployer --verb=get,list,create,delete --resource=pods', answer: 'kubectl create role deployer --verb=get,list,create,delete --resource=pods', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'deployer') },
    ],
  },

  // ── CKA LAB: etcd Backup & Recovery ──
  {
    id: 'cka-lab-etcd-backup',
    title: 'Lab: etcd Backup & Recovery',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: etcd Backup & Recovery</h2>
<p>This lab simulates preparing a cluster for an etcd backup. You'll create resources that represent critical cluster data that would need to be preserved.</p>

<h3>Scenario</h3>
<p>Your team needs to perform an etcd backup before a major cluster upgrade. First, ensure the cluster has important data worth backing up:</p>
<ol>
  <li>Create a namespace called <code>backup-test</code></li>
  <li>Run a pod called <code>critical-app</code> with nginx in the backup-test namespace</li>
  <li>Create a configmap called <code>backup-config</code> with backup schedule data</li>
  <li>Label node-1 with <code>backup=enabled</code> to mark it as the backup target</li>
  <li>Run a pod called <code>etcd-helper</code> to simulate the backup utility</li>
</ol>
`,
    example: 'kubectl create namespace backup-test',
    challenges: [
      { id: 'cka-lab-etcd-1', task: 'Create namespace "backup-test"', hint: 'kubectl create namespace backup-test', answer: 'kubectl create namespace backup-test', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'backup-test') },
      { id: 'cka-lab-etcd-2', task: 'Run pod "critical-app" with nginx in backup-test namespace', hint: 'kubectl run critical-app --image=nginx -n backup-test', answer: 'kubectl run critical-app --image=nginx -n backup-test', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'critical-app') },
      { id: 'cka-lab-etcd-3', task: 'Create configmap "backup-config" with schedule=daily', hint: 'kubectl create configmap backup-config --from-literal=schedule=daily', answer: 'kubectl create configmap backup-config --from-literal=schedule=daily', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'backup-config') },
      { id: 'cka-lab-etcd-4', task: 'Label node-1 with backup=enabled', hint: 'kubectl label node node-1 backup=enabled', answer: 'kubectl label node node-1 backup=enabled', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.labels['backup'] === 'enabled') },
      { id: 'cka-lab-etcd-5', task: 'Run pod "etcd-helper" with busybox image', hint: 'kubectl run etcd-helper --image=busybox', answer: 'kubectl run etcd-helper --image=busybox', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'etcd-helper') },
    ],
  },

  // ── CKA LAB: RBAC Configuration ──
  {
    id: 'cka-lab-rbac',
    title: 'Lab: RBAC Configuration',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: RBAC Configuration</h2>
<p>This lab tests your ability to configure Role-Based Access Control from scratch — a core CKA skill.</p>

<h3>Scenario</h3>
<p>A new developer team needs access to the cluster. Set up RBAC so they can manage pods but nothing else:</p>
<ol>
  <li>Create a service account called <code>dev-sa</code></li>
  <li>Create a role called <code>pod-manager</code> that can get, list, create, and delete pods</li>
  <li>Create a rolebinding called <code>dev-pod-access</code> binding the role to the service account</li>
  <li>Create a clusterrole called <code>node-viewer</code> that can get and list nodes</li>
  <li>Verify access with <code>kubectl auth can-i</code></li>
</ol>
`,
    example: 'kubectl create serviceaccount dev-sa',
    challenges: [
      { id: 'cka-lab-rbac-1', task: 'Create service account "dev-sa"', hint: 'kubectl create serviceaccount dev-sa', answer: 'kubectl create serviceaccount dev-sa', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'dev-sa') },
      { id: 'cka-lab-rbac-2', task: 'Create role "pod-manager" with verbs get,list,create,delete on pods', hint: 'kubectl create role pod-manager --verb=get,list,create,delete --resource=pods', answer: 'kubectl create role pod-manager --verb=get,list,create,delete --resource=pods', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'pod-manager') },
      { id: 'cka-lab-rbac-3', task: 'Create rolebinding "dev-pod-access" binding pod-manager to dev-sa', hint: 'kubectl create rolebinding dev-pod-access --role=pod-manager --serviceaccount=default:dev-sa', answer: 'kubectl create rolebinding dev-pod-access --role=pod-manager --serviceaccount=default:dev-sa', validate: (c) => c.resources.some(r => r.type === 'rolebinding' && r.name === 'dev-pod-access') },
      { id: 'cka-lab-rbac-4', task: 'Create clusterrole "node-viewer" with verbs get,list on nodes', hint: 'kubectl create clusterrole node-viewer --verb=get,list --resource=nodes', answer: 'kubectl create clusterrole node-viewer --verb=get,list --resource=nodes', validate: (c) => c.resources.some(r => r.type === 'clusterrole' && r.name === 'node-viewer') },
      { id: 'cka-lab-rbac-5', task: 'Check if dev-sa can list pods', hint: 'kubectl auth can-i list pods --as system:serviceaccount:default:dev-sa', answer: 'kubectl auth can-i list pods --as system:serviceaccount:default:dev-sa', validate: () => true },
    ],
  },

  // ── CKA LAB: Node Maintenance ──
  {
    id: 'cka-lab-node-maintenance',
    title: 'Lab: Node Maintenance',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Node Maintenance</h2>
<p>This lab simulates performing maintenance on cluster nodes — a common CKA exam task.</p>

<h3>Scenario</h3>
<p>Node-2 needs a kernel upgrade. Prepare the cluster for maintenance:</p>
<ol>
  <li>Label node-1 with <code>role=worker</code></li>
  <li>Taint node-2 with <code>maintenance=true:NoSchedule</code> to prevent new pods</li>
  <li>Cordon node-2 to mark it as unschedulable</li>
  <li>Run a pod called <code>maintenance-pod</code> to verify it lands on node-1</li>
  <li>Label node-2 with <code>status=upgrading</code></li>
  <li>Uncordon node-2 after maintenance is complete</li>
</ol>
`,
    example: 'kubectl label node node-1 role=worker',
    challenges: [
      { id: 'cka-lab-nm-1', task: 'Label node-1 with role=worker', hint: 'kubectl label node node-1 role=worker', answer: 'kubectl label node node-1 role=worker', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.labels['role'] === 'worker') },
      { id: 'cka-lab-nm-2', task: 'Taint node-2 with maintenance=true:NoSchedule', hint: 'kubectl taint nodes node-2 maintenance=true:NoSchedule', answer: 'kubectl taint nodes node-2 maintenance=true:NoSchedule', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && Array.isArray((r.metadata as Record<string, unknown>)?.taints)) },
      { id: 'cka-lab-nm-3', task: 'Cordon node-2', hint: 'kubectl cordon node-2', answer: 'kubectl cordon node-2', validate: () => true },
      { id: 'cka-lab-nm-4', task: 'Run pod "maintenance-pod" with nginx image', hint: 'kubectl run maintenance-pod --image=nginx', answer: 'kubectl run maintenance-pod --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'maintenance-pod') },
      { id: 'cka-lab-nm-5', task: 'Label node-2 with status=upgrading', hint: 'kubectl label node node-2 status=upgrading', answer: 'kubectl label node node-2 status=upgrading', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && r.labels['status'] === 'upgrading') },
      { id: 'cka-lab-nm-6', task: 'Uncordon node-2', hint: 'kubectl uncordon node-2', answer: 'kubectl uncordon node-2', validate: () => true },
    ],
  },

  // ── CKA LAB: Service & Networking ──
  {
    id: 'cka-lab-networking',
    title: 'Lab: Service & Networking',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Service & Networking</h2>
<p>This lab covers creating deployments and exposing them with different service types — essential CKA networking skills.</p>

<h3>Scenario</h3>
<p>Deploy a multi-tier application with proper networking:</p>
<ol>
  <li>Create a deployment called <code>frontend</code> with nginx and 2 replicas</li>
  <li>Expose frontend as a ClusterIP service called <code>frontend-svc</code> on port 80</li>
  <li>Create a deployment called <code>backend</code> with httpd and 2 replicas</li>
  <li>Expose backend as a NodePort service called <code>backend-svc</code> on port 80</li>
  <li>Create an ingress called <code>app-ingress</code> routing to frontend-svc</li>
</ol>
`,
    example: 'kubectl create deployment frontend --image=nginx --replicas=2',
    challenges: [
      { id: 'cka-lab-net-1', task: 'Create deployment "frontend" with nginx and 2 replicas', hint: 'kubectl create deployment frontend --image=nginx --replicas=2', answer: 'kubectl create deployment frontend --image=nginx --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend') },
      { id: 'cka-lab-net-2', task: 'Expose frontend as ClusterIP service "frontend-svc" on port 80', hint: 'kubectl expose deployment frontend --port=80 --name=frontend-svc', answer: 'kubectl expose deployment frontend --port=80 --name=frontend-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'frontend-svc') },
      { id: 'cka-lab-net-3', task: 'Create deployment "backend" with httpd and 2 replicas', hint: 'kubectl create deployment backend --image=httpd --replicas=2', answer: 'kubectl create deployment backend --image=httpd --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'backend') },
      { id: 'cka-lab-net-4', task: 'Expose backend as NodePort service "backend-svc" on port 80', hint: 'kubectl expose deployment backend --port=80 --type=NodePort --name=backend-svc', answer: 'kubectl expose deployment backend --port=80 --type=NodePort --name=backend-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'backend-svc') },
      { id: 'cka-lab-net-5', task: 'Create ingress "app-ingress" routing to frontend-svc', hint: 'kubectl create ingress app-ingress --rule="app.example.com/=frontend-svc:80"', answer: 'kubectl create ingress app-ingress --rule="app.example.com/=frontend-svc:80"', validate: (c) => c.resources.some(r => r.type === 'ingress' && r.name === 'app-ingress') },
    ],
  },

  // ── CKA LAB: Storage Configuration ──
  {
    id: 'cka-lab-storage',
    title: 'Lab: Storage Configuration',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Storage Configuration</h2>
<p>This lab focuses on setting up storage-related resources for database workloads.</p>

<h3>Scenario</h3>
<p>Prepare the cluster for stateful database workloads:</p>
<ol>
  <li>Create a namespace called <code>databases</code></li>
  <li>Run a pod called <code>mysql-db</code> with mysql image in the databases namespace</li>
  <li>Run a pod called <code>postgres-db</code> with postgres image in the databases namespace</li>
  <li>Create a configmap called <code>db-config</code> with storage settings</li>
  <li>Create a secret called <code>db-credentials</code> for database passwords</li>
</ol>
`,
    example: 'kubectl create namespace databases',
    challenges: [
      { id: 'cka-lab-stor-1', task: 'Create namespace "databases"', hint: 'kubectl create namespace databases', answer: 'kubectl create namespace databases', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'databases') },
      { id: 'cka-lab-stor-2', task: 'Run pod "mysql-db" with mysql image in databases namespace', hint: 'kubectl run mysql-db --image=mysql -n databases', answer: 'kubectl run mysql-db --image=mysql -n databases', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'mysql-db') },
      { id: 'cka-lab-stor-3', task: 'Run pod "postgres-db" with postgres image in databases namespace', hint: 'kubectl run postgres-db --image=postgres -n databases', answer: 'kubectl run postgres-db --image=postgres -n databases', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'postgres-db') },
      { id: 'cka-lab-stor-4', task: 'Create configmap "db-config" with storage-type=ssd', hint: 'kubectl create configmap db-config --from-literal=storage-type=ssd -n databases', answer: 'kubectl create configmap db-config --from-literal=storage-type=ssd -n databases', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'db-config') },
      { id: 'cka-lab-stor-5', task: 'Create secret "db-credentials" with password=admin123', hint: 'kubectl create secret generic db-credentials --from-literal=password=admin123 -n databases', answer: 'kubectl create secret generic db-credentials --from-literal=password=admin123 -n databases', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-credentials') },
    ],
  },

  // ── CKA LAB: Cluster Troubleshooting ──
  {
    id: 'cka-lab-troubleshoot',
    title: 'Lab: Cluster Troubleshooting',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Cluster Troubleshooting</h2>
<p>This lab simulates a broken cluster environment. Diagnose and fix the issues.</p>

<h3>Scenario</h3>
<p>Several things are wrong in the cluster. Investigate and resolve:</p>
<ol>
  <li>Run a pod called <code>broken-app</code> with a bad image <code>nginx:nonexistent</code></li>
  <li>Describe the broken pod to see the error</li>
  <li>Run a working pod called <code>fixed-app</code> with nginx</li>
  <li>Expose fixed-app as service <code>fixed-svc</code> on port 80</li>
  <li>Describe the service to verify endpoints</li>
  <li>Run a debug pod called <code>debug-pod</code> with busybox for troubleshooting</li>
</ol>
`,
    example: 'kubectl run broken-app --image=nginx:nonexistent',
    challenges: [
      { id: 'cka-lab-ts-1', task: 'Run pod "broken-app" with image nginx:nonexistent', hint: 'kubectl run broken-app --image=nginx:nonexistent', answer: 'kubectl run broken-app --image=nginx:nonexistent', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'broken-app') },
      { id: 'cka-lab-ts-2', task: 'Describe the broken-app pod to see the error', hint: 'kubectl describe pod broken-app', answer: 'kubectl describe pod broken-app', validate: () => true },
      { id: 'cka-lab-ts-3', task: 'Run a working pod "fixed-app" with nginx', hint: 'kubectl run fixed-app --image=nginx', answer: 'kubectl run fixed-app --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'fixed-app') },
      { id: 'cka-lab-ts-4', task: 'Expose fixed-app as service "fixed-svc" on port 80', hint: 'kubectl expose pod fixed-app --port=80 --name=fixed-svc', answer: 'kubectl expose pod fixed-app --port=80 --name=fixed-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'fixed-svc') },
      { id: 'cka-lab-ts-5', task: 'Describe the fixed-svc service', hint: 'kubectl describe svc fixed-svc', answer: 'kubectl describe svc fixed-svc', validate: () => true },
      { id: 'cka-lab-ts-6', task: 'Run a debug pod "debug-pod" with busybox', hint: 'kubectl run debug-pod --image=busybox', answer: 'kubectl run debug-pod --image=busybox', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'debug-pod') },
    ],
  },

  // ── CKA LAB: Deployment & Scaling ──
  {
    id: 'cka-lab-deployments',
    title: 'Lab: Deployment & Scaling',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Deployment & Scaling</h2>
<p>This lab covers the full deployment lifecycle: create, scale, update, and rollback.</p>

<h3>Scenario</h3>
<p>Manage a production deployment through its lifecycle:</p>
<ol>
  <li>Create a deployment called <code>webapp</code> with nginx and 3 replicas</li>
  <li>Scale the deployment to 5 replicas</li>
  <li>Update the image to httpd using <code>set image</code></li>
  <li>Check the rollout status</li>
  <li>Roll back to the previous version</li>
</ol>
`,
    example: 'kubectl create deployment webapp --image=nginx --replicas=3',
    challenges: [
      { id: 'cka-lab-dep-1', task: 'Create deployment "webapp" with nginx and 3 replicas', hint: 'kubectl create deployment webapp --image=nginx --replicas=3', answer: 'kubectl create deployment webapp --image=nginx --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'webapp') },
      { id: 'cka-lab-dep-2', task: 'Scale webapp deployment to 5 replicas', hint: 'kubectl scale deployment webapp --replicas=5', answer: 'kubectl scale deployment webapp --replicas=5', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'webapp') },
      { id: 'cka-lab-dep-3', task: 'Update webapp image to httpd', hint: 'kubectl set image deployment/webapp nginx=httpd', answer: 'kubectl set image deployment/webapp nginx=httpd', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'webapp') },
      { id: 'cka-lab-dep-4', task: 'Check rollout status of webapp', hint: 'kubectl rollout status deployment/webapp', answer: 'kubectl rollout status deployment/webapp', validate: () => true },
      { id: 'cka-lab-dep-5', task: 'Roll back webapp to previous version', hint: 'kubectl rollout undo deployment/webapp', answer: 'kubectl rollout undo deployment/webapp', validate: () => true },
    ],
  },

  // ── CKA LAB: Multi-Cluster Namespaces ──
  {
    id: 'cka-lab-namespaces',
    title: 'Lab: Multi-Cluster Namespaces',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Multi-Cluster Namespaces</h2>
<p>This lab tests your ability to manage resources across multiple namespaces with proper access controls.</p>

<h3>Scenario</h3>
<p>Set up a multi-team cluster with isolated namespaces:</p>
<ol>
  <li>Create namespace <code>team-alpha</code></li>
  <li>Create namespace <code>team-beta</code></li>
  <li>Deploy <code>alpha-app</code> with nginx in team-alpha</li>
  <li>Deploy <code>beta-app</code> with httpd in team-beta</li>
  <li>Expose alpha-app as service <code>alpha-svc</code> in team-alpha</li>
  <li>Create a role called <code>namespace-admin</code> in team-alpha for full pod management</li>
</ol>
`,
    example: 'kubectl create namespace team-alpha',
    challenges: [
      { id: 'cka-lab-ns-1', task: 'Create namespace "team-alpha"', hint: 'kubectl create namespace team-alpha', answer: 'kubectl create namespace team-alpha', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'team-alpha') },
      { id: 'cka-lab-ns-2', task: 'Create namespace "team-beta"', hint: 'kubectl create namespace team-beta', answer: 'kubectl create namespace team-beta', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'team-beta') },
      { id: 'cka-lab-ns-3', task: 'Run pod "alpha-app" with nginx in team-alpha', hint: 'kubectl run alpha-app --image=nginx -n team-alpha', answer: 'kubectl run alpha-app --image=nginx -n team-alpha', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'alpha-app') },
      { id: 'cka-lab-ns-4', task: 'Run pod "beta-app" with httpd in team-beta', hint: 'kubectl run beta-app --image=httpd -n team-beta', answer: 'kubectl run beta-app --image=httpd -n team-beta', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'beta-app') },
      { id: 'cka-lab-ns-5', task: 'Expose alpha-app as service "alpha-svc" on port 80 in team-alpha', hint: 'kubectl expose pod alpha-app --port=80 --name=alpha-svc -n team-alpha', answer: 'kubectl expose pod alpha-app --port=80 --name=alpha-svc -n team-alpha', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'alpha-svc') },
      { id: 'cka-lab-ns-6', task: 'Create role "namespace-admin" with full pod access in team-alpha', hint: 'kubectl create role namespace-admin --verb=get,list,create,delete,update --resource=pods -n team-alpha', answer: 'kubectl create role namespace-admin --verb=get,list,create,delete,update --resource=pods -n team-alpha', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'namespace-admin') },
    ],
  },

  // ── CKA LAB: Security & Pod Hardening ──
  {
    id: 'cka-lab-security',
    title: 'Lab: Security & Pod Hardening',
    category: 'CKA Labs',
    course: 'cka',
    content: `
<h2>🧪 Lab: Security & Pod Hardening</h2>
<p>This lab focuses on securing workloads with service accounts, secrets, RBAC, and network segmentation labels.</p>

<h3>Scenario</h3>
<p>Harden a production namespace with least-privilege access:</p>
<ol>
  <li>Create a service account called <code>secure-sa</code></li>
  <li>Create a secret called <code>app-secret</code> with API key data</li>
  <li>Run a pod called <code>secure-app</code> with label <code>tier=frontend</code></li>
  <li>Run a pod called <code>db-pod</code> with label <code>tier=backend</code></li>
  <li>Create a role called <code>least-privilege</code> that can only get and list pods</li>
  <li>Create a rolebinding called <code>secure-binding</code> binding the role to secure-sa</li>
</ol>
`,
    example: 'kubectl create serviceaccount secure-sa',
    challenges: [
      { id: 'cka-lab-sec-1', task: 'Create service account "secure-sa"', hint: 'kubectl create serviceaccount secure-sa', answer: 'kubectl create serviceaccount secure-sa', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'secure-sa') },
      { id: 'cka-lab-sec-2', task: 'Create secret "app-secret" with api-key=supersecret', hint: 'kubectl create secret generic app-secret --from-literal=api-key=supersecret', answer: 'kubectl create secret generic app-secret --from-literal=api-key=supersecret', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'app-secret') },
      { id: 'cka-lab-sec-3', task: 'Run pod "secure-app" with nginx and label tier=frontend', hint: 'kubectl run secure-app --image=nginx --labels=tier=frontend', answer: 'kubectl run secure-app --image=nginx --labels=tier=frontend', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'secure-app' && r.labels['tier'] === 'frontend') },
      { id: 'cka-lab-sec-4', task: 'Run pod "db-pod" with postgres and label tier=backend', hint: 'kubectl run db-pod --image=postgres --labels=tier=backend', answer: 'kubectl run db-pod --image=postgres --labels=tier=backend', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'db-pod' && r.labels['tier'] === 'backend') },
      { id: 'cka-lab-sec-5', task: 'Create role "least-privilege" with get,list on pods', hint: 'kubectl create role least-privilege --verb=get,list --resource=pods', answer: 'kubectl create role least-privilege --verb=get,list --resource=pods', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'least-privilege') },
      { id: 'cka-lab-sec-6', task: 'Create rolebinding "secure-binding" binding least-privilege to secure-sa', hint: 'kubectl create rolebinding secure-binding --role=least-privilege --serviceaccount=default:secure-sa', answer: 'kubectl create rolebinding secure-binding --role=least-privilege --serviceaccount=default:secure-sa', validate: (c) => c.resources.some(r => r.type === 'rolebinding' && r.name === 'secure-binding') },
    ],
  },
];
