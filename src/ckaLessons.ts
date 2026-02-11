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
];
