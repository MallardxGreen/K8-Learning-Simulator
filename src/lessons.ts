import type { Lesson } from './types';
import type { CourseId } from './types';
import { ckaLessons } from './ckaLessons';
import { ckadLessons } from './ckadLessons';

export const lessons: Lesson[] = [
  // ── KUBERNETES FUNDAMENTALS ──
  {
    id: 'what-is-k8s',
    title: 'What is Kubernetes?',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>What is Kubernetes?</h2>
<p>Kubernetes (K8s) is an open-source <strong>container orchestration platform</strong> originally developed by Google. It automates the deployment, scaling, and management of containerized applications.</p>

<h3>Key Features</h3>
<ul>
  <li><strong>Self-healing</strong> — Restarts failed containers, replaces and reschedules them</li>
  <li><strong>Horizontal scaling</strong> — Scale your app up and down with a simple command or automatically</li>
  <li><strong>Service discovery & load balancing</strong> — Exposes containers using DNS or IP addresses</li>
  <li><strong>Automated rollouts & rollbacks</strong> — Gradually rolls out changes and rolls back if something goes wrong</li>
  <li><strong>Secret & configuration management</strong> — Deploy and update secrets and config without rebuilding images</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Kubernetes is a <em>graduated</em> project of the Cloud Native Computing Foundation (CNCF). It's the cornerstone of cloud native infrastructure.
</div>

<h3>Kubernetes vs Docker</h3>
<p>Docker is a <em>container runtime</em> — it builds and runs containers. Kubernetes is an <em>orchestrator</em> — it manages many containers across many machines. They complement each other.</p>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Check your cluster info
kubectl cluster-info

# Step 2: See the nodes in your cluster
kubectl get nodes

# Step 3: Create your first pod
kubectl run hello --image=nginx

# Step 4: See it running
kubectl get pods

# Step 5: Get all resources
kubectl get all</code></pre>
`,
    example: 'kubectl cluster-info',
    expectedCommands: ['kubectl cluster-info', 'kubectl get nodes', 'kubectl run hello'],
    hint: 'Try running kubectl cluster-info to see your simulated cluster.',
    challenges: [
      { id: 'k8s-1', task: 'Run a pod called "hello" using the nginx image', hint: 'kubectl run hello --image=nginx', answer: 'kubectl run hello --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'hello') },
      { id: 'k8s-2', task: 'Run a second pod called "world" using any image', hint: 'kubectl run world --image=redis', answer: 'kubectl run world --image=redis', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'world') },
      { id: 'k8s-3', task: 'Create a namespace called "test-ns"', hint: 'kubectl create namespace test-ns', answer: 'kubectl create namespace test-ns', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'test-ns') },
      { id: 'k8s-4', task: 'Create a deployment called "my-deploy" with the nginx image', hint: 'kubectl create deployment my-deploy --image=nginx', answer: 'kubectl create deployment my-deploy --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'my-deploy') },
      { id: 'k8s-5', task: 'Scale "my-deploy" to 3 replicas', hint: 'kubectl scale deployment/my-deploy --replicas=3', answer: 'kubectl scale deployment/my-deploy --replicas=3', validate: (c) => { const d = c.resources.find(r => r.type === 'deployment' && r.name === 'my-deploy'); return d?.metadata.replicas === 3; } },
    ],
  },
  {
    id: 'cluster-architecture',
    title: 'Cluster Architecture',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>Cluster Architecture</h2>
<p>A Kubernetes cluster consists of a <strong>Control Plane</strong> and one or more <strong>Worker Nodes</strong>.</p>

<h3>Control Plane Components</h3>
<table>
  <tr><th>Component</th><th>Role</th></tr>
  <tr><td><code>kube-apiserver</code></td><td>Front-end for the K8s API. All communication goes through it.</td></tr>
  <tr><td><code>etcd</code></td><td>Key-value store that holds all cluster data and state.</td></tr>
  <tr><td><code>kube-scheduler</code></td><td>Assigns Pods to Nodes based on resource requirements.</td></tr>
  <tr><td><code>kube-controller-manager</code></td><td>Runs controllers (ReplicaSet, Deployment, Node, etc.).</td></tr>
  <tr><td><code>cloud-controller-manager</code></td><td>Integrates with cloud provider APIs (load balancers, storage, etc.).</td></tr>
</table>

<h3>Worker Node Components</h3>
<table>
  <tr><th>Component</th><th>Role</th></tr>
  <tr><td><code>kubelet</code></td><td>Agent on each node. Ensures containers are running in Pods.</td></tr>
  <tr><td><code>kube-proxy</code></td><td>Network proxy that maintains network rules for Pod communication.</td></tr>
  <tr><td><code>Container Runtime</code></td><td>Software that runs containers (containerd, CRI-O).</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> The API server is the ONLY component that communicates directly with etcd. All other components go through the API server.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: See the nodes in your cluster
kubectl get nodes

# Step 2: Get cluster info
kubectl cluster-info

# Step 3: Describe a node to see its details
kubectl describe node node-1

# Step 4: Create a pod and see it scheduled
kubectl run test-pod --image=nginx
kubectl get pods</code></pre>
`,
    example: 'kubectl get nodes',
    expectedCommands: ['kubectl get nodes', 'kubectl cluster-info', 'kubectl describe node'],
    hint: 'Use kubectl get nodes to see the nodes in your cluster.',
    challenges: [
      { id: 'arch-1', task: 'Run a pod called "test-pod" to verify your cluster is working', hint: 'kubectl run test-pod --image=nginx', answer: 'kubectl run test-pod --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'test-pod') },
      { id: 'arch-2', task: 'Create a second pod called "worker" in the cluster', hint: 'kubectl run worker --image=nginx', answer: 'kubectl run worker --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'worker') },
      { id: 'arch-3', task: 'Create a namespace called "monitoring"', hint: 'kubectl create namespace monitoring', answer: 'kubectl create namespace monitoring', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'monitoring') },
      { id: 'arch-4', task: 'Create a deployment called "web" to see the controller chain', hint: 'kubectl create deployment web --image=nginx', answer: 'kubectl create deployment web --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web') },
    ],
  },
  // ── CONTAINER RUNTIMES & OCI ──
  {
    id: 'container-runtimes',
    title: 'Container Runtimes & OCI',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>🐳 Container Runtimes & OCI Standards</h2>
<p>Kubernetes doesn't run containers directly — it delegates to a <strong>container runtime</strong> via the <strong>Container Runtime Interface (CRI)</strong>.</p>

<h3>Container Runtime Interface (CRI)</h3>
<p>CRI is a plugin interface that lets the kubelet use different container runtimes without recompilation. Kubernetes removed built-in Docker support (dockershim) in v1.24.</p>

<pre><code>kubelet → CRI → Container Runtime → Containers
                    │
                    ├── containerd
                    ├── CRI-O
                    └── (others)</code></pre>

<h3>Container Runtimes</h3>
<table>
  <tr><th>Runtime</th><th>Description</th><th>Used By</th></tr>
  <tr><td><strong>containerd</strong></td><td>CNCF graduated, industry standard, extracted from Docker</td><td>EKS, GKE, AKS, Docker Desktop</td></tr>
  <tr><td><strong>CRI-O</strong></td><td>CNCF graduated, lightweight, built specifically for K8s</td><td>OpenShift, some bare-metal</td></tr>
  <tr><td><strong>Docker Engine</strong></td><td>Uses containerd under the hood, adds build/CLI tools</td><td>Development environments</td></tr>
</table>

<h3>Low-Level Runtimes (OCI Runtimes)</h3>
<p>The high-level runtime (containerd/CRI-O) delegates actual container creation to a low-level OCI runtime:</p>
<ul>
  <li><strong>runc</strong> — The reference OCI runtime (default for containerd and CRI-O)</li>
  <li><strong>crun</strong> — Written in C, faster and lighter than runc</li>
  <li><strong>gVisor (runsc)</strong> — Google's sandboxed runtime for extra isolation</li>
  <li><strong>Kata Containers</strong> — Runs containers in lightweight VMs for strong isolation</li>
</ul>

<pre><code>kubelet → CRI → containerd → runc → Linux namespaces/cgroups
                                      (actual container)</code></pre>

<h3>OCI Standards</h3>
<p>The <strong>Open Container Initiative (OCI)</strong> defines industry standards for containers:</p>
<ul>
  <li><strong>Image Spec</strong> — How container images are built and structured (layers, manifests, config)</li>
  <li><strong>Runtime Spec</strong> — How to run a container (filesystem bundle, lifecycle, config.json)</li>
  <li><strong>Distribution Spec</strong> — How to push/pull images from registries</li>
</ul>

<h3>Container Images</h3>
<p>A container image is a layered filesystem with metadata:</p>
<pre><code># Image layers (each instruction creates a layer)
FROM ubuntu:22.04          # Base layer
RUN apt-get update         # Layer 2
COPY app /app              # Layer 3
CMD ["/app/start"]         # Metadata (no layer)

# Image naming convention
registry/repository:tag
docker.io/library/nginx:1.25
gcr.io/my-project/my-app:v2.0.0

# Image digest (immutable reference)
nginx@sha256:abc123...</code></pre>

<h3>Container Registries</h3>
<table>
  <tr><th>Registry</th><th>Provider</th></tr>
  <tr><td>Docker Hub</td><td>Docker Inc.</td></tr>
  <tr><td>Amazon ECR</td><td>AWS</td></tr>
  <tr><td>Google Artifact Registry</td><td>GCP</td></tr>
  <tr><td>Azure Container Registry</td><td>Azure</td></tr>
  <tr><td>GitHub Container Registry</td><td>GitHub</td></tr>
  <tr><td>Harbor</td><td>CNCF graduated</td></tr>
</table>

<h3>Docker vs Kubernetes Relationship</h3>
<p>A common source of confusion:</p>
<ul>
  <li>Docker <strong>builds</strong> images → Kubernetes <strong>runs</strong> them</li>
  <li>Docker uses containerd internally → Kubernetes uses containerd directly via CRI</li>
  <li>Kubernetes removed dockershim in 1.24 → Docker images still work (they're OCI-compliant)</li>
  <li>You don't need Docker installed to run Kubernetes</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> containerd and CRI-O are both CNCF graduated projects. Kubernetes uses CRI to talk to container runtimes. Docker images work fine in K8s because they follow OCI standards. Know the three OCI specs: Image, Runtime, Distribution. Harbor is a CNCF graduated container registry. Dockershim was removed in K8s 1.24 but Docker-built images are unaffected.
</div>
`,
    example: 'kubectl get nodes',
    expectedCommands: ['kubectl get nodes', 'kubectl run', 'kubectl describe'],
    hint: 'Create pods with different container images to explore how runtimes work.',
    challenges: [
      { id: 'cri-1', task: 'Create a pod "nginx-container" using the nginx image', hint: 'kubectl run nginx-container --image=nginx', answer: 'kubectl run nginx-container --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'nginx-container') },
      { id: 'cri-2', task: 'Create a pod "alpine-shell" using the alpine image', hint: 'kubectl run alpine-shell --image=alpine', answer: 'kubectl run alpine-shell --image=alpine', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'alpine-shell' && r.metadata.image === 'alpine') },
      { id: 'cri-3', task: 'Create a pod "busybox-tools" using the busybox image', hint: 'kubectl run busybox-tools --image=busybox', answer: 'kubectl run busybox-tools --image=busybox', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'busybox-tools' && r.metadata.image === 'busybox') },
      { id: 'cri-4', task: 'Create a deployment "multi-runtime" with 2 replicas', hint: 'kubectl create deployment multi-runtime --image=nginx --replicas=2', answer: 'kubectl create deployment multi-runtime --image=nginx --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'multi-runtime') },
    ],
  },
  // ── PODS ──
  {
    id: 'pods',
    title: 'Pods',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>Pods</h2>
<p>A <strong>Pod</strong> is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster.</p>

<h3>Key Concepts</h3>
<ul>
  <li>A Pod can contain <strong>one or more containers</strong> that share storage and network</li>
  <li>Containers in a Pod share the same <strong>IP address</strong> and <strong>port space</strong></li>
  <li>Pods are <strong>ephemeral</strong> — they can be created, destroyed, and replaced at any time</li>
  <li>Each Pod gets a unique IP address within the cluster</li>
</ul>

<h3>Pod Lifecycle</h3>
<table>
  <tr><th>Phase</th><th>Description</th></tr>
  <tr><td><code>Pending</code></td><td>Pod accepted but containers not yet running</td></tr>
  <tr><td><code>Running</code></td><td>At least one container is running</td></tr>
  <tr><td><code>Succeeded</code></td><td>All containers terminated successfully</td></tr>
  <tr><td><code>Failed</code></td><td>At least one container terminated with error</td></tr>
  <tr><td><code>Unknown</code></td><td>Pod state cannot be determined</td></tr>
</table>

<h3>Labels & Selectors</h3>
<p>Labels are key-value pairs attached to resources. They're used by Services and Deployments to select which Pods to manage.</p>
<pre><code>kubectl run nginx --image=nginx --labels=app=web,tier=frontend
kubectl get pods --show-labels
kubectl label pod nginx env=production</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> You rarely create Pods directly in production. Instead, you use Deployments or other controllers that manage Pods for you. Labels are fundamental to how K8s connects resources.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a pod
kubectl run nginx --image=nginx

# Step 2: See your pod
kubectl get pods

# Step 3: Get details about it
kubectl describe pod nginx

# Step 4: Create a pod with labels
kubectl run frontend --image=nginx --labels=app=web,tier=frontend

# Step 5: Add a label to an existing pod
kubectl label pod nginx env=production

# Step 6: View labels
kubectl get pods --show-labels

# Step 7: Create another pod and delete it
kubectl run temp --image=busybox
kubectl delete pod temp</code></pre>
`,
    example: 'kubectl run nginx --image=nginx',
    expectedCommands: ['kubectl run nginx --image=nginx', 'kubectl get pods', 'kubectl label pod'],
    hint: 'Create a pod with kubectl run, then check it with kubectl get pods.',
    challenges: [
      { id: 'pod-1', task: 'Create a pod called "web-app" running the nginx image', hint: 'kubectl run <name> --image=<image>', answer: 'kubectl run web-app --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'web-app') },
      { id: 'pod-2', task: 'Create a pod called "cache" running the redis image', hint: 'Same as above but with a different name and image', answer: 'kubectl run cache --image=redis', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'cache' && r.metadata.image === 'redis') },
      { id: 'pod-3', task: 'Add the label "env=production" to the "web-app" pod', hint: 'kubectl label pod <name> key=value', answer: 'kubectl label pod web-app env=production', validate: (c) => { const p = c.resources.find(r => r.type === 'pod' && r.name === 'web-app'); return p?.labels?.env === 'production'; } },
      { id: 'pod-4', task: 'Label the "cache" pod with tier=backend', hint: 'kubectl label pod cache tier=backend', answer: 'kubectl label pod cache tier=backend', validate: (c) => { const p = c.resources.find(r => r.type === 'pod' && r.name === 'cache'); return p?.labels?.tier === 'backend'; } },
      { id: 'pod-5', task: 'Create a pod called "api-server" with the node image', hint: 'kubectl run api-server --image=node', answer: 'kubectl run api-server --image=node', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'api-server' && r.metadata.image === 'node') },
      { id: 'pod-6', task: 'Create a pod called "db" with the postgres image', hint: 'kubectl run db --image=postgres', answer: 'kubectl run db --image=postgres', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'db' && r.metadata.image === 'postgres') },
    ],
  },
  // ── DEPLOYMENTS ──
  {
    id: 'deployments',
    title: 'Deployments',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>Deployments</h2>
<p>A <strong>Deployment</strong> provides declarative updates for Pods and ReplicaSets. You describe a desired state, and the Deployment controller changes the actual state to match.</p>

<h3>The Deployment → ReplicaSet → Pod Chain</h3>
<ol>
  <li>The Deployment creates a <strong>ReplicaSet</strong></li>
  <li>The ReplicaSet creates the specified number of <strong>Pods</strong></li>
  <li>If a Pod dies, the ReplicaSet automatically creates a new one</li>
</ol>

<h3>Scaling</h3>
<p>Scale up or down by changing the replica count:</p>
<pre><code>kubectl scale deployment/webapp --replicas=5</code></pre>

<h3>Rolling Updates</h3>
<p>Update the container image — K8s gradually replaces old Pods with new ones:</p>
<pre><code>kubectl set image deployment/webapp nginx=nginx:1.25</code></pre>

<h3>Rollbacks</h3>
<p>If an update goes wrong, roll back to the previous version:</p>
<pre><code>kubectl rollout undo deployment/webapp</code></pre>

<h3>Rollout Management</h3>
<pre><code>kubectl rollout status deployment/webapp    # Check status
kubectl rollout history deployment/webapp   # View revision history
kubectl rollout restart deployment/webapp   # Restart all pods</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Deployments are the recommended way to manage stateless applications. For stateful apps, use StatefulSets. Rolling updates are the default strategy — zero downtime.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a deployment
kubectl create deployment webapp --image=nginx

# Step 2: See the chain: Deployment → ReplicaSet → Pod
kubectl get all

# Step 3: Scale to 3 replicas
kubectl scale deployment/webapp --replicas=3

# Step 4: Update the image (rolling update)
kubectl set image deployment/webapp nginx=nginx:1.25

# Step 5: Check rollout status
kubectl rollout status deployment/webapp

# Step 6: View rollout history
kubectl rollout history deployment/webapp

# Step 7: Roll back to previous version
kubectl rollout undo deployment/webapp

# Step 8: Restart all pods
kubectl rollout restart deployment/webapp</code></pre>
`,
    example: 'kubectl create deployment webapp --image=nginx',
    expectedCommands: ['kubectl create deployment', 'kubectl scale deployment', 'kubectl set image', 'kubectl rollout'],
    hint: 'Create a deployment, then try scaling, updating, and rolling back.',
    challenges: [
      { id: 'dep-1', task: 'Create a deployment called "frontend" with the nginx image', hint: 'kubectl create deployment <name> --image=<image>', answer: 'kubectl create deployment frontend --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend') },
      { id: 'dep-2', task: 'Scale "frontend" to 3 replicas', hint: 'kubectl scale deployment/<name> --replicas=<n>', answer: 'kubectl scale deployment/frontend --replicas=3', validate: (c) => { const dep = c.resources.find(r => r.type === 'deployment' && r.name === 'frontend'); return dep?.metadata.replicas === 3; } },
      { id: 'dep-3', task: 'Update "frontend" image to nginx:1.25 (rolling update)', hint: 'kubectl set image deployment/<name> <container>=<image>', answer: 'kubectl set image deployment/frontend nginx=nginx:1.25', validate: (c) => { const dep = c.resources.find(r => r.type === 'deployment' && r.name === 'frontend'); return dep?.metadata.image === 'nginx:1.25'; } },
      { id: 'dep-4', task: 'Roll back "frontend" to the previous version', hint: 'kubectl rollout undo deployment/<name>', answer: 'kubectl rollout undo deployment/frontend', validate: (c) => { const dep = c.resources.find(r => r.type === 'deployment' && r.name === 'frontend'); return (dep?.metadata.revision as number) >= 3; } },
      { id: 'dep-5', task: 'Create a second deployment called "backend" with 2 replicas', hint: 'Use --replicas flag', answer: 'kubectl create deployment backend --image=nginx --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'backend') },
    ],
  },
  // ── STATEFULSETS ──
  {
    id: 'statefulsets',
    title: 'StatefulSets',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>StatefulSets</h2>
<p>A <strong>StatefulSet</strong> manages stateful applications. Unlike Deployments, StatefulSets provide guarantees about the <strong>ordering and uniqueness</strong> of Pods.</p>

<h3>StatefulSet vs Deployment</h3>
<table>
  <tr><th>Feature</th><th>Deployment</th><th>StatefulSet</th></tr>
  <tr><td>Pod names</td><td>Random hash (e.g., web-7d9f5)</td><td>Ordered index (e.g., web-0, web-1, web-2)</td></tr>
  <tr><td>Scaling</td><td>All at once (parallel)</td><td>One at a time (ordered)</td></tr>
  <tr><td>Storage</td><td>Shared or none</td><td>Each Pod gets its own PersistentVolume</td></tr>
  <tr><td>Network identity</td><td>Random</td><td>Stable DNS name per Pod</td></tr>
  <tr><td>Use case</td><td>Stateless apps (web servers, APIs)</td><td>Databases, message queues, distributed systems</td></tr>
</table>

<h3>Key Properties</h3>
<ul>
  <li><strong>Stable network identity:</strong> Each Pod gets a predictable hostname: <code>&lt;statefulset-name&gt;-&lt;ordinal&gt;</code></li>
  <li><strong>Ordered deployment:</strong> Pods are created sequentially (0, 1, 2...) and deleted in reverse</li>
  <li><strong>Stable storage:</strong> Each Pod gets its own PersistentVolumeClaim via <code>volumeClaimTemplates</code></li>
  <li><strong>Headless Service required:</strong> A Service with <code>clusterIP: None</code> controls the network domain</li>
</ul>

<h3>DNS for StatefulSet Pods</h3>
<pre><code>&lt;pod-name&gt;.&lt;headless-service&gt;.&lt;namespace&gt;.svc.cluster.local
# Example: mysql-0.mysql-headless.default.svc.cluster.local</code></pre>

<h3>Common Use Cases</h3>
<ul>
  <li>Databases: MySQL, PostgreSQL, MongoDB replicas</li>
  <li>Message queues: Kafka, RabbitMQ</li>
  <li>Distributed systems: Elasticsearch, ZooKeeper, etcd</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> StatefulSets are for apps that need stable identity and persistent storage. Deployments are for stateless apps. Know when to use each.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a StatefulSet (auto-creates headless service)
kubectl create statefulset mysql --image=mysql --replicas=3

# See the ordered pods: mysql-0, mysql-1, mysql-2
kubectl get pods

# Scale the StatefulSet
kubectl scale statefulset/mysql --replicas=5

# Scale down (removes in reverse: mysql-4 first, then mysql-3)
kubectl scale statefulset/mysql --replicas=2</code></pre>
`,
    example: 'kubectl create statefulset mysql --image=mysql --replicas=3',
    expectedCommands: ['kubectl create statefulset', 'kubectl scale statefulset', 'kubectl get pods'],
    hint: 'StatefulSets create pods with ordered names: name-0, name-1, name-2...',
    challenges: [
      { id: 'ss-1', task: 'Create a StatefulSet called "db" with 3 replicas', hint: 'kubectl create statefulset db --image=mysql --replicas=3', answer: 'kubectl create statefulset db --image=mysql --replicas=3', validate: (c) => { const ss = c.resources.find(r => r.type === 'statefulset' && r.name === 'db'); return ss !== undefined && ss.metadata.replicas === 3; } },
      { id: 'ss-2', task: 'Scale "db" StatefulSet to 5 replicas', hint: 'kubectl scale statefulset/db --replicas=5', answer: 'kubectl scale statefulset/db --replicas=5', validate: (c) => { const ss = c.resources.find(r => r.type === 'statefulset' && r.name === 'db'); return ss?.metadata.replicas === 5; } },
      { id: 'ss-3', task: 'Expose the "db" StatefulSet on port 3306 as a ClusterIP service', hint: 'kubectl expose statefulset db --port=3306', answer: 'kubectl expose statefulset db --port=3306', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'db' && r.metadata.port === '3306') },
      { id: 'ss-4', task: 'Scale "db" back down to 2 replicas', hint: 'kubectl scale statefulset/db --replicas=2', answer: 'kubectl scale statefulset/db --replicas=2', validate: (c) => { const ss = c.resources.find(r => r.type === 'statefulset' && r.name === 'db'); return ss?.metadata.replicas === 2; } },
      { id: 'ss-5', task: 'Create a second StatefulSet "cache-ss" with redis and 2 replicas', hint: 'kubectl create statefulset cache-ss --image=redis --replicas=2', answer: 'kubectl create statefulset cache-ss --image=redis --replicas=2', validate: (c) => c.resources.some(r => r.type === 'statefulset' && r.name === 'cache-ss' && r.metadata.replicas === 2) },
    ],
  },
  // ── DAEMONSETS ──
  {
    id: 'daemonsets',
    title: 'DaemonSets',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>DaemonSets</h2>
<p>A <strong>DaemonSet</strong> ensures that <strong>all (or some) nodes</strong> run a copy of a Pod. When nodes are added to the cluster, Pods are added to them. When nodes are removed, those Pods are garbage collected.</p>

<h3>Common Use Cases</h3>
<ul>
  <li><strong>Log collection:</strong> Fluentd, Filebeat on every node</li>
  <li><strong>Monitoring agents:</strong> Prometheus Node Exporter, Datadog agent</li>
  <li><strong>Network plugins:</strong> Calico, Cilium, kube-proxy</li>
  <li><strong>Storage daemons:</strong> GlusterFS, Ceph on every node</li>
</ul>

<h3>DaemonSet vs Deployment</h3>
<table>
  <tr><th>Feature</th><th>Deployment</th><th>DaemonSet</th></tr>
  <tr><td>Pod count</td><td>You specify replicas</td><td>One per node (automatic)</td></tr>
  <tr><td>Scheduling</td><td>Scheduler decides which nodes</td><td>Runs on ALL matching nodes</td></tr>
  <tr><td>Scaling</td><td>Manual or HPA</td><td>Scales with cluster size</td></tr>
  <tr><td>Use case</td><td>Application workloads</td><td>Node-level infrastructure</td></tr>
</table>

<h3>Node Selection</h3>
<p>You can limit which nodes run the DaemonSet using <code>nodeSelector</code> or <code>nodeAffinity</code>.</p>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> DaemonSets automatically add tolerations for node conditions (not-ready, unreachable, disk-pressure, etc.) so they can run on problematic nodes. This is critical for infrastructure components.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a DaemonSet (creates one pod per node)
kubectl create daemonset log-agent --image=fluentd

# See pods — one per node
kubectl get pods

# Create another DaemonSet
kubectl create daemonset monitor --image=prometheus-node-exporter

# See all DaemonSets
kubectl get daemonsets</code></pre>
`,
    example: 'kubectl create daemonset log-agent --image=fluentd',
    expectedCommands: ['kubectl create daemonset', 'kubectl get daemonsets', 'kubectl get pods'],
    hint: 'DaemonSets create one pod per node automatically.',
    challenges: [
      { id: 'ds-1', task: 'Create a DaemonSet called "log-agent" with the fluentd image', hint: 'kubectl create daemonset log-agent --image=fluentd', answer: 'kubectl create daemonset log-agent --image=fluentd', validate: (c) => c.resources.some(r => r.type === 'daemonset' && r.name === 'log-agent') },
      { id: 'ds-2', task: 'Create a DaemonSet called "monitor" with the prometheus image', hint: 'kubectl create daemonset monitor --image=prometheus', answer: 'kubectl create daemonset monitor --image=prometheus', validate: (c) => c.resources.some(r => r.type === 'daemonset' && r.name === 'monitor') },
      { id: 'ds-3', task: 'Create a ConfigMap "log-config" for the log collector', hint: 'kubectl create configmap log-config', answer: 'kubectl create configmap log-config', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'log-config') },
      { id: 'ds-4', task: 'Create a DaemonSet called "network-plugin" with the calico image', hint: 'kubectl create daemonset network-plugin --image=calico', answer: 'kubectl create daemonset network-plugin --image=calico', validate: (c) => c.resources.some(r => r.type === 'daemonset' && r.name === 'network-plugin') },
      { id: 'ds-5', task: 'Create a DaemonSet called "security-agent" with the falco image', hint: 'kubectl create daemonset security-agent --image=falco', answer: 'kubectl create daemonset security-agent --image=falco', validate: (c) => c.resources.some(r => r.type === 'daemonset' && r.name === 'security-agent') },
    ],
  },
  // ── JOBS & CRONJOBS ──
  {
    id: 'jobs-cronjobs',
    title: 'Jobs & CronJobs',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>Jobs & CronJobs</h2>

<h3>Jobs</h3>
<p>A <strong>Job</strong> creates one or more Pods and ensures they run to <strong>completion</strong>. Unlike Deployments (which keep pods running forever), Jobs are for batch/one-off tasks.</p>

<h3>Job Types</h3>
<table>
  <tr><th>Type</th><th>completions</th><th>parallelism</th><th>Behavior</th></tr>
  <tr><td>Single</td><td>1</td><td>1</td><td>Run one Pod to completion</td></tr>
  <tr><td>Fixed count</td><td>N</td><td>1-M</td><td>Run N Pods total, M at a time</td></tr>
  <tr><td>Work queue</td><td>unset</td><td>N</td><td>Pods coordinate via external queue</td></tr>
</table>

<h3>CronJobs</h3>
<p>A <strong>CronJob</strong> creates Jobs on a repeating schedule, using standard cron syntax:</p>
<pre><code># ┌───── minute (0-59)
# │ ┌───── hour (0-23)
# │ │ ┌───── day of month (1-31)
# │ │ │ ┌───── month (1-12)
# │ │ │ │ ┌───── day of week (0-6, Sun=0)
# * * * * *
# Examples:
# */5 * * * *    Every 5 minutes
# 0 2 * * *      Daily at 2 AM
# 0 0 * * 0      Weekly on Sunday midnight</code></pre>

<h3>Key Properties</h3>
<ul>
  <li><strong>backoffLimit:</strong> Number of retries before marking Job as failed (default: 6)</li>
  <li><strong>activeDeadlineSeconds:</strong> Max time the Job can run</li>
  <li><strong>ttlSecondsAfterFinished:</strong> Auto-cleanup completed Jobs</li>
  <li><strong>concurrencyPolicy:</strong> Allow, Forbid, or Replace concurrent CronJob runs</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Jobs use <code>restartPolicy: Never</code> or <code>OnFailure</code> (never <code>Always</code>). CronJobs create Jobs on a schedule — they don't run Pods directly.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a Job
kubectl create job backup --image=busybox

# Create a Job with multiple completions
kubectl create job batch-process --image=python --completions=5 --parallelism=2

# Create a CronJob
kubectl create cronjob nightly-backup --image=busybox --schedule="0 2 * * *"

# See Jobs and CronJobs
kubectl get jobs
kubectl get cronjobs</code></pre>
`,
    example: 'kubectl create job backup --image=busybox',
    expectedCommands: ['kubectl create job', 'kubectl create cronjob', 'kubectl get jobs'],
    hint: 'Jobs run to completion. CronJobs create Jobs on a schedule.',
    challenges: [
      { id: 'job-1', task: 'Create a Job called "backup" with the busybox image', hint: 'kubectl create job backup --image=busybox', answer: 'kubectl create job backup --image=busybox', validate: (c) => c.resources.some(r => r.type === 'job' && r.name === 'backup') },
      { id: 'job-2', task: 'Create a Job called "batch" with 3 completions', hint: 'Use --completions=3 flag', answer: 'kubectl create job batch --image=python --completions=3', validate: (c) => { const j = c.resources.find(r => r.type === 'job' && r.name === 'batch'); return j?.metadata.completions === 3; } },
      { id: 'job-3', task: 'Create a CronJob called "nightly-report" that runs daily at 2 AM', hint: 'Use --schedule="0 2 * * *"', answer: 'kubectl create cronjob nightly-report --image=busybox --schedule="0 2 * * *"', validate: (c) => c.resources.some(r => r.type === 'cronjob' && r.name === 'nightly-report') },
      { id: 'job-4', task: 'Create a Job "data-process" with 5 completions and parallelism of 2', hint: 'Use --completions=5 --parallelism=2', answer: 'kubectl create job data-process --image=python --completions=5 --parallelism=2', validate: (c) => { const j = c.resources.find(r => r.type === 'job' && r.name === 'data-process'); return j?.metadata.completions === 5 && j?.metadata.parallelism === 2; } },
      { id: 'job-5', task: 'Create a Job "db-seed" with the postgres image', hint: 'kubectl create job db-seed --image=postgres', answer: 'kubectl create job db-seed --image=postgres', validate: (c) => c.resources.some(r => r.type === 'job' && r.name === 'db-seed') },
      { id: 'job-6', task: 'Create a CronJob "weekly-cleanup" with a weekly schedule', hint: 'Use --schedule="0 0 * * 0"', answer: 'kubectl create cronjob weekly-cleanup --image=busybox --schedule="0 0 * * 0"', validate: (c) => c.resources.some(r => r.type === 'cronjob' && r.name === 'weekly-cleanup') },
    ],
  },
  // ── NAMESPACES ──
  {
    id: 'namespaces',
    title: 'Namespaces',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>Namespaces</h2>
<p><strong>Namespaces</strong> divide cluster resources between multiple users or teams. They're like virtual clusters within a physical cluster.</p>

<h3>Default Namespaces</h3>
<table>
  <tr><th>Namespace</th><th>Purpose</th></tr>
  <tr><td><code>default</code></td><td>Where resources go if no namespace is specified</td></tr>
  <tr><td><code>kube-system</code></td><td>System components (DNS, proxy, etc.)</td></tr>
  <tr><td><code>kube-public</code></td><td>Publicly accessible data, like cluster info</td></tr>
  <tr><td><code>kube-node-lease</code></td><td>Node heartbeat data for the control plane</td></tr>
</table>

<h3>Working with Namespaces</h3>
<pre><code># Create a namespace
kubectl create namespace dev-team

# Run a pod in a specific namespace
kubectl run nginx --image=nginx -n dev-team

# List pods in a namespace
kubectl get pods -n dev-team

# List pods across ALL namespaces
kubectl get pods -A</code></pre>

<h3>Cross-Namespace Communication</h3>
<p>Services can be accessed across namespaces using their full DNS name:</p>
<pre><code>&lt;service-name&gt;.&lt;namespace&gt;.svc.cluster.local</code></pre>
<p>For example: <code>my-api.production.svc.cluster.local</code></p>

<h3>Namespaced vs Cluster-Scoped Resources</h3>
<table>
  <tr><th>Namespaced</th><th>Cluster-Scoped</th></tr>
  <tr><td>Pods, Deployments, Services, ConfigMaps, Secrets</td><td>Nodes, Namespaces, PersistentVolumes, ClusterRoles</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Not all resources are namespaced. Nodes, PersistentVolumes, and Namespaces themselves are <strong>cluster-scoped</strong>. Know the difference for the exam.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create namespaces
kubectl create namespace dev
kubectl create namespace staging
kubectl create namespace production

# Step 2: Deploy to specific namespaces
kubectl run api --image=nginx -n dev
kubectl create deployment web --image=nginx -n production

# Step 3: List resources per namespace
kubectl get pods -n dev
kubectl get all -n production

# Step 4: List everything across all namespaces
kubectl get all -A</code></pre>
`,
    example: 'kubectl create namespace dev-team',
    expectedCommands: ['kubectl create namespace', 'kubectl run', 'kubectl get pods -n'],
    hint: 'Create a namespace, then create resources inside it using the -n flag.',
    challenges: [
      { id: 'ns-1', task: 'Create a namespace called "production"', hint: 'kubectl create namespace <name>', answer: 'kubectl create namespace production', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'production') },
      { id: 'ns-2', task: 'Create a pod called "api" in the "production" namespace', hint: 'Use the -n flag to specify the namespace', answer: 'kubectl run api --image=nginx -n production', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'api' && r.namespace === 'production') },
      { id: 'ns-3', task: 'Create a namespace called "staging"', hint: 'kubectl create namespace staging', answer: 'kubectl create namespace staging', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'staging') },
      { id: 'ns-4', task: 'Create a deployment called "web" in the "staging" namespace', hint: 'kubectl create deployment web --image=nginx -n staging', answer: 'kubectl create deployment web --image=nginx -n staging', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web' && r.namespace === 'staging') },
      { id: 'ns-5', task: 'Create a ConfigMap "app-config" in the "production" namespace', hint: 'kubectl create configmap app-config -n production', answer: 'kubectl create configmap app-config -n production', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-config' && r.namespace === 'production') },
      { id: 'ns-6', task: 'Create a Secret "db-creds" in the "production" namespace', hint: 'kubectl create secret db-creds -n production', answer: 'kubectl create secret db-creds -n production', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-creds' && r.namespace === 'production') },
    ],
  },
  // ── CONFIGMAPS & SECRETS ──
  {
    id: 'configmaps-secrets',
    title: 'ConfigMaps & Secrets',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>ConfigMaps & Secrets</h2>

<h3>ConfigMaps</h3>
<p>A <strong>ConfigMap</strong> stores non-confidential configuration data as key-value pairs. Pods can consume ConfigMaps as environment variables, command-line arguments, or config files in a volume.</p>
<pre><code>kubectl create configmap app-config</code></pre>

<h3>Secrets</h3>
<p>A <strong>Secret</strong> is similar to a ConfigMap but designed for sensitive data like passwords, tokens, and keys. Values are base64-encoded (not encrypted by default!).</p>
<pre><code>kubectl create secret db-creds</code></pre>

<h3>Key Differences</h3>
<table>
  <tr><th>Feature</th><th>ConfigMap</th><th>Secret</th></tr>
  <tr><td>Data type</td><td>Non-sensitive config</td><td>Sensitive data</td></tr>
  <tr><td>Encoding</td><td>Plain text</td><td>Base64 encoded</td></tr>
  <tr><td>Size limit</td><td>1 MB</td><td>1 MB</td></tr>
  <tr><td>Encryption at rest</td><td>No</td><td>Optional (EncryptionConfiguration)</td></tr>
</table>

<h3>How Pods Use Them</h3>
<ul>
  <li><strong>Environment variables</strong> — inject key-value pairs into container env</li>
  <li><strong>Volume mounts</strong> — mount as files in the container filesystem</li>
  <li><strong>Command arguments</strong> — use values in container command/args</li>
</ul>

<h3>Secret Types</h3>
<table>
  <tr><th>Type</th><th>Use Case</th></tr>
  <tr><td><code>Opaque</code></td><td>Generic secret (default)</td></tr>
  <tr><td><code>kubernetes.io/tls</code></td><td>TLS certificates</td></tr>
  <tr><td><code>kubernetes.io/dockerconfigjson</code></td><td>Docker registry credentials</td></tr>
  <tr><td><code>kubernetes.io/service-account-token</code></td><td>Service account tokens</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Secrets are base64-encoded, NOT encrypted. For real security, enable encryption at rest or use external secret managers like AWS Secrets Manager or HashiCorp Vault.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a configmap
kubectl create configmap app-config

# Step 2: Create a secret
kubectl create secret db-creds

# Step 3: Create more config resources
kubectl create configmap redis-config
kubectl create secret api-token

# Step 4: See your config resources
kubectl get configmaps
kubectl get secrets

# Step 5: Describe them
kubectl describe configmap app-config
kubectl describe secret db-creds</code></pre>
`,
    example: 'kubectl create configmap app-config',
    expectedCommands: ['kubectl create configmap', 'kubectl create secret', 'kubectl get configmaps'],
    hint: 'Try creating configmaps and secrets, then inspect them.',
    challenges: [
      { id: 'cfg-1', task: 'Create a ConfigMap called "env-config"', hint: 'kubectl create configmap <name>', answer: 'kubectl create configmap env-config', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'env-config') },
      { id: 'cfg-2', task: 'Create a Secret called "api-keys"', hint: 'kubectl create secret <name>', answer: 'kubectl create secret api-keys', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'api-keys') },
      { id: 'cfg-3', task: 'Create a Secret called "tls-cert"', hint: 'kubectl create secret tls-cert', answer: 'kubectl create secret tls-cert', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'tls-cert') },
      { id: 'cfg-4', task: 'Create a ConfigMap called "app-settings"', hint: 'kubectl create configmap app-settings', answer: 'kubectl create configmap app-settings', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-settings') },
      { id: 'cfg-5', task: 'Create a Secret called "db-password"', hint: 'kubectl create secret db-password', answer: 'kubectl create secret db-password', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-password') },
      { id: 'cfg-6', task: 'Create a ConfigMap called "redis-config"', hint: 'kubectl create configmap redis-config', answer: 'kubectl create configmap redis-config', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'redis-config') },
    ],
  },
  // ── SCHEDULING ──
  {
    id: 'scheduling',
    title: 'Scheduling: Taints, Tolerations & Affinity',
    category: 'Kubernetes Fundamentals',
    course: 'kcna',
    content: `
<h2>📅 Scheduling: Taints, Tolerations & Node Affinity</h2>
<p>Kubernetes scheduling determines <strong>which node</strong> a Pod runs on. The scheduler considers resource requests, node selectors, taints/tolerations, and affinity rules.</p>

<h3>Taints & Tolerations</h3>
<p>A <strong>taint</strong> is applied to a node to repel Pods that don't tolerate it. A <strong>toleration</strong> is applied to a Pod to allow it to schedule onto tainted nodes.</p>

<pre><code># Taint a node (repel pods without matching toleration)
kubectl taint nodes node1 key=value:NoSchedule

# Remove a taint
kubectl taint nodes node1 key=value:NoSchedule-

# Taint effects:
# - NoSchedule: Don't schedule new pods
# - PreferNoSchedule: Try to avoid, but not guaranteed
# - NoExecute: Evict existing pods too</code></pre>

<h3>Toleration Example (Pod spec)</h3>
<pre><code>tolerations:
- key: "key"
  operator: "Equal"
  value: "value"
  effect: "NoSchedule"</code></pre>

<h3>Node Selectors & Node Affinity</h3>
<p><strong>nodeSelector</strong> is the simplest way to constrain Pods to nodes with specific labels. <strong>Node Affinity</strong> is more expressive — it supports "preferred" vs "required" and set-based operators.</p>

<pre><code># Label a node
kubectl label nodes node1 disktype=ssd

# nodeSelector in Pod spec:
nodeSelector:
  disktype: ssd

# Node Affinity (more powerful):
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: disktype
          operator: In
          values: [ssd]</code></pre>

<h3>Pod Affinity & Anti-Affinity</h3>
<p><strong>Pod Affinity</strong> schedules Pods near other Pods (e.g., co-locate frontend with cache). <strong>Pod Anti-Affinity</strong> spreads Pods apart (e.g., don't put two replicas on the same node).</p>

<h3>Cordon & Drain</h3>
<pre><code># Cordon: mark node as unschedulable (existing pods stay)
kubectl cordon node1

# Uncordon: allow scheduling again
kubectl uncordon node1

# Drain: cordon + evict all pods (for maintenance)
kubectl drain node1 --ignore-daemonsets</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Taints are on nodes, tolerations are on Pods. The scheduler uses a filtering → scoring pipeline. Resource requests/limits affect scheduling (a Pod won't be placed on a node without enough resources). DaemonSet Pods tolerate taints by default.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Taint a node
kubectl taint nodes node-1 env=prod:NoSchedule

# Cordon a node
kubectl cordon node-1

# Uncordon it
kubectl uncordon node-1

# Drain a node
kubectl drain node-2 --ignore-daemonsets

# Label a node
kubectl label nodes node-2 disktype=ssd

# Taint another node
kubectl taint nodes node-2 gpu=true:NoSchedule</code></pre>
`,
    example: 'kubectl taint nodes node1 env=prod:NoSchedule',
    expectedCommands: ['kubectl taint', 'kubectl cordon', 'kubectl uncordon', 'kubectl label'],
    hint: 'Use kubectl taint to add taints and kubectl cordon to mark nodes unschedulable.',
    challenges: [
      { id: 'sched-1', task: 'Taint node-1 with env=prod:NoSchedule', hint: 'kubectl taint nodes node-1 env=prod:NoSchedule', answer: 'kubectl taint nodes node-1 env=prod:NoSchedule', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && Array.isArray(r.metadata.taints) && (r.metadata.taints as string[]).some(t => t.startsWith('env='))) },
      { id: 'sched-2', task: 'Label node-2 with disktype=ssd for nodeSelector targeting', hint: 'kubectl label nodes node-2 disktype=ssd', answer: 'kubectl label nodes node-2 disktype=ssd', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && r.labels.disktype === 'ssd') },
      { id: 'sched-3', task: 'Cordon node-1 to prevent new scheduling', hint: 'kubectl cordon node-1', answer: 'kubectl cordon node-1', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.metadata.status === 'Ready,SchedulingDisabled') },
      { id: 'sched-4', task: 'Drain node-2 to evict all pods (with --ignore-daemonsets)', hint: 'kubectl drain node-2 --ignore-daemonsets', answer: 'kubectl drain node-2 --ignore-daemonsets', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && r.metadata.status === 'Ready,SchedulingDisabled') },
      { id: 'sched-5', task: 'Uncordon node-2 after drain to allow scheduling again', hint: 'kubectl uncordon node-2', answer: 'kubectl uncordon node-2', validate: (c) => { const n1 = c.resources.find(r => r.type === 'node' && r.name === 'node-1'); const n2 = c.resources.find(r => r.type === 'node' && r.name === 'node-2'); return n1?.metadata.status === 'Ready,SchedulingDisabled' && n2?.labels?.disktype === 'ssd' && n2?.metadata.status === 'Ready'; } },
      { id: 'sched-6', task: 'Taint node-2 with gpu=true:NoSchedule', hint: 'kubectl taint nodes node-2 gpu=true:NoSchedule', answer: 'kubectl taint nodes node-2 gpu=true:NoSchedule', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && Array.isArray(r.metadata.taints) && (r.metadata.taints as string[]).some(t => t.startsWith('gpu='))) },
      { id: 'sched-7', task: 'Label node-1 with tier=backend for workload targeting', hint: 'kubectl label nodes node-1 tier=backend', answer: 'kubectl label nodes node-1 tier=backend', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.labels.tier === 'backend') },
    ],
  },
  // ── SERVICES ──
  {
    id: 'services',
    title: 'Services',
    category: 'Container Orchestration',
    course: 'kcna',
    content: `
<h2>Services</h2>
<p>A <strong>Service</strong> provides stable networking for ephemeral Pods. Pods get new IPs when recreated — Services give you a <strong>stable IP and DNS name</strong>.</p>

<h3>Service Types</h3>
<table>
  <tr><th>Type</th><th>Description</th><th>Use Case</th></tr>
  <tr><td><code>ClusterIP</code></td><td>Internal cluster IP only. Default type.</td><td>Internal microservice communication</td></tr>
  <tr><td><code>NodePort</code></td><td>Exposes on each Node's IP at a static port (30000-32767).</td><td>Development, testing, direct node access</td></tr>
  <tr><td><code>LoadBalancer</code></td><td>Provisions an external load balancer (cloud provider).</td><td>Production external traffic</td></tr>
  <tr><td><code>ExternalName</code></td><td>Maps to a DNS name (CNAME). No proxying.</td><td>Referencing external services</td></tr>
</table>

<h3>Creating Each Type</h3>
<pre><code># ClusterIP (default)
kubectl expose deployment webapp --port=80

# NodePort
kubectl expose deployment webapp --port=80 --type=NodePort

# LoadBalancer
kubectl expose deployment webapp --port=80 --type=LoadBalancer

# Standalone service with type
kubectl create service my-svc --port=80 --type=NodePort

# ExternalName
kubectl create service ext-db --port=5432 --type=ExternalName --external-name=db.example.com</code></pre>

<h3>How Services Route Traffic</h3>
<p>Services use <strong>label selectors</strong> to find Pods. When you <code>expose</code> a deployment, the Service inherits the deployment's labels and routes traffic to matching Pods.</p>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> ClusterIP is the default and most common type. NodePort builds on ClusterIP (you get both). LoadBalancer builds on NodePort (you get all three). Know this hierarchy for the exam.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a deployment to expose
kubectl create deployment webapp --image=nginx --replicas=2

# Step 2: Expose as ClusterIP (default)
kubectl expose deployment webapp --port=80

# Step 3: Create a NodePort service
kubectl create deployment api --image=nginx
kubectl expose deployment api --port=8080 --type=NodePort

# Step 4: Create a LoadBalancer service
kubectl create deployment web --image=nginx
kubectl expose deployment web --port=80 --type=LoadBalancer

# Step 5: Create a standalone ExternalName service
kubectl create service ext-db --port=5432 --type=ExternalName

# Step 6: See all services
kubectl get services</code></pre>
`,
    example: 'kubectl expose deployment webapp --port=80',
    expectedCommands: ['kubectl expose deployment', 'kubectl create service', 'kubectl get services'],
    hint: 'Create deployments first, then expose them with different service types.',
    challenges: [
      { id: 'svc-1', task: 'Create a deployment "webapp" and expose it as a ClusterIP service on port 80', hint: 'Create deployment, then kubectl expose deployment webapp --port=80', answer: 'kubectl create deployment webapp --image=nginx\nkubectl expose deployment webapp --port=80', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'webapp' && r.metadata.type === 'ClusterIP') },
      { id: 'svc-2', task: 'Create a deployment "api" and expose it as a NodePort service on port 8080', hint: 'Use --type=NodePort flag', answer: 'kubectl create deployment api --image=nginx\nkubectl expose deployment api --port=8080 --type=NodePort', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'api' && r.metadata.type === 'NodePort') },
      { id: 'svc-3', task: 'Create a deployment "web" and expose it as a LoadBalancer on port 80', hint: 'Use --type=LoadBalancer flag', answer: 'kubectl create deployment web --image=nginx\nkubectl expose deployment web --port=80 --type=LoadBalancer', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'web' && r.metadata.type === 'LoadBalancer') },
      { id: 'svc-4', task: 'Create a standalone ExternalName service called "ext-db" on port 5432', hint: 'kubectl create service ext-db --port=5432 --type=ExternalName', answer: 'kubectl create service ext-db --port=5432 --type=ExternalName', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'ext-db' && r.metadata.type === 'ExternalName') },
    ],
  },
  // ── INGRESS ──
  {
    id: 'ingress',
    title: 'Ingress',
    category: 'Container Orchestration',
    course: 'kcna',
    content: `
<h2>Ingress</h2>
<p>An <strong>Ingress</strong> manages external HTTP/HTTPS access to services in a cluster. It provides load balancing, SSL termination, and name-based virtual hosting.</p>

<h3>Ingress vs Service</h3>
<ul>
  <li>A <strong>Service</strong> (NodePort/LoadBalancer) exposes a single service externally</li>
  <li>An <strong>Ingress</strong> can route traffic to multiple services based on URL path or hostname</li>
</ul>

<h3>How Ingress Works</h3>
<ol>
  <li>You create an <strong>Ingress resource</strong> (the routing rules)</li>
  <li>An <strong>Ingress Controller</strong> (like NGINX, Traefik, or AWS ALB) reads the rules and configures routing</li>
  <li>External traffic hits the Ingress Controller, which routes it to the correct Service</li>
</ol>

<h3>Popular Ingress Controllers</h3>
<table>
  <tr><th>Controller</th><th>Provider</th></tr>
  <tr><td>NGINX Ingress Controller</td><td>Community / F5</td></tr>
  <tr><td>Traefik</td><td>Traefik Labs</td></tr>
  <tr><td>AWS ALB Ingress Controller</td><td>Amazon</td></tr>
  <tr><td>Istio Gateway</td><td>Istio</td></tr>
  <tr><td>Contour</td><td>VMware</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> An Ingress resource alone does nothing — you need an <strong>Ingress Controller</strong> running in the cluster to implement the rules. Know the difference.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a deployment and service first
kubectl create deployment api --image=nginx
kubectl expose deployment api --port=80

# Step 2: Create another deployment and service
kubectl create deployment web --image=nginx
kubectl expose deployment web --port=80

# Step 3: Create ingress resources
kubectl create ingress api-ingress
kubectl create ingress web-ingress

# Step 4: See all networking resources
kubectl get services
kubectl get ingress</code></pre>
`,
    example: 'kubectl create ingress app-ingress',
    expectedCommands: ['kubectl create ingress', 'kubectl get ingress', 'kubectl get services'],
    hint: 'Create deployments and services first, then create ingress resources.',
    challenges: [
      { id: 'ing-1', task: 'Create a deployment "api" and expose it as a service on port 80', hint: 'kubectl create deployment api --image=nginx, then expose it', answer: 'kubectl create deployment api --image=nginx\nkubectl expose deployment api --port=80', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'api') },
      { id: 'ing-2', task: 'Create an ingress called "api-ingress"', hint: 'kubectl create ingress <name>', answer: 'kubectl create ingress api-ingress', validate: (c) => c.resources.some(r => r.type === 'ingress' && r.name === 'api-ingress') },
      { id: 'ing-3', task: 'Create a second deployment "web", expose it, and create "web-ingress"', hint: 'Three commands: deployment, expose, ingress', answer: 'kubectl create deployment web --image=nginx\nkubectl expose deployment web --port=80\nkubectl create ingress web-ingress', validate: (c) => c.resources.some(r => r.type === 'ingress' && r.name === 'web-ingress') },
      { id: 'ing-4', task: 'Create a deployment "admin" and expose it on port 8080', hint: 'kubectl create deployment admin --image=nginx then expose', answer: 'kubectl create deployment admin --image=nginx\nkubectl expose deployment admin --port=8080', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'admin') },
      { id: 'ing-5', task: 'Create an ingress called "admin-ingress"', hint: 'kubectl create ingress admin-ingress', answer: 'kubectl create ingress admin-ingress', validate: (c) => c.resources.some(r => r.type === 'ingress' && r.name === 'admin-ingress') },
    ],
  },
  // ── NETWORK POLICIES ──
  {
    id: 'network-policies',
    title: 'Network Policies',
    category: 'Container Orchestration',
    course: 'kcna',
    content: `
<h2>Network Policies</h2>
<p><strong>NetworkPolicies</strong> control traffic flow between Pods at the IP/port level (OSI Layer 3-4). By default, all Pods can communicate with all other Pods — NetworkPolicies restrict this.</p>

<h3>Key Concepts</h3>
<ul>
  <li>NetworkPolicies are <strong>additive</strong> — there are no "deny" rules, only "allow"</li>
  <li>If no NetworkPolicy selects a Pod, all traffic is allowed (default open)</li>
  <li>Once ANY NetworkPolicy selects a Pod, only explicitly allowed traffic is permitted</li>
  <li>Requires a <strong>CNI plugin</strong> that supports NetworkPolicy (Calico, Cilium, Weave Net)</li>
</ul>

<h3>Policy Types</h3>
<table>
  <tr><th>Type</th><th>Controls</th></tr>
  <tr><td><strong>Ingress</strong></td><td>Incoming traffic TO the selected Pods</td></tr>
  <tr><td><strong>Egress</strong></td><td>Outgoing traffic FROM the selected Pods</td></tr>
</table>

<h3>Selectors</h3>
<ul>
  <li><strong>podSelector:</strong> Select Pods by label in the same namespace</li>
  <li><strong>namespaceSelector:</strong> Select all Pods in matching namespaces</li>
  <li><strong>ipBlock:</strong> Select by CIDR range (for external traffic)</li>
</ul>

<h3>Common Patterns</h3>
<pre><code># Default deny all ingress traffic
# (select all pods, allow nothing)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress

# Allow traffic only from frontend to backend
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> NetworkPolicies require a CNI plugin that supports them. Creating a NetworkPolicy without a supporting CNI has no effect. Calico and Cilium are the most popular choices.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a NetworkPolicy
kubectl create networkpolicy deny-all --pod-selector=app=web --policy-type=Ingress

# Create another policy
kubectl create networkpolicy allow-frontend --pod-selector=app=api

# See NetworkPolicies
kubectl get networkpolicies</code></pre>
`,
    example: 'kubectl create networkpolicy deny-all --pod-selector=app=web',
    expectedCommands: ['kubectl create networkpolicy', 'kubectl get networkpolicies'],
    hint: 'NetworkPolicies control which Pods can talk to each other.',
    challenges: [
      { id: 'np-1', task: 'Create a NetworkPolicy called "deny-all" for pods with app=web', hint: 'kubectl create networkpolicy deny-all --pod-selector=app=web', answer: 'kubectl create networkpolicy deny-all --pod-selector=app=web --policy-type=Ingress', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'deny-all') },
      { id: 'np-2', task: 'Create a NetworkPolicy called "allow-api" for the api pods', hint: 'kubectl create networkpolicy allow-api --pod-selector=app=api', answer: 'kubectl create networkpolicy allow-api --pod-selector=app=api', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'allow-api') },
      { id: 'np-3', task: 'Create a NetworkPolicy called "frontend-policy" for frontend pods', hint: 'kubectl create networkpolicy frontend-policy --pod-selector=app=frontend', answer: 'kubectl create networkpolicy frontend-policy --pod-selector=app=frontend', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'frontend-policy') },
      { id: 'np-4', task: 'Create a NetworkPolicy called "egress-restrict" with Egress policy type', hint: 'kubectl create networkpolicy egress-restrict --pod-selector=app=db --policy-type=Egress', answer: 'kubectl create networkpolicy egress-restrict --pod-selector=app=db --policy-type=Egress', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'egress-restrict') },
      { id: 'np-5', task: 'Create a NetworkPolicy called "backend-isolate" for backend pods', hint: 'kubectl create networkpolicy backend-isolate --pod-selector=app=backend', answer: 'kubectl create networkpolicy backend-isolate --pod-selector=app=backend', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'backend-isolate') },
    ],
  },
  // ── PERSISTENT VOLUMES ──
  {
    id: 'persistent-volumes',
    title: 'Persistent Volumes',
    category: 'Container Orchestration',
    course: 'kcna',
    content: `
<h2>Persistent Volumes & Claims</h2>
<p>Kubernetes storage abstracts the details of <em>how</em> storage is provided from <em>how</em> it is consumed.</p>

<h3>The Storage Model</h3>
<table>
  <tr><th>Resource</th><th>Who Creates It</th><th>Purpose</th></tr>
  <tr><td><strong>PersistentVolume (PV)</strong></td><td>Admin or dynamic provisioner</td><td>A piece of storage in the cluster</td></tr>
  <tr><td><strong>PersistentVolumeClaim (PVC)</strong></td><td>Developer/User</td><td>A request for storage</td></tr>
  <tr><td><strong>StorageClass</strong></td><td>Admin</td><td>Defines how to dynamically provision PVs</td></tr>
</table>

<h3>PV Lifecycle</h3>
<ol>
  <li><strong>Provisioning:</strong> Static (admin creates PV) or Dynamic (StorageClass auto-creates)</li>
  <li><strong>Binding:</strong> PVC binds to a matching PV (capacity, access mode, storage class)</li>
  <li><strong>Using:</strong> Pod mounts the PVC as a volume</li>
  <li><strong>Reclaiming:</strong> When PVC is deleted — Retain, Delete, or Recycle the PV</li>
</ol>

<h3>Access Modes</h3>
<table>
  <tr><th>Mode</th><th>Abbreviation</th><th>Description</th></tr>
  <tr><td>ReadWriteOnce</td><td>RWO</td><td>Read-write by a single node</td></tr>
  <tr><td>ReadOnlyMany</td><td>ROX</td><td>Read-only by many nodes</td></tr>
  <tr><td>ReadWriteMany</td><td>RWX</td><td>Read-write by many nodes</td></tr>
  <tr><td>ReadWriteOncePod</td><td>RWOP</td><td>Read-write by a single Pod</td></tr>
</table>

<h3>Reclaim Policies</h3>
<ul>
  <li><strong>Retain:</strong> PV is kept after PVC deletion (manual cleanup)</li>
  <li><strong>Delete:</strong> PV and underlying storage are deleted</li>
  <li><strong>Recycle:</strong> Basic scrub (rm -rf) — deprecated</li>
</ul>

<h3>Volume Types</h3>
<ul>
  <li><strong>emptyDir:</strong> Temporary, deleted when Pod is removed</li>
  <li><strong>hostPath:</strong> Mounts a path from the host node</li>
  <li><strong>configMap / secret:</strong> Mount config data as files</li>
  <li><strong>CSI:</strong> Container Storage Interface — the standard for storage plugins</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> PVs are cluster-scoped (not namespaced). PVCs are namespaced. Dynamic provisioning via StorageClasses is the recommended approach. Know the access modes and reclaim policies.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a PersistentVolume
kubectl create pv my-pv --capacity=10Gi --access-mode=ReadWriteOnce

# Create a PersistentVolumeClaim
kubectl create pvc my-claim --request=5Gi

# See PVs and PVCs
kubectl get pv
kubectl get pvc

# Describe a PV
kubectl describe pv my-pv</code></pre>
`,
    example: 'kubectl create pv my-pv --capacity=10Gi',
    expectedCommands: ['kubectl create pv', 'kubectl create pvc', 'kubectl get pv'],
    hint: 'PVs are storage resources. PVCs are requests for that storage.',
    challenges: [
      { id: 'pv-1', task: 'Create a PersistentVolume called "data-pv" with 10Gi capacity', hint: 'kubectl create pv data-pv --capacity=10Gi', answer: 'kubectl create pv data-pv --capacity=10Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolume' && r.name === 'data-pv') },
      { id: 'pv-2', task: 'Create a PersistentVolumeClaim called "data-claim" requesting 5Gi', hint: 'kubectl create pvc data-claim --request=5Gi', answer: 'kubectl create pvc data-claim --request=5Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolumeclaim' && r.name === 'data-claim') },
      { id: 'pv-3', task: 'Create a PV called "fast-pv" with ReadWriteMany access mode', hint: 'kubectl create pv fast-pv --capacity=5Gi --access-mode=ReadWriteMany', answer: 'kubectl create pv fast-pv --capacity=5Gi --access-mode=ReadWriteMany', validate: (c) => c.resources.some(r => r.type === 'persistentvolume' && r.name === 'fast-pv') },
      { id: 'pv-4', task: 'Create another PV called "logs-pv" with 20Gi capacity', hint: 'kubectl create pv logs-pv --capacity=20Gi', answer: 'kubectl create pv logs-pv --capacity=20Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolume' && r.name === 'logs-pv') },
      { id: 'pv-5', task: 'Create a PVC called "logs-claim" requesting 10Gi', hint: 'kubectl create pvc logs-claim --request=10Gi', answer: 'kubectl create pvc logs-claim --request=10Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolumeclaim' && r.name === 'logs-claim') },
      { id: 'pv-6', task: 'Create a PVC called "app-storage" requesting 2Gi', hint: 'kubectl create pvc app-storage --request=2Gi', answer: 'kubectl create pvc app-storage --request=2Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolumeclaim' && r.name === 'app-storage') },
    ],
  },
  // ── RBAC ──
  {
    id: 'rbac',
    title: 'RBAC & Service Accounts',
    category: 'Container Orchestration',
    course: 'kcna',
    content: `
<h2>RBAC (Role-Based Access Control)</h2>
<p>RBAC controls <strong>who</strong> can do <strong>what</strong> on <strong>which resources</strong> in your cluster.</p>

<h3>The Four RBAC Objects</h3>
<table>
  <tr><th>Object</th><th>Scope</th><th>Purpose</th></tr>
  <tr><td><strong>Role</strong></td><td>Namespace</td><td>Defines permissions within a namespace</td></tr>
  <tr><td><strong>ClusterRole</strong></td><td>Cluster-wide</td><td>Defines permissions across all namespaces</td></tr>
  <tr><td><strong>RoleBinding</strong></td><td>Namespace</td><td>Binds a Role/ClusterRole to users in a namespace</td></tr>
  <tr><td><strong>ClusterRoleBinding</strong></td><td>Cluster-wide</td><td>Binds a ClusterRole to users cluster-wide</td></tr>
</table>

<h3>Service Accounts</h3>
<p>A <strong>ServiceAccount</strong> provides an identity for processes running in Pods. Every namespace has a <code>default</code> ServiceAccount.</p>
<ul>
  <li>Pods use ServiceAccounts to authenticate to the API server</li>
  <li>ServiceAccounts are namespaced</li>
  <li>Tokens are automatically mounted into Pods</li>
  <li>Follow <strong>least privilege</strong> — don't use the default SA for everything</li>
</ul>

<h3>RBAC Verbs</h3>
<p>Common verbs: <code>get</code>, <code>list</code>, <code>watch</code>, <code>create</code>, <code>update</code>, <code>patch</code>, <code>delete</code></p>

<h3>Example: Read-only access to Pods</h3>
<pre><code>apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> RBAC permissions are purely additive — there are no "deny" rules. A RoleBinding can reference a ClusterRole but scope it to a single namespace. ServiceAccounts are the identity mechanism for Pods.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a ServiceAccount
kubectl create sa app-sa

# Create a Role
kubectl create role pod-reader --verb=get,list,watch --resource=pods

# Create a RoleBinding
kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=default:app-sa

# Create a ClusterRole
kubectl create clusterrole node-viewer --verb=get,list --resource=nodes

# Check permissions
kubectl auth can-i get pods
kubectl auth can-i delete nodes</code></pre>
`,
    example: 'kubectl create sa app-sa',
    expectedCommands: ['kubectl create sa', 'kubectl create role', 'kubectl create rolebinding', 'kubectl auth can-i'],
    hint: 'Create ServiceAccounts, Roles, and RoleBindings to control access.',
    challenges: [
      { id: 'rbac-1', task: 'Create a ServiceAccount called "app-sa"', hint: 'kubectl create sa app-sa', answer: 'kubectl create sa app-sa', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'app-sa') },
      { id: 'rbac-2', task: 'Create a Role called "pod-reader" with get,list,watch on pods', hint: 'kubectl create role pod-reader --verb=get,list,watch --resource=pods', answer: 'kubectl create role pod-reader --verb=get,list,watch --resource=pods', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'pod-reader') },
      { id: 'rbac-3', task: 'Create a RoleBinding called "read-pods" binding the pod-reader role', hint: 'kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=default:app-sa', answer: 'kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=default:app-sa', validate: (c) => c.resources.some(r => r.type === 'rolebinding' && r.name === 'read-pods') },
      { id: 'rbac-4', task: 'Create a ClusterRole called "node-viewer" for viewing nodes', hint: 'kubectl create clusterrole node-viewer --verb=get,list --resource=nodes', answer: 'kubectl create clusterrole node-viewer --verb=get,list --resource=nodes', validate: (c) => c.resources.some(r => r.type === 'clusterrole' && r.name === 'node-viewer') },
      { id: 'rbac-5', task: 'Create a ClusterRoleBinding called "view-nodes" binding node-viewer', hint: 'kubectl create clusterrolebinding view-nodes --clusterrole=node-viewer --serviceaccount=default:app-sa', answer: 'kubectl create clusterrolebinding view-nodes --clusterrole=node-viewer --serviceaccount=default:app-sa', validate: (c) => c.resources.some(r => r.type === 'clusterrolebinding' && r.name === 'view-nodes') },
      { id: 'rbac-6', task: 'Create a ServiceAccount called "deploy-bot"', hint: 'kubectl create sa deploy-bot', answer: 'kubectl create sa deploy-bot', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'deploy-bot') },
    ],
  },
  // ── POD SECURITY & PROBES ──
  {
    id: 'pod-security-probes',
    title: 'Pod Security & Probes',
    category: 'Container Orchestration',
    course: 'kcna',
    content: `
<h2>🛡️ Pod Security & Health Probes</h2>
<p>Kubernetes provides mechanisms to secure Pods and monitor their health through <strong>Security Contexts</strong>, <strong>Pod Security Standards</strong>, and <strong>health probes</strong>.</p>

<h3>Health Probes</h3>
<p>Probes let the kubelet check if a container is healthy and ready to serve traffic.</p>

<table>
  <tr><th>Probe</th><th>Purpose</th><th>Failure Action</th></tr>
  <tr><td><strong>Liveness</strong></td><td>Is the container alive?</td><td>Restart the container</td></tr>
  <tr><td><strong>Readiness</strong></td><td>Is the container ready for traffic?</td><td>Remove from Service endpoints</td></tr>
  <tr><td><strong>Startup</strong></td><td>Has the container started?</td><td>Kill and restart (slow-starting apps)</td></tr>
</table>

<h3>Probe Types</h3>
<ul>
  <li><strong>httpGet</strong> — HTTP GET request to a path/port (success = 200-399)</li>
  <li><strong>tcpSocket</strong> — TCP connection to a port (success = connection established)</li>
  <li><strong>exec</strong> — Run a command inside the container (success = exit code 0)</li>
  <li><strong>grpc</strong> — gRPC health check (Kubernetes 1.27+)</li>
</ul>

<pre><code># Liveness probe example
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
  failureThreshold: 3

# Readiness probe example
readinessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 5
  periodSeconds: 10

# Startup probe example
startupProbe:
  exec:
    command: ["/bin/sh", "-c", "cat /tmp/ready"]
  failureThreshold: 30
  periodSeconds: 10</code></pre>

<h3>Security Context</h3>
<p>A <strong>SecurityContext</strong> defines privilege and access control settings for a Pod or container.</p>

<pre><code>securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]</code></pre>

<h3>Pod Security Standards (PSS)</h3>
<p>Kubernetes defines three security profiles enforced at the namespace level:</p>
<ul>
  <li><strong>Privileged</strong> — Unrestricted (no restrictions)</li>
  <li><strong>Baseline</strong> — Minimally restrictive (prevents known privilege escalations)</li>
  <li><strong>Restricted</strong> — Heavily restricted (current hardening best practices)</li>
</ul>

<pre><code># Enforce restricted security on a namespace
kubectl label namespace production \\
  pod-security.kubernetes.io/enforce=restricted \\
  pod-security.kubernetes.io/warn=restricted \\
  pod-security.kubernetes.io/audit=restricted</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Pod Security Admission (PSA) replaced PodSecurityPolicy (PSP) in K8s 1.25. Know the three levels: Privileged, Baseline, Restricted. Liveness probes restart containers; readiness probes control Service traffic. Always use <code>runAsNonRoot: true</code> and drop all capabilities in production.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Create a pod with security context
kubectl run web-secure --image=nginx --run-as-non-root
kubectl run hardened --image=nginx --drop-capabilities=ALL

# Create pods with health probes
kubectl run health-app --image=nginx --liveness-probe=httpGet:8080
kubectl run ready-app --image=nginx --readiness-probe=tcpSocket:3000
kubectl run slow-app --image=nginx --startup-probe=httpGet:8080

# Inspect pod details
kubectl describe pod web-secure
kubectl get pods</code></pre>
`,
    example: 'kubectl run probe-test --image=nginx --liveness-probe=httpGet:8080',
    expectedCommands: ['kubectl run', 'kubectl get pods', 'kubectl describe pod'],
    hint: 'Use --liveness-probe, --readiness-probe, --startup-probe, --run-as-non-root, and --drop-capabilities flags.',
    challenges: [
      { id: 'sec-1', task: 'Create a pod "web-secure" with runAsNonRoot security context', hint: 'kubectl run web-secure --image=nginx --run-as-non-root', answer: 'kubectl run web-secure --image=nginx --run-as-non-root', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'web-secure' && r.metadata.runAsNonRoot === true) },
      { id: 'sec-2', task: 'Create a pod "hardened-app" that drops ALL capabilities', hint: 'kubectl run hardened-app --image=nginx --drop-capabilities=ALL', answer: 'kubectl run hardened-app --image=nginx --drop-capabilities=ALL', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'hardened-app' && r.metadata.dropCapabilities === 'ALL') },
      { id: 'sec-3', task: 'Create a pod "readonly-pod" with a read-only root filesystem', hint: 'kubectl run readonly-pod --image=nginx --read-only-root', answer: 'kubectl run readonly-pod --image=nginx --read-only-root', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'readonly-pod' && r.metadata.readOnlyRootFilesystem === true) },
      { id: 'sec-4', task: 'Create a pod "health-check" with an HTTP liveness probe on port 8080', hint: 'kubectl run health-check --image=nginx --liveness-probe=httpGet:8080', answer: 'kubectl run health-check --image=nginx --liveness-probe=httpGet:8080', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'health-check' && typeof r.metadata.livenessProbe === 'string') },
      { id: 'sec-5', task: 'Create a pod "ready-app" with a TCP readiness probe on port 3000', hint: 'kubectl run ready-app --image=nginx --readiness-probe=tcpSocket:3000', answer: 'kubectl run ready-app --image=nginx --readiness-probe=tcpSocket:3000', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'ready-app' && typeof r.metadata.readinessProbe === 'string') },
      { id: 'sec-6', task: 'Create a pod "slow-start" with a startup probe', hint: 'kubectl run slow-start --image=nginx --startup-probe=httpGet:8080', answer: 'kubectl run slow-start --image=nginx --startup-probe=httpGet:8080', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'slow-start' && typeof r.metadata.startupProbe === 'string') },
    ],
  },
  // ── HELM ──
  {
    id: 'helm',
    title: 'Helm: The Package Manager',
    category: 'Cloud Native App Delivery',
    course: 'kcna',
    content: `
<h2>🚢 Helm: The Kubernetes Package Manager</h2>
<p>Helm is the most popular <strong>package manager for Kubernetes</strong>. It simplifies deploying complex applications by packaging Kubernetes manifests into reusable <strong>charts</strong>.</p>

<h3>Core Concepts</h3>
<table>
  <tr><th>Concept</th><th>Description</th></tr>
  <tr><td><strong>Chart</strong></td><td>A package of pre-configured Kubernetes resources (like an apt/yum package)</td></tr>
  <tr><td><strong>Release</strong></td><td>A running instance of a chart in a cluster</td></tr>
  <tr><td><strong>Repository</strong></td><td>A place to store and share charts (like Docker Hub for images)</td></tr>
  <tr><td><strong>Values</strong></td><td>Configuration that customizes a chart (values.yaml)</td></tr>
  <tr><td><strong>Template</strong></td><td>Go-templated Kubernetes manifests inside a chart</td></tr>
</table>

<h3>Chart Structure</h3>
<pre><code>mychart/
├── Chart.yaml          # Chart metadata (name, version, description)
├── values.yaml         # Default configuration values
├── charts/             # Dependency charts
├── templates/          # Go-templated K8s manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── _helpers.tpl    # Template helpers
│   └── NOTES.txt       # Post-install notes
└── .helmignore         # Files to ignore when packaging</code></pre>

<h3>Common Helm Commands</h3>
<pre><code># Add a chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search for charts
helm search repo nginx
helm search hub wordpress    # Search Artifact Hub

# Install a chart (creates a release)
helm install my-release bitnami/nginx
helm install my-release bitnami/nginx -f custom-values.yaml
helm install my-release bitnami/nginx --set replicaCount=3

# List releases
helm list
helm list --all-namespaces

# Upgrade a release
helm upgrade my-release bitnami/nginx --set replicaCount=5

# Rollback a release
helm rollback my-release 1    # Roll back to revision 1

# Uninstall a release
helm uninstall my-release

# Show chart info
helm show values bitnami/nginx
helm show chart bitnami/nginx

# Template rendering (dry-run)
helm template my-release bitnami/nginx</code></pre>

<h3>Helm 3 vs Helm 2</h3>
<ul>
  <li>Helm 3 <strong>removed Tiller</strong> (the server-side component) — more secure</li>
  <li>Helm 3 uses <strong>3-way strategic merge</strong> for upgrades</li>
  <li>Release info stored as <strong>Secrets</strong> in the release namespace</li>
  <li>Charts use <strong>apiVersion: v2</strong> in Chart.yaml</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Helm is a CNCF <em>graduated</em> project. Know the difference between Helm 2 (with Tiller) and Helm 3 (no Tiller). A chart is a package, a release is an instance. Helm uses Go templates. <code>helm install</code>, <code>helm upgrade</code>, and <code>helm rollback</code> are the key lifecycle commands.
</div>
`,
    example: 'kubectl create deployment chart-app --image=nginx',
    expectedCommands: ['kubectl create deployment', 'kubectl expose', 'kubectl create configmap'],
    hint: 'Simulate what a Helm chart would deploy: a deployment, service, configmap, and secret.',
    challenges: [
      { id: 'helm-1', task: 'Create a deployment "chart-app" (simulating a Helm release)', hint: 'kubectl create deployment chart-app --image=nginx --replicas=3', answer: 'kubectl create deployment chart-app --image=nginx --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'chart-app') },
      { id: 'helm-2', task: 'Expose "chart-app" as a service on port 80', hint: 'kubectl expose deployment chart-app --port=80', answer: 'kubectl expose deployment chart-app --port=80', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'chart-app') },
      { id: 'helm-3', task: 'Create a configmap "chart-config" for the release values', hint: 'kubectl create configmap chart-config', answer: 'kubectl create configmap chart-config', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'chart-config') },
      { id: 'helm-4', task: 'Create a secret "chart-secret" for sensitive values', hint: 'kubectl create secret chart-secret', answer: 'kubectl create secret chart-secret', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'chart-secret') },
      { id: 'helm-5', task: 'Create a service account "chart-sa" for the release', hint: 'kubectl create sa chart-sa', answer: 'kubectl create sa chart-sa', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'chart-sa') },
    ],
  },
  // ── GITOPS & CI/CD ──
  {
    id: 'gitops-cicd',
    title: 'GitOps & CI/CD',
    category: 'Cloud Native App Delivery',
    course: 'kcna',
    content: `
<h2>🚢 GitOps & CI/CD for Kubernetes</h2>
<p><strong>GitOps</strong> is a set of practices where Git is the single source of truth for declarative infrastructure and applications. Changes are made via pull requests, and an operator automatically syncs the cluster to match the Git state.</p>

<h3>GitOps Principles</h3>
<ul>
  <li><strong>Declarative</strong> — The entire system is described declaratively (YAML manifests)</li>
  <li><strong>Versioned & Immutable</strong> — The desired state is stored in Git</li>
  <li><strong>Pulled Automatically</strong> — Agents pull the desired state and apply it</li>
  <li><strong>Continuously Reconciled</strong> — Agents ensure actual state matches desired state</li>
</ul>

<h3>GitOps Workflow</h3>
<pre><code>Developer → Git Push → Git Repo
                          ↓
                    GitOps Operator (ArgoCD/Flux)
                          ↓
                    Kubernetes Cluster
                          ↓
                    Reconciliation Loop
                    (actual == desired?)</code></pre>

<h3>ArgoCD</h3>
<p>ArgoCD is a CNCF <em>graduated</em> project and the most popular GitOps tool for Kubernetes.</p>
<ul>
  <li><strong>Application CRD</strong> — Defines a Git repo + path + target cluster</li>
  <li><strong>Sync</strong> — Applies manifests from Git to the cluster</li>
  <li><strong>Health checks</strong> — Monitors resource health status</li>
  <li><strong>Rollback</strong> — Revert to any previous Git commit</li>
  <li><strong>Web UI</strong> — Visual dashboard showing app topology and sync status</li>
  <li><strong>SSO integration</strong> — OIDC, LDAP, SAML for access control</li>
</ul>

<pre><code># ArgoCD Application example
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/my-app.git
    targetRevision: main
    path: k8s/
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true</code></pre>

<h3>Flux</h3>
<p>Flux is another CNCF <em>graduated</em> GitOps tool. It's more modular than ArgoCD.</p>
<ul>
  <li><strong>GitRepository</strong> — Points to a Git repo</li>
  <li><strong>Kustomization</strong> — Defines what to apply from the repo</li>
  <li><strong>HelmRelease</strong> — Manages Helm charts declaratively</li>
  <li><strong>Image Automation</strong> — Auto-updates image tags in Git</li>
</ul>

<h3>CI/CD Pipeline for Kubernetes</h3>
<p>A typical cloud native CI/CD pipeline:</p>
<ol>
  <li><strong>Code</strong> → Developer pushes to Git</li>
  <li><strong>Build</strong> → CI builds container image (GitHub Actions, Jenkins, GitLab CI)</li>
  <li><strong>Test</strong> → Run unit tests, integration tests, security scans</li>
  <li><strong>Push</strong> → Push image to container registry (ECR, Docker Hub, GCR)</li>
  <li><strong>Update</strong> → Update image tag in Git manifests</li>
  <li><strong>Deploy</strong> → GitOps operator syncs to cluster</li>
</ol>

<h3>Push vs Pull Deployment</h3>
<table>
  <tr><th>Model</th><th>How</th><th>Example</th></tr>
  <tr><td><strong>Push</strong></td><td>CI pipeline applies to cluster directly</td><td>kubectl apply in Jenkins</td></tr>
  <tr><td><strong>Pull (GitOps)</strong></td><td>Agent in cluster pulls from Git</td><td>ArgoCD, Flux</td></tr>
</table>
<p>GitOps (pull) is preferred because it's more secure (no cluster credentials in CI), auditable, and self-healing.</p>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> ArgoCD and Flux are both CNCF graduated projects. GitOps uses Git as the single source of truth with a pull-based reconciliation model. Know the four GitOps principles: declarative, versioned, pulled automatically, continuously reconciled. Push-based deployment (CI applies directly) is less secure than pull-based (GitOps operator in cluster).
</div>
`,
    example: 'kubectl create namespace argocd',
    expectedCommands: ['kubectl create namespace', 'kubectl create deployment', 'kubectl get pods'],
    hint: 'Simulate a GitOps setup: create namespaces, deploy apps, and set up service accounts.',
    challenges: [
      { id: 'git-1', task: 'Create a namespace "argocd" for the GitOps controller', hint: 'kubectl create namespace argocd', answer: 'kubectl create namespace argocd', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'argocd') },
      { id: 'git-2', task: 'Create a deployment "argocd-server" in the argocd namespace', hint: 'kubectl create deployment argocd-server --image=argoproj/argocd -n argocd', answer: 'kubectl create deployment argocd-server --image=argoproj/argocd -n argocd', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'argocd-server' && r.namespace === 'argocd') },
      { id: 'git-3', task: 'Create a namespace "staging" for a GitOps-managed environment', hint: 'kubectl create namespace staging', answer: 'kubectl create namespace staging', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'staging') },
      { id: 'git-4', task: 'Deploy "web-app" in the staging namespace', hint: 'kubectl create deployment web-app --image=nginx -n staging', answer: 'kubectl create deployment web-app --image=nginx -n staging', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web-app' && r.namespace === 'staging') },
      { id: 'git-5', task: 'Create a service account "gitops-sa" in the argocd namespace', hint: 'kubectl create sa gitops-sa -n argocd', answer: 'kubectl create sa gitops-sa -n argocd', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'gitops-sa' && r.namespace === 'argocd') },
    ],
  },
  // ── OBSERVABILITY ──
  {
    id: 'observability',
    title: 'Observability: Metrics, Logs & Traces',
    category: 'Cloud Native Architecture',
    course: 'kcna',
    content: `
<h2>📊 Observability: Metrics, Logs & Traces</h2>
<p>Observability is the ability to understand the internal state of a system from its external outputs. In cloud native systems, this is built on <strong>three pillars</strong>: metrics, logs, and traces.</p>

<h3>The Three Pillars</h3>
<table>
  <tr><th>Pillar</th><th>What</th><th>Tools</th></tr>
  <tr><td><strong>Metrics</strong></td><td>Numeric measurements over time (CPU, memory, request rate)</td><td>Prometheus, Datadog, CloudWatch</td></tr>
  <tr><td><strong>Logs</strong></td><td>Timestamped text records of events</td><td>Fluentd, Fluent Bit, Loki, ELK Stack</td></tr>
  <tr><td><strong>Traces</strong></td><td>End-to-end request paths across services</td><td>Jaeger, Zipkin, Tempo</td></tr>
</table>

<h3>Prometheus</h3>
<p>Prometheus is the de facto standard for Kubernetes metrics. It's a CNCF <em>graduated</em> project.</p>
<ul>
  <li><strong>Pull-based model</strong> — Prometheus scrapes /metrics endpoints from targets</li>
  <li><strong>PromQL</strong> — Powerful query language for metrics</li>
  <li><strong>Time-series database</strong> — Stores metrics with labels</li>
  <li><strong>AlertManager</strong> — Handles alerts based on PromQL rules</li>
  <li><strong>ServiceMonitor</strong> — CRD to configure scrape targets in Kubernetes</li>
</ul>

<pre><code># Example PromQL queries
rate(http_requests_total[5m])              # Request rate over 5 min
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
sum by (pod) (container_memory_usage_bytes) # Memory by pod</code></pre>

<h3>Grafana</h3>
<p>Grafana is the standard visualization layer. It connects to Prometheus (and many other data sources) to create dashboards.</p>
<ul>
  <li>Pre-built dashboards for Kubernetes (node-exporter, kube-state-metrics)</li>
  <li>Alerting rules with notification channels</li>
  <li>CNCF project (not graduated, but widely adopted)</li>
</ul>

<h3>Logging Architecture</h3>
<p>Kubernetes doesn't provide a built-in logging solution. Common patterns:</p>
<ul>
  <li><strong>Node-level logging</strong> — DaemonSet runs a log agent (Fluentd/Fluent Bit) on each node</li>
  <li><strong>Sidecar pattern</strong> — A sidecar container streams logs from the app container</li>
  <li><strong>Direct push</strong> — App sends logs directly to a logging backend</li>
</ul>

<pre><code># View pod logs
kubectl logs my-pod
kubectl logs my-pod -c sidecar    # Specific container
kubectl logs my-pod --previous    # Previous crashed container
kubectl logs -f my-pod            # Follow/stream logs
kubectl logs -l app=nginx         # Logs by label selector</code></pre>

<h3>OpenTelemetry (OTel)</h3>
<p>OpenTelemetry is a CNCF project that provides a <strong>unified standard</strong> for collecting metrics, logs, and traces. It's vendor-neutral and merges OpenTracing + OpenCensus.</p>
<ul>
  <li><strong>OTel Collector</strong> — Receives, processes, and exports telemetry data</li>
  <li><strong>SDKs</strong> — Instrument your code in any language</li>
  <li><strong>OTLP</strong> — OpenTelemetry Protocol for data transport</li>
  <li>Supports auto-instrumentation for many frameworks</li>
</ul>

<h3>Kubernetes Built-in Monitoring</h3>
<pre><code># Resource usage (requires metrics-server)
kubectl top nodes
kubectl top pods
kubectl top pods --containers

# Events (useful for debugging)
kubectl get events
kubectl get events --sort-by='.lastTimestamp'</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Prometheus and OpenTelemetry are both CNCF projects. Prometheus uses a pull model. The three pillars of observability are metrics, logs, and traces. Fluentd is a CNCF graduated project for log collection. Know that <code>kubectl logs</code> and <code>kubectl top</code> are the built-in observability commands.
</div>
`,
    example: 'kubectl top pods',
    expectedCommands: ['kubectl top pods', 'kubectl top nodes', 'kubectl logs'],
    hint: 'Use kubectl top, kubectl logs, and create pods to monitor.',
    challenges: [
      { id: 'obs-1', task: 'Run "kubectl top nodes" to view node resource usage', hint: 'kubectl top nodes', answer: 'kubectl top nodes', validate: (c) => c.resources.some(r => r.type === 'node') },
      { id: 'obs-2', task: 'Create a pod called "metrics-app" to monitor', hint: 'kubectl run metrics-app --image=prom/prometheus', answer: 'kubectl run metrics-app --image=prom/prometheus', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'metrics-app') },
      { id: 'obs-3', task: 'Create a pod called "log-generator" for log inspection', hint: 'kubectl run log-generator --image=busybox', answer: 'kubectl run log-generator --image=busybox', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'log-generator') },
      { id: 'obs-4', task: 'Create a pod called "trace-collector" running a Jaeger image', hint: 'kubectl run trace-collector --image=jaegertracing/all-in-one', answer: 'kubectl run trace-collector --image=jaegertracing/all-in-one', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'trace-collector') },
      { id: 'obs-5', task: 'Create a deployment called "monitored-app" with 3 replicas', hint: 'kubectl create deployment monitored-app --image=nginx --replicas=3', answer: 'kubectl create deployment monitored-app --image=nginx --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'monitored-app') },
      { id: 'obs-6', task: 'Expose "monitored-app" as a service on port 9090', hint: 'kubectl expose deployment monitored-app --port=9090', answer: 'kubectl expose deployment monitored-app --port=9090', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'monitored-app' && r.metadata.port === '9090') },
    ],
  },
  // ── CLOUD NATIVE CONCEPTS ──
  {
    id: 'cloud-native',
    title: 'Cloud Native Concepts',
    category: 'Cloud Native Architecture',
    course: 'kcna',
    content: `
<h2>Cloud Native Concepts</h2>
<p>The <strong>Cloud Native Computing Foundation (CNCF)</strong> defines cloud native technologies as those that empower organizations to build and run scalable applications in modern, dynamic environments.</p>

<h3>The Five Pillars of Cloud Native</h3>
<ul>
  <li><strong>Containers</strong> — Lightweight, portable runtime environments</li>
  <li><strong>Microservices</strong> — Small, independent services that work together</li>
  <li><strong>DevOps</strong> — Culture and practices for rapid, reliable delivery</li>
  <li><strong>CI/CD</strong> — Continuous Integration and Continuous Delivery pipelines</li>
  <li><strong>Declarative APIs</strong> — Describe desired state, let the system figure out how</li>
</ul>

<h3>CNCF Project Maturity Levels</h3>
<table>
  <tr><th>Level</th><th>Description</th><th>Examples</th></tr>
  <tr><td><strong>Sandbox</strong></td><td>Early stage, experimental</td><td>Various emerging projects</td></tr>
  <tr><td><strong>Incubating</strong></td><td>Growing adoption, production use</td><td>Argo, gRPC, Cilium</td></tr>
  <tr><td><strong>Graduated</strong></td><td>Mature, widely adopted</td><td>Kubernetes, Prometheus, Envoy, Helm</td></tr>
</table>

<h3>The 12-Factor App</h3>
<p>A methodology for building cloud native applications:</p>
<ul>
  <li>One codebase, many deploys</li>
  <li>Explicitly declare dependencies</li>
  <li>Store config in the environment</li>
  <li>Treat backing services as attached resources</li>
  <li>Strictly separate build, release, run stages</li>
  <li>Execute as stateless processes</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> The KCNA exam covers CNCF ecosystem heavily. Know the maturity levels, the 12-factor app principles, and which projects belong to each level.
</div>
`,
  },
  // ── CONTAINER ORCHESTRATION ──
  {
    id: 'container-orchestration',
    title: 'Container Orchestration',
    category: 'Cloud Native Architecture',
    course: 'kcna',
    content: `
<h2>Container Orchestration</h2>
<p><strong>Container orchestration</strong> automates the deployment, management, scaling, and networking of containers across a cluster of machines.</p>

<h3>Why Orchestration?</h3>
<p>Running a single container is easy. Running hundreds across multiple servers while handling failures, updates, scaling, and networking? That's where orchestration comes in.</p>

<h3>What Orchestrators Handle</h3>
<ul>
  <li><strong>Scheduling</strong> — Deciding which node runs which container</li>
  <li><strong>Scaling</strong> — Adding/removing container instances based on demand</li>
  <li><strong>Networking</strong> — Enabling containers to communicate across nodes</li>
  <li><strong>Load balancing</strong> — Distributing traffic across container instances</li>
  <li><strong>Health monitoring</strong> — Detecting and replacing failed containers</li>
  <li><strong>Rolling updates</strong> — Updating applications with zero downtime</li>
  <li><strong>Secret management</strong> — Securely distributing sensitive configuration</li>
</ul>

<h3>Orchestration Platforms</h3>
<table>
  <tr><th>Platform</th><th>Notes</th></tr>
  <tr><td><strong>Kubernetes</strong></td><td>Industry standard, most widely adopted, CNCF graduated</td></tr>
  <tr><td>Docker Swarm</td><td>Simpler but less feature-rich, built into Docker</td></tr>
  <tr><td>Apache Mesos</td><td>General-purpose cluster manager</td></tr>
  <tr><td>Nomad (HashiCorp)</td><td>Flexible, supports non-container workloads</td></tr>
  <tr><td>Amazon ECS</td><td>AWS-native container orchestration</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Kubernetes has become the de facto standard for container orchestration. Understanding <em>why</em> orchestration is needed is just as important as knowing how K8s works.
</div>
`,
  },
  // ── SERVICE MESH ──
  {
    id: 'service-mesh',
    title: 'Service Mesh',
    category: 'Cloud Native Architecture',
    course: 'kcna',
    content: `
<h2>🕸️ Service Mesh</h2>
<p>A <strong>service mesh</strong> is a dedicated infrastructure layer for managing service-to-service communication. It handles traffic management, security, and observability without changing application code.</p>

<h3>Why Service Mesh?</h3>
<p>As microservices grow, managing communication becomes complex. A service mesh provides:</p>
<ul>
  <li><strong>Mutual TLS (mTLS)</strong> — Automatic encryption between all services</li>
  <li><strong>Traffic management</strong> — Canary deployments, A/B testing, traffic splitting</li>
  <li><strong>Observability</strong> — Distributed tracing, metrics, access logs for free</li>
  <li><strong>Resilience</strong> — Retries, timeouts, circuit breaking</li>
  <li><strong>Access control</strong> — Fine-grained authorization policies</li>
</ul>

<h3>The Sidecar Pattern</h3>
<p>Most service meshes use the <strong>sidecar proxy pattern</strong>. A proxy container (usually Envoy) is injected alongside every application container in a Pod.</p>

<pre><code>┌─────────────────────────────┐
│           Pod               │
│  ┌─────────┐  ┌──────────┐ │
│  │  App    │──│  Envoy   │ │
│  │Container│  │  Sidecar │ │
│  └─────────┘  └──────────┘ │
└─────────────────────────────┘
        │              │
        └──── mTLS ────┘──→ Other Pods</code></pre>

<h3>Istio</h3>
<p>Istio is the most popular service mesh for Kubernetes.</p>
<ul>
  <li><strong>Data plane</strong> — Envoy sidecar proxies handle all network traffic</li>
  <li><strong>Control plane (istiod)</strong> — Manages configuration, certificates, and service discovery</li>
  <li><strong>VirtualService</strong> — Define traffic routing rules</li>
  <li><strong>DestinationRule</strong> — Configure load balancing, connection pools, outlier detection</li>
  <li><strong>Gateway</strong> — Manage inbound/outbound traffic at the mesh edge</li>
</ul>

<pre><code># Istio traffic splitting example
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: my-app
spec:
  hosts: [my-app]
  http:
  - route:
    - destination:
        host: my-app
        subset: v1
      weight: 90
    - destination:
        host: my-app
        subset: v2
      weight: 10</code></pre>

<h3>Other Service Meshes</h3>
<table>
  <tr><th>Mesh</th><th>Notes</th></tr>
  <tr><td><strong>Linkerd</strong></td><td>CNCF graduated, lightweight, Rust-based proxy</td></tr>
  <tr><td><strong>Consul Connect</strong></td><td>HashiCorp, works beyond K8s</td></tr>
  <tr><td><strong>Cilium Service Mesh</strong></td><td>eBPF-based, no sidecars needed</td></tr>
</table>

<h3>Envoy Proxy</h3>
<p>Envoy is a CNCF <em>graduated</em> project and the most common data plane proxy. It provides:</p>
<ul>
  <li>L4/L7 load balancing</li>
  <li>TLS termination</li>
  <li>HTTP/2 and gRPC support</li>
  <li>Circuit breaking and retries</li>
  <li>Rich observability (stats, tracing, logging)</li>
</ul>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Envoy and Linkerd are CNCF graduated projects. Istio is not a CNCF project (it's under the Istio steering committee). Know the sidecar pattern: a proxy container is injected into each Pod. Service meshes provide mTLS, traffic management, and observability. The data plane (proxies) handles traffic; the control plane manages configuration.
</div>
`,
    example: 'kubectl create namespace istio-system',
    expectedCommands: ['kubectl create namespace', 'kubectl create deployment', 'kubectl expose'],
    hint: 'Simulate a service mesh setup: create the mesh namespace, deploy services, and expose them.',
    challenges: [
      { id: 'mesh-1', task: 'Create a namespace "istio-system" for the mesh control plane', hint: 'kubectl create namespace istio-system', answer: 'kubectl create namespace istio-system', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'istio-system') },
      { id: 'mesh-2', task: 'Create a deployment "istiod" in istio-system (the control plane)', hint: 'kubectl create deployment istiod --image=istio/pilot -n istio-system', answer: 'kubectl create deployment istiod --image=istio/pilot -n istio-system', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'istiod' && r.namespace === 'istio-system') },
      { id: 'mesh-3', task: 'Create a deployment "frontend" to simulate a meshed service', hint: 'kubectl create deployment frontend --image=nginx', answer: 'kubectl create deployment frontend --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend') },
      { id: 'mesh-4', task: 'Create a deployment "backend-api" as a second meshed service', hint: 'kubectl create deployment backend-api --image=node', answer: 'kubectl create deployment backend-api --image=node', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'backend-api') },
      { id: 'mesh-5', task: 'Expose "frontend" as a service on port 80', hint: 'kubectl expose deployment frontend --port=80', answer: 'kubectl expose deployment frontend --port=80', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'frontend') },
      { id: 'mesh-6', task: 'Expose "backend-api" as a service on port 3000', hint: 'kubectl expose deployment backend-api --port=3000', answer: 'kubectl expose deployment backend-api --port=3000', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'backend-api') },
    ],
  },
  // ── INTERVIEW & TROUBLESHOOTING LABS ──
  {
    id: 'lab-deploy-expose',
    title: 'Lab: Deploy & Expose an App',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🧪 Lab: Deploy & Expose a Full Application</h2>
<p>This is a common interview scenario: <em>"Deploy a web application with 3 replicas and make it accessible via a service."</em></p>

<h3>The Scenario</h3>
<p>Your team needs you to:</p>
<ol>
  <li>Deploy an nginx web server with <strong>3 replicas</strong></li>
  <li>Expose it internally via a <strong>ClusterIP</strong> service on port 80</li>
  <li>Also expose it externally via a <strong>NodePort</strong> service</li>
  <li>Verify everything is running correctly</li>
</ol>

<h3>What They're Testing</h3>
<ul>
  <li>Can you create Deployments with specific replica counts?</li>
  <li>Do you understand the difference between ClusterIP and NodePort?</li>
  <li>Can you verify your work with <code>kubectl get</code>?</li>
</ul>

<div class="info-box">
  <strong>💡 Interview Tip:</strong> Always verify your work. After creating resources, run <code>kubectl get all</code> to confirm everything is in the expected state. Interviewers notice when you validate.
</div>

<h3>🧪 Walkthrough</h3>
<pre><code># Create the deployment with 3 replicas
kubectl create deployment web-app --image=nginx --replicas=3

# Verify the deployment and pods
kubectl get deployments
kubectl get pods

# Expose internally (ClusterIP)
kubectl expose deployment web-app --port=80 --name=web-internal

# Expose externally (NodePort)
kubectl expose deployment web-app --port=80 --type=NodePort --name=web-external

# Verify services
kubectl get services</code></pre>
`,
    example: 'kubectl create deployment web-app --image=nginx --replicas=3',
    expectedCommands: ['kubectl create deployment', 'kubectl expose deployment', 'kubectl get'],
    hint: 'Start by creating the deployment, then expose it twice with different service types.',
    challenges: [
      { id: 'lab1-1', task: 'Create a deployment "web-app" with 3 replicas', hint: 'Use --replicas=3 flag', answer: 'kubectl create deployment web-app --image=nginx --replicas=3', validate: (c) => { const d = c.resources.find(r => r.type === 'deployment' && r.name === 'web-app'); return d !== undefined && d.metadata.replicas === 3; } },
      { id: 'lab1-2', task: 'Expose "web-app" as a ClusterIP service called "web-internal" on port 80', hint: 'kubectl expose deployment web-app --port=80 --name=web-internal', answer: 'kubectl expose deployment web-app --port=80 --name=web-internal', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'web-internal' && r.metadata.type === 'ClusterIP') },
      { id: 'lab1-3', task: 'Expose "web-app" as a NodePort service called "web-external" on port 80', hint: 'Add --type=NodePort and --name=web-external', answer: 'kubectl expose deployment web-app --port=80 --type=NodePort --name=web-external', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'web-external' && r.metadata.type === 'NodePort') },
    ],
  },
  {
    id: 'lab-rolling-update',
    title: 'Lab: Rolling Update & Rollback',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🧪 Lab: Rolling Update & Rollback</h2>
<p>Classic interview question: <em>"Update an application to a new version, then roll it back when the new version has issues."</em></p>

<h3>The Scenario</h3>
<p>You have a production deployment running <code>nginx:1.24</code>. You need to:</p>
<ol>
  <li>Create the deployment with the <strong>old image</strong></li>
  <li>Perform a <strong>rolling update</strong> to a new image version</li>
  <li>Check the <strong>rollout status</strong> and <strong>history</strong></li>
  <li>Discover the new version is broken and <strong>roll back</strong></li>
</ol>

<h3>What They're Testing</h3>
<ul>
  <li>Do you understand rolling update strategy?</li>
  <li>Can you update container images without downtime?</li>
  <li>Do you know how to check rollout status and history?</li>
  <li>Can you quickly roll back a bad deployment?</li>
</ul>

<div class="info-box">
  <strong>💡 Interview Tip:</strong> In a real interview, explain what's happening: "The rolling update gradually replaces old pods with new ones, ensuring zero downtime. If I need to roll back, Kubernetes keeps the previous ReplicaSet so it can quickly revert."
</div>

<h3>🧪 Walkthrough</h3>
<pre><code># Create deployment with initial image
kubectl create deployment api --image=nginx

# Scale to 3 replicas for a realistic scenario
kubectl scale deployment/api --replicas=3

# Perform rolling update to new version
kubectl set image deployment/api nginx=nginx:1.25

# Check rollout status
kubectl rollout status deployment/api

# View rollout history
kubectl rollout history deployment/api

# Oh no, the new version is broken! Roll back
kubectl rollout undo deployment/api

# Verify the rollback
kubectl rollout status deployment/api</code></pre>
`,
    example: 'kubectl create deployment api --image=nginx',
    expectedCommands: ['kubectl create deployment', 'kubectl set image', 'kubectl rollout'],
    hint: 'Create a deployment, update its image, then roll it back.',
    challenges: [
      { id: 'lab2-1', task: 'Create a deployment "api" with nginx image', hint: 'kubectl create deployment api --image=nginx', answer: 'kubectl create deployment api --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'api') },
      { id: 'lab2-2', task: 'Scale "api" to 3 replicas', hint: 'kubectl scale deployment/api --replicas=3', answer: 'kubectl scale deployment/api --replicas=3', validate: (c) => { const d = c.resources.find(r => r.type === 'deployment' && r.name === 'api'); return d?.metadata.replicas === 3; } },
      { id: 'lab2-3', task: 'Update "api" image to nginx:1.25 (rolling update)', hint: 'kubectl set image deployment/api nginx=nginx:1.25', answer: 'kubectl set image deployment/api nginx=nginx:1.25', validate: (c) => { const d = c.resources.find(r => r.type === 'deployment' && r.name === 'api'); return d?.metadata.image === 'nginx:1.25'; } },
      { id: 'lab2-4', task: 'Roll back "api" to the previous version', hint: 'kubectl rollout undo deployment/api', answer: 'kubectl rollout undo deployment/api', validate: (c) => { const d = c.resources.find(r => r.type === 'deployment' && r.name === 'api'); return (d?.metadata.revision as number) >= 3; } },
    ],
  },
  {
    id: 'lab-multi-namespace',
    title: 'Lab: Multi-Namespace Setup',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🧪 Lab: Multi-Namespace Environment</h2>
<p>Interview scenario: <em>"Set up a development and production environment using namespaces with isolated resources."</em></p>

<h3>The Scenario</h3>
<p>Your company needs separate environments:</p>
<ol>
  <li>Create <strong>dev</strong> and <strong>prod</strong> namespaces</li>
  <li>Deploy a <strong>frontend</strong> app in both environments</li>
  <li>Deploy a <strong>backend</strong> only in prod</li>
  <li>Create a <strong>ConfigMap</strong> in each namespace for environment-specific config</li>
  <li>Expose the frontend in prod as a LoadBalancer</li>
</ol>

<h3>What They're Testing</h3>
<ul>
  <li>Can you organize resources across namespaces?</li>
  <li>Do you understand namespace isolation?</li>
  <li>Can you manage environment-specific configurations?</li>
</ul>

<div class="info-box">
  <strong>💡 Interview Tip:</strong> Mention that namespaces provide logical isolation but NOT network isolation by default. For network isolation, you need NetworkPolicies. This shows deeper understanding.
</div>

<h3>🧪 Walkthrough</h3>
<pre><code># Create namespaces
kubectl create namespace dev
kubectl create namespace prod

# Deploy frontend to both
kubectl create deployment frontend --image=nginx -n dev
kubectl create deployment frontend --image=nginx -n prod

# Deploy backend only to prod
kubectl create deployment backend --image=nginx -n prod

# Create environment configs
kubectl create configmap env-config -n dev
kubectl create configmap env-config -n prod

# Expose frontend in prod
kubectl expose deployment frontend --port=80 --type=LoadBalancer -n prod

# Verify
kubectl get all -n dev
kubectl get all -n prod</code></pre>
`,
    example: 'kubectl create namespace dev',
    expectedCommands: ['kubectl create namespace', 'kubectl create deployment', 'kubectl expose'],
    hint: 'Create namespaces first, then deploy resources into each one with -n flag.',
    challenges: [
      { id: 'lab3-1', task: 'Create "dev" and "prod" namespaces', hint: 'Two kubectl create namespace commands', answer: 'kubectl create namespace dev\nkubectl create namespace prod', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'dev') && c.resources.some(r => r.type === 'namespace' && r.name === 'prod') },
      { id: 'lab3-2', task: 'Deploy "frontend" in the dev namespace', hint: 'kubectl create deployment frontend --image=nginx -n dev', answer: 'kubectl create deployment frontend --image=nginx -n dev', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend' && r.namespace === 'dev') },
      { id: 'lab3-3', task: 'Deploy "frontend" and "backend" in the prod namespace', hint: 'Two deployment commands with -n prod', answer: 'kubectl create deployment frontend --image=nginx -n prod\nkubectl create deployment backend --image=nginx -n prod', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend' && r.namespace === 'prod') && c.resources.some(r => r.type === 'deployment' && r.name === 'backend' && r.namespace === 'prod') },
      { id: 'lab3-4', task: 'Create a ConfigMap "env-config" in the prod namespace', hint: 'kubectl create configmap env-config -n prod', answer: 'kubectl create configmap env-config -n prod', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'env-config' && r.namespace === 'prod') },
      { id: 'lab3-5', task: 'Expose "frontend" in prod as a LoadBalancer on port 80', hint: 'kubectl expose deployment frontend --port=80 --type=LoadBalancer -n prod', answer: 'kubectl expose deployment frontend --port=80 --type=LoadBalancer -n prod', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'frontend' && r.namespace === 'prod' && r.metadata.type === 'LoadBalancer') },
    ],
  },
  {
    id: 'lab-troubleshoot-app',
    title: 'Lab: Troubleshoot a Broken App',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🧪 Lab: Troubleshoot a Broken Application</h2>
<p>Interview scenario: <em>"An application isn't working. Diagnose and fix it."</em></p>

<h3>Common Troubleshooting Steps</h3>
<p>When something's broken in K8s, follow this systematic approach:</p>
<ol>
  <li><strong>Check the resource exists:</strong> <code>kubectl get &lt;type&gt;</code></li>
  <li><strong>Describe for events:</strong> <code>kubectl describe &lt;type&gt; &lt;name&gt;</code></li>
  <li><strong>Check pod status:</strong> <code>kubectl get pods</code> — look for CrashLoopBackOff, ImagePullBackOff, Pending</li>
  <li><strong>Check services:</strong> <code>kubectl get services</code> — is the service pointing to the right pods?</li>
  <li><strong>Check labels match:</strong> <code>kubectl get pods --show-labels</code></li>
</ol>

<h3>Common Issues & Fixes</h3>
<table>
  <tr><th>Symptom</th><th>Likely Cause</th><th>Fix</th></tr>
  <tr><td>Pod stuck in Pending</td><td>No node has enough resources</td><td>Scale down other pods or add nodes</td></tr>
  <tr><td>ImagePullBackOff</td><td>Wrong image name or no access</td><td>Fix image name, add pull secret</td></tr>
  <tr><td>CrashLoopBackOff</td><td>App crashes on startup</td><td>Check logs, fix app config</td></tr>
  <tr><td>Service not routing</td><td>Label selector mismatch</td><td>Fix labels on pods or service selector</td></tr>
  <tr><td>Can't access externally</td><td>Wrong service type</td><td>Use NodePort or LoadBalancer</td></tr>
</table>

<div class="info-box">
  <strong>💡 Interview Tip:</strong> Walk through your troubleshooting process out loud. Interviewers want to see your methodology, not just the answer. Start broad (kubectl get all) and narrow down.
</div>

<h3>🧪 Practice Scenario</h3>
<p>Build a complete app stack and verify each piece:</p>
<pre><code># Step 1: Create the namespace
kubectl create namespace app

# Step 2: Deploy the database
kubectl create deployment db --image=postgres -n app
kubectl expose deployment db --port=5432 -n app

# Step 3: Deploy the API
kubectl create deployment api --image=nginx -n app --replicas=2
kubectl expose deployment api --port=8080 -n app

# Step 4: Deploy the frontend
kubectl create deployment frontend --image=nginx -n app --replicas=3
kubectl expose deployment frontend --port=80 --type=NodePort -n app

# Step 5: Create config and secrets
kubectl create configmap app-config -n app
kubectl create secret db-creds -n app

# Step 6: Verify everything
kubectl get all -n app
kubectl get configmaps -n app
kubectl get secrets -n app</code></pre>
`,
    example: 'kubectl create namespace app',
    expectedCommands: ['kubectl create namespace', 'kubectl create deployment', 'kubectl expose', 'kubectl get all'],
    hint: 'Build the full stack step by step: namespace, database, API, frontend, config.',
    challenges: [
      { id: 'lab4-1', task: 'Create a namespace called "app"', hint: 'kubectl create namespace app', answer: 'kubectl create namespace app', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'app') },
      { id: 'lab4-2', task: 'Deploy "db" in the "app" namespace and expose it on port 5432', hint: 'Create deployment then expose it, both with -n app', answer: 'kubectl create deployment db --image=postgres -n app\nkubectl expose deployment db --port=5432 -n app', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'db' && r.namespace === 'app') },
      { id: 'lab4-3', task: 'Deploy "api" with 2 replicas in "app" and expose on port 8080', hint: 'Use --replicas=2 and -n app', answer: 'kubectl create deployment api --image=nginx --replicas=2 -n app\nkubectl expose deployment api --port=8080 -n app', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'api' && r.namespace === 'app') },
      { id: 'lab4-4', task: 'Deploy "frontend" with 3 replicas in "app" and expose as NodePort on port 80', hint: 'Use --type=NodePort', answer: 'kubectl create deployment frontend --image=nginx --replicas=3 -n app\nkubectl expose deployment frontend --port=80 --type=NodePort -n app', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'frontend' && r.namespace === 'app' && r.metadata.type === 'NodePort') },
      { id: 'lab4-5', task: 'Create a ConfigMap "app-config" and Secret "db-creds" in the "app" namespace', hint: 'Two commands with -n app', answer: 'kubectl create configmap app-config -n app\nkubectl create secret db-creds -n app', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-config' && r.namespace === 'app') && c.resources.some(r => r.type === 'secret' && r.name === 'db-creds' && r.namespace === 'app') },
    ],
  },
  {
    id: 'lab-scaling-strategy',
    title: 'Lab: Scaling Strategy',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🧪 Lab: Scaling Strategy</h2>
<p>Interview scenario: <em>"Your application is experiencing high traffic. Scale it appropriately and ensure high availability."</em></p>

<h3>The Scenario</h3>
<p>You have a microservices app with:</p>
<ul>
  <li>A <strong>frontend</strong> that needs to handle lots of traffic (scale to 5)</li>
  <li>An <strong>API</strong> layer that needs moderate scaling (scale to 3)</li>
  <li>A <strong>worker</strong> for background jobs (scale to 2)</li>
</ul>
<p>After scaling up, traffic drops and you need to <strong>scale back down</strong> to save resources.</p>

<h3>What They're Testing</h3>
<ul>
  <li>Can you scale deployments up and down?</li>
  <li>Do you understand resource management?</li>
  <li>Can you think about cost optimization?</li>
</ul>

<h3>Horizontal Pod Autoscaler (HPA)</h3>
<p>In production, you'd use HPA to auto-scale based on CPU/memory:</p>
<pre><code>kubectl autoscale deployment frontend --min=2 --max=10 --cpu-percent=80</code></pre>
<p><em>(Not simulated here, but know this for the exam!)</em></p>

<div class="info-box">
  <strong>💡 Interview Tip:</strong> Mention HPA even if the question is about manual scaling. It shows you know the production-ready approach. Also mention that you'd set resource requests/limits on pods for HPA to work.
</div>

<h3>🧪 Walkthrough</h3>
<pre><code># Create the deployments
kubectl create deployment frontend --image=nginx
kubectl create deployment api --image=nginx
kubectl create deployment worker --image=nginx

# Scale up for high traffic
kubectl scale deployment/frontend --replicas=5
kubectl scale deployment/api --replicas=3
kubectl scale deployment/worker --replicas=2

# Verify
kubectl get deployments
kubectl get pods

# Traffic drops — scale back down
kubectl scale deployment/frontend --replicas=2
kubectl scale deployment/api --replicas=1
kubectl scale deployment/worker --replicas=1</code></pre>
`,
    example: 'kubectl create deployment frontend --image=nginx',
    expectedCommands: ['kubectl create deployment', 'kubectl scale deployment'],
    hint: 'Create deployments first, then scale them up, then scale back down.',
    challenges: [
      { id: 'lab5-1', task: 'Create deployments "frontend", "api", and "worker"', hint: 'Three kubectl create deployment commands', answer: 'kubectl create deployment frontend --image=nginx\nkubectl create deployment api --image=nginx\nkubectl create deployment worker --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend') && c.resources.some(r => r.type === 'deployment' && r.name === 'api') && c.resources.some(r => r.type === 'deployment' && r.name === 'worker') },
      { id: 'lab5-2', task: 'Scale frontend to 5, api to 3, worker to 2', hint: 'Three kubectl scale commands', answer: 'kubectl scale deployment/frontend --replicas=5\nkubectl scale deployment/api --replicas=3\nkubectl scale deployment/worker --replicas=2', validate: (c) => { const f = c.resources.find(r => r.type === 'deployment' && r.name === 'frontend'); const a = c.resources.find(r => r.type === 'deployment' && r.name === 'api'); const w = c.resources.find(r => r.type === 'deployment' && r.name === 'worker'); return f?.metadata.replicas === 5 && a?.metadata.replicas === 3 && w?.metadata.replicas === 2; } },
      { id: 'lab5-3', task: 'Scale everything back down: frontend=2, api=1, worker=1', hint: 'Three more scale commands with lower numbers', answer: 'kubectl scale deployment/frontend --replicas=2\nkubectl scale deployment/api --replicas=1\nkubectl scale deployment/worker --replicas=1', validate: (c) => { const f = c.resources.find(r => r.type === 'deployment' && r.name === 'frontend'); const a = c.resources.find(r => r.type === 'deployment' && r.name === 'api'); const w = c.resources.find(r => r.type === 'deployment' && r.name === 'worker'); return f?.metadata.replicas === 2 && a?.metadata.replicas === 1 && w?.metadata.replicas === 1; } },
    ],
  },

// ── INTERVIEW LAB 6: RBAC Security Setup ──
  {
    id: 'lab-rbac-security',
    title: 'Lab: RBAC Security Setup',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: RBAC Security Setup</h2>
<p><strong>Interview Scenario:</strong> "Your team needs to give a new developer read-only access to pods in the production namespace, but they should NOT be able to delete or modify anything. Set up the RBAC resources to make this happen."</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> RBAC is one of the most asked Kubernetes interview topics. Interviewers want to see that you understand ServiceAccounts, Roles, and RoleBindings — and can set them up from scratch.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create a namespace called "production"</li>
  <li>Create a ServiceAccount called "dev-user" for the developer</li>
  <li>Create a Role called "pod-reader" that allows get, list, watch on pods</li>
  <li>Create a RoleBinding called "dev-read-pods" that binds the role to the ServiceAccount</li>
  <li>Verify the setup with kubectl auth can-i</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create namespace production
kubectl create sa dev-user
kubectl create role pod-reader --verb=get,list,watch --resource=pods
kubectl create rolebinding dev-read-pods --role=pod-reader --serviceaccount=default:dev-user
kubectl auth can-i get pods</code></pre>
`,
    example: 'kubectl create sa dev-user',
    expectedCommands: ['kubectl create namespace', 'kubectl create sa', 'kubectl create role', 'kubectl create rolebinding'],
    hint: 'Start by creating the namespace and ServiceAccount, then the Role and RoleBinding.',
    challenges: [
      { id: 'lab6-1', task: 'Create a namespace called "production"', hint: 'kubectl create namespace production', answer: 'kubectl create namespace production', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'production') },
      { id: 'lab6-2', task: 'Create a ServiceAccount called "dev-user"', hint: 'kubectl create sa dev-user', answer: 'kubectl create sa dev-user', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'dev-user') },
      { id: 'lab6-3', task: 'Create a Role called "pod-reader" with get,list,watch on pods', hint: 'kubectl create role pod-reader --verb=get,list,watch --resource=pods', answer: 'kubectl create role pod-reader --verb=get,list,watch --resource=pods', validate: (c) => c.resources.some(r => r.type === 'role' && r.name === 'pod-reader') },
      { id: 'lab6-4', task: 'Create a RoleBinding "dev-read-pods" binding pod-reader to dev-user', hint: 'kubectl create rolebinding dev-read-pods --role=pod-reader --serviceaccount=default:dev-user', answer: 'kubectl create rolebinding dev-read-pods --role=pod-reader --serviceaccount=default:dev-user', validate: (c) => c.resources.some(r => r.type === 'rolebinding' && r.name === 'dev-read-pods') },
    ],
  },

  // ── INTERVIEW LAB 7: StatefulSet with Storage ──
  {
    id: 'lab-statefulset-storage',
    title: 'Lab: StatefulSet with Persistent Storage',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: StatefulSet with Persistent Storage</h2>
<p><strong>Interview Scenario:</strong> "You need to deploy a database (like PostgreSQL or MongoDB) that requires stable network identities and persistent storage. How would you set this up in Kubernetes?"</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> Interviewers love asking about StatefulSets vs Deployments. This tests whether you understand when to use each, and how persistent storage works with stateful workloads.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create a PersistentVolume called "db-pv" with 10Gi capacity</li>
  <li>Create a PersistentVolumeClaim called "db-pvc" requesting 5Gi</li>
  <li>Create a StatefulSet called "postgres" with 3 replicas</li>
  <li>Create a headless Service called "postgres-headless" for the StatefulSet</li>
</ol>

<h3>Key Concepts</h3>
<ul>
  <li><strong>StatefulSet</strong> — Pods get stable names (postgres-0, postgres-1, postgres-2)</li>
  <li><strong>Headless Service</strong> — Each pod gets its own DNS entry</li>
  <li><strong>PV/PVC</strong> — Storage persists even if pods restart</li>
</ul>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create pv db-pv --capacity=10Gi
kubectl create pvc db-pvc --request=5Gi
kubectl create statefulset postgres --image=postgres --replicas=3
kubectl create service postgres-headless --port=5432 --type=ClusterIP</code></pre>
`,
    example: 'kubectl create pv db-pv --capacity=10Gi',
    expectedCommands: ['kubectl create pv', 'kubectl create pvc', 'kubectl create statefulset', 'kubectl create service'],
    hint: 'Create the storage first (PV, PVC), then the StatefulSet, then the headless Service.',
    challenges: [
      { id: 'lab7-1', task: 'Create a PersistentVolume called "db-pv" with 10Gi', hint: 'kubectl create pv db-pv --capacity=10Gi', answer: 'kubectl create pv db-pv --capacity=10Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolume' && r.name === 'db-pv') },
      { id: 'lab7-2', task: 'Create a PersistentVolumeClaim called "db-pvc" requesting 5Gi', hint: 'kubectl create pvc db-pvc --request=5Gi', answer: 'kubectl create pvc db-pvc --request=5Gi', validate: (c) => c.resources.some(r => r.type === 'persistentvolumeclaim' && r.name === 'db-pvc') },
      { id: 'lab7-3', task: 'Create a StatefulSet called "postgres" with 3 replicas', hint: 'kubectl create statefulset postgres --image=postgres --replicas=3', answer: 'kubectl create statefulset postgres --image=postgres --replicas=3', validate: (c) => c.resources.some(r => r.type === 'statefulset' && r.name === 'postgres' && r.metadata.replicas === 3) },
      { id: 'lab7-4', task: 'Expose the "postgres" StatefulSet on port 5432', hint: 'kubectl expose statefulset postgres --port=5432', answer: 'kubectl expose statefulset postgres --port=5432', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'postgres' && r.metadata.port === '5432') },
    ],
  },

  // ── INTERVIEW LAB 8: Network Policy Lockdown ──
  {
    id: 'lab-network-lockdown',
    title: 'Lab: Network Policy Lockdown',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: Network Policy Lockdown</h2>
<p><strong>Interview Scenario:</strong> "Your security team requires that the database pods should only accept traffic from the API pods, and nothing else. How would you implement this?"</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> Network security is a top interview topic. Interviewers want to see that you can restrict pod-to-pod communication using NetworkPolicies — a critical skill for production environments.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create an "api" pod and a "database" pod</li>
  <li>Create a NetworkPolicy called "db-allow-api-only" that restricts access to the database</li>
  <li>Create a second NetworkPolicy called "deny-external" for broader lockdown</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl run api --image=node
kubectl run database --image=postgres
kubectl create networkpolicy db-allow-api-only --pod-selector=app=database
kubectl create networkpolicy deny-external --pod-selector=app=api</code></pre>
`,
    example: 'kubectl run api --image=node',
    expectedCommands: ['kubectl run', 'kubectl create networkpolicy'],
    hint: 'Create the pods first, then apply NetworkPolicies to restrict traffic.',
    challenges: [
      { id: 'lab8-1', task: 'Create a pod called "api" with the node image', hint: 'kubectl run api --image=node', answer: 'kubectl run api --image=node', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'api') },
      { id: 'lab8-2', task: 'Create a pod called "database" with the postgres image', hint: 'kubectl run database --image=postgres', answer: 'kubectl run database --image=postgres', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'database') },
      { id: 'lab8-3', task: 'Create a NetworkPolicy "db-allow-api-only" for database pods', hint: 'kubectl create networkpolicy db-allow-api-only --pod-selector=app=database', answer: 'kubectl create networkpolicy db-allow-api-only --pod-selector=app=database', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'db-allow-api-only') },
      { id: 'lab8-4', task: 'Create a NetworkPolicy "deny-external" for api pods', hint: 'kubectl create networkpolicy deny-external --pod-selector=app=api', answer: 'kubectl create networkpolicy deny-external --pod-selector=app=api', validate: (c) => c.resources.some(r => r.type === 'networkpolicy' && r.name === 'deny-external') },
    ],
  },

  // ── INTERVIEW LAB 9: CronJob Batch Processing ──
  {
    id: 'lab-cronjob-batch',
    title: 'Lab: CronJob Batch Processing',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: CronJob Batch Processing</h2>
<p><strong>Interview Scenario:</strong> "You need to set up a nightly data cleanup job that runs every day, plus a one-time data migration job that processes 5 items in parallel. How would you configure this?"</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> Jobs and CronJobs come up frequently in interviews. They test whether you understand batch workloads vs long-running services — a key distinction in Kubernetes.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create a one-time Job called "data-migration" with 5 completions and parallelism of 3</li>
  <li>Create a CronJob called "nightly-cleanup" that runs on a schedule</li>
  <li>Create another Job called "db-backup" for a database backup</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create job data-migration --image=busybox --completions=5 --parallelism=3
kubectl create cronjob nightly-cleanup --image=busybox --schedule="0 2 * * *"
kubectl create job db-backup --image=postgres</code></pre>
`,
    example: 'kubectl create job data-migration --image=busybox --completions=5 --parallelism=3',
    expectedCommands: ['kubectl create job', 'kubectl create cronjob'],
    hint: 'Use kubectl create job for one-time tasks and kubectl create cronjob for scheduled tasks.',
    challenges: [
      { id: 'lab9-1', task: 'Create a Job "data-migration" with 5 completions and parallelism of 3', hint: 'kubectl create job data-migration --image=busybox --completions=5 --parallelism=3', answer: 'kubectl create job data-migration --image=busybox --completions=5 --parallelism=3', validate: (c) => c.resources.some(r => r.type === 'job' && r.name === 'data-migration' && r.metadata.completions === 5) },
      { id: 'lab9-2', task: 'Create a CronJob "nightly-cleanup" with a schedule', hint: 'kubectl create cronjob nightly-cleanup --image=busybox --schedule="0 2 * * *"', answer: 'kubectl create cronjob nightly-cleanup --image=busybox --schedule="0 2 * * *"', validate: (c) => c.resources.some(r => r.type === 'cronjob' && r.name === 'nightly-cleanup') },
      { id: 'lab9-3', task: 'Create a Job "db-backup" for database backup', hint: 'kubectl create job db-backup --image=postgres', answer: 'kubectl create job db-backup --image=postgres', validate: (c) => c.resources.some(r => r.type === 'job' && r.name === 'db-backup') },
    ],
  },

  // ── INTERVIEW LAB 10: DaemonSet Monitoring Agent ──
  {
    id: 'lab-daemonset-monitoring',
    title: 'Lab: DaemonSet Monitoring Agent',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: DaemonSet Monitoring Agent</h2>
<p><strong>Interview Scenario:</strong> "You need to deploy a log collector and a metrics agent on every node in the cluster. How would you ensure one copy runs on each node, even as new nodes are added?"</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> DaemonSets are a classic interview topic. Interviewers want to know when you'd use a DaemonSet vs a Deployment, and common use cases like monitoring, logging, and networking agents.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create a DaemonSet called "log-collector" using fluentd</li>
  <li>Create a DaemonSet called "metrics-agent" using prometheus-node-exporter</li>
  <li>Create a ConfigMap called "log-config" for the log collector configuration</li>
  <li>Verify both DaemonSets are running with kubectl get daemonsets</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create daemonset log-collector --image=fluentd
kubectl create daemonset metrics-agent --image=prom/node-exporter
kubectl create configmap log-config
kubectl get daemonsets</code></pre>
`,
    example: 'kubectl create daemonset log-collector --image=fluentd',
    expectedCommands: ['kubectl create daemonset', 'kubectl create configmap', 'kubectl get daemonsets'],
    hint: 'DaemonSets automatically run one pod per node. Create them like deployments but with type daemonset.',
    challenges: [
      { id: 'lab10-1', task: 'Create a DaemonSet "log-collector" with fluentd image', hint: 'kubectl create daemonset log-collector --image=fluentd', answer: 'kubectl create daemonset log-collector --image=fluentd', validate: (c) => c.resources.some(r => r.type === 'daemonset' && r.name === 'log-collector') },
      { id: 'lab10-2', task: 'Create a DaemonSet "metrics-agent" with prom/node-exporter', hint: 'kubectl create daemonset metrics-agent --image=prom/node-exporter', answer: 'kubectl create daemonset metrics-agent --image=prom/node-exporter', validate: (c) => c.resources.some(r => r.type === 'daemonset' && r.name === 'metrics-agent') },
      { id: 'lab10-3', task: 'Create a ConfigMap "log-config" for configuration', hint: 'kubectl create configmap log-config', answer: 'kubectl create configmap log-config', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'log-config') },
    ],
  },

  // ── INTERVIEW LAB 11: Blue-Green Deployment ──
  {
    id: 'lab-blue-green',
    title: 'Lab: Blue-Green Deployment',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: Blue-Green Deployment</h2>
<p><strong>Interview Scenario:</strong> "Explain and demonstrate a blue-green deployment strategy. You have a v1 of your app running and need to deploy v2 with zero downtime, with the ability to instantly roll back."</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> Deployment strategies (blue-green, canary, rolling) are among the most common interview questions. This lab tests your understanding of how to use labels and Services to switch traffic between versions.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create the "blue" deployment (v1) with 3 replicas</li>
  <li>Expose it with a Service</li>
  <li>Create the "green" deployment (v2) with 3 replicas</li>
  <li>Label the green deployment to take over traffic</li>
</ol>

<h3>Strategy Explained</h3>
<pre><code># Blue-Green: Two identical environments
# Blue (v1) ← Service points here (live traffic)
# Green (v2) ← Deploy and test here

# When ready, switch the Service selector:
# Blue (v1)
# Green (v2) ← Service now points here

# Rollback? Just switch the selector back!</code></pre>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create deployment app-blue --image=nginx:1.24 --replicas=3
kubectl expose deployment app-blue --port=80 --type=ClusterIP
kubectl create deployment app-green --image=nginx:1.25 --replicas=3
kubectl label deployment app-green version=v2</code></pre>
`,
    example: 'kubectl create deployment app-blue --image=nginx:1.24 --replicas=3',
    expectedCommands: ['kubectl create deployment', 'kubectl expose', 'kubectl label'],
    hint: 'Create both deployments, expose the blue one, then label the green one for the switchover.',
    challenges: [
      { id: 'lab11-1', task: 'Create deployment "app-blue" with nginx:1.24 and 3 replicas', hint: 'kubectl create deployment app-blue --image=nginx:1.24 --replicas=3', answer: 'kubectl create deployment app-blue --image=nginx:1.24 --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'app-blue' && r.metadata.replicas === 3) },
      { id: 'lab11-2', task: 'Expose app-blue as a ClusterIP Service on port 80', hint: 'kubectl expose deployment app-blue --port=80 --type=ClusterIP', answer: 'kubectl expose deployment app-blue --port=80 --type=ClusterIP', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'app-blue') },
      { id: 'lab11-3', task: 'Create deployment "app-green" with nginx:1.25 and 3 replicas', hint: 'kubectl create deployment app-green --image=nginx:1.25 --replicas=3', answer: 'kubectl create deployment app-green --image=nginx:1.25 --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'app-green' && r.metadata.replicas === 3) },
      { id: 'lab11-4', task: 'Label the green deployment with version=v2', hint: 'kubectl label deployment app-green version=v2', answer: 'kubectl label deployment app-green version=v2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'app-green' && r.labels.version === 'v2') },
    ],
  },

  // ── INTERVIEW LAB 12: Microservices Architecture ──
  {
    id: 'lab-microservices',
    title: 'Lab: Microservices Architecture',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: Microservices Architecture</h2>
<p><strong>Interview Scenario:</strong> "Design and deploy a 3-tier microservices application with a frontend, backend API, and database. Each tier should be independently scalable and have its own Service for discovery."</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> This is the classic "design a system on Kubernetes" interview question. It tests your ability to think about service discovery, scaling tiers independently, and organizing resources.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create a namespace "microservices" for isolation</li>
  <li>Deploy the database tier (StatefulSet + Service)</li>
  <li>Deploy the API tier (Deployment + Service)</li>
  <li>Deploy the frontend tier (Deployment + Service with LoadBalancer)</li>
  <li>Scale the API to handle more traffic</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create namespace microservices
kubectl create statefulset db --image=postgres --replicas=1 -n microservices
kubectl create service db-svc --port=5432 -n microservices
kubectl create deployment api --image=node --replicas=2 -n microservices
kubectl expose deployment api --port=3000 -n microservices
kubectl create deployment frontend --image=nginx --replicas=3 -n microservices
kubectl expose deployment frontend --port=80 --type=LoadBalancer -n microservices
kubectl scale deployment/api --replicas=5 -n microservices</code></pre>
`,
    example: 'kubectl create namespace microservices',
    expectedCommands: ['kubectl create namespace', 'kubectl create statefulset', 'kubectl create deployment', 'kubectl expose', 'kubectl scale'],
    hint: 'Build from the bottom up: namespace → database → API → frontend → scale.',
    challenges: [
      { id: 'lab12-1', task: 'Create namespace "microservices"', hint: 'kubectl create namespace microservices', answer: 'kubectl create namespace microservices', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'microservices') },
      { id: 'lab12-2', task: 'Create StatefulSet "db" with postgres in the microservices namespace', hint: 'kubectl create statefulset db --image=postgres -n microservices', answer: 'kubectl create statefulset db --image=postgres --replicas=1 -n microservices', validate: (c) => c.resources.some(r => r.type === 'statefulset' && r.name === 'db') },
      { id: 'lab12-3', task: 'Create Deployment "api" with 2 replicas in microservices namespace', hint: 'kubectl create deployment api --image=node --replicas=2 -n microservices', answer: 'kubectl create deployment api --image=node --replicas=2 -n microservices', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'api') },
      { id: 'lab12-4', task: 'Expose the API deployment on port 3000', hint: 'kubectl expose deployment api --port=3000 -n microservices', answer: 'kubectl expose deployment api --port=3000 -n microservices', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'api') },
      { id: 'lab12-5', task: 'Create Deployment "frontend" with 3 replicas and expose as LoadBalancer', hint: 'kubectl create deployment frontend --image=nginx --replicas=3 -n microservices', answer: 'kubectl create deployment frontend --image=nginx --replicas=3 -n microservices', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'frontend' && r.metadata.replicas === 3) },
      { id: 'lab12-6', task: 'Scale the API to 5 replicas', hint: 'kubectl scale deployment/api --replicas=5 -n microservices', answer: 'kubectl scale deployment/api --replicas=5 -n microservices', validate: (c) => { const api = c.resources.find(r => r.type === 'deployment' && r.name === 'api'); return api?.metadata.replicas === 5; } },
    ],
  },

  // ── INTERVIEW LAB 13: Config & Secrets Management ──
  {
    id: 'lab-config-secrets',
    title: 'Lab: Config & Secrets Management',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: Config & Secrets Management</h2>
<p><strong>Interview Scenario:</strong> "Your application needs database credentials and feature flags. How do you manage configuration and sensitive data in Kubernetes without hardcoding them in your container images?"</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> ConfigMaps and Secrets are fundamental to 12-factor app design on Kubernetes. Interviewers want to see that you separate config from code and handle secrets securely.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Create a ConfigMap "app-config" for application settings</li>
  <li>Create a Secret "db-credentials" for database credentials</li>
  <li>Create a ConfigMap "feature-flags" for feature toggles</li>
  <li>Deploy the application that uses these configs</li>
  <li>Create a Secret "tls-cert" for TLS certificates</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create configmap app-config
kubectl create secret db-credentials
kubectl create configmap feature-flags
kubectl create deployment webapp --image=nginx
kubectl create secret tls-cert</code></pre>
`,
    example: 'kubectl create configmap app-config',
    expectedCommands: ['kubectl create configmap', 'kubectl create secret', 'kubectl create deployment'],
    hint: 'Create ConfigMaps for non-sensitive data and Secrets for credentials.',
    challenges: [
      { id: 'lab13-1', task: 'Create a ConfigMap called "app-config"', hint: 'kubectl create configmap app-config', answer: 'kubectl create configmap app-config', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-config') },
      { id: 'lab13-2', task: 'Create a Secret called "db-credentials"', hint: 'kubectl create secret db-credentials', answer: 'kubectl create secret db-credentials', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-credentials') },
      { id: 'lab13-3', task: 'Create a ConfigMap called "feature-flags"', hint: 'kubectl create configmap feature-flags', answer: 'kubectl create configmap feature-flags', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'feature-flags') },
      { id: 'lab13-4', task: 'Deploy "webapp" using the nginx image', hint: 'kubectl create deployment webapp --image=nginx', answer: 'kubectl create deployment webapp --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'webapp') },
      { id: 'lab13-5', task: 'Create a Secret called "tls-cert" for TLS', hint: 'kubectl create secret tls-cert', answer: 'kubectl create secret tls-cert', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'tls-cert') },
    ],
  },

  // ── INTERVIEW LAB 14: Node Maintenance ──
  {
    id: 'lab-node-maintenance',
    title: 'Lab: Node Maintenance & Scheduling',
    category: 'Interview Labs',
    course: 'kcna',
    content: `
<h2>🎯 Lab: Node Maintenance & Scheduling</h2>
<p><strong>Interview Scenario:</strong> "One of your worker nodes needs a kernel upgrade. How do you safely take it out of rotation, ensure workloads are moved to other nodes, perform maintenance, and bring it back?"</p>

<div class="info-box">
  <strong>💡 Why this matters:</strong> Node maintenance is a day-2 operations question that comes up in every senior K8s interview. It tests your knowledge of cordon, drain, taints, and scheduling.
</div>

<h3>Your Tasks</h3>
<ol>
  <li>Deploy some workloads first (so there's something running)</li>
  <li>Cordon node-1 to prevent new pods from scheduling</li>
  <li>Taint node-1 to repel pods</li>
  <li>Remove the taint after "maintenance"</li>
  <li>Label node-1 to mark maintenance complete</li>
  <li>Uncordon node-1 to bring it back</li>
  <li>Label node-2 for specific workload targeting</li>
</ol>

<h3>Commands You'll Need</h3>
<pre><code>kubectl create deployment web --image=nginx --replicas=4
kubectl cordon node-1
kubectl taint nodes node-1 maintenance=true:NoSchedule
kubectl taint nodes node-1 maintenance=true:NoSchedule-
kubectl label nodes node-1 maintained=true
kubectl uncordon node-1
kubectl label nodes node-2 tier=frontend</code></pre>
`,
    example: 'kubectl create deployment web --image=nginx --replicas=4',
    expectedCommands: ['kubectl create deployment', 'kubectl cordon', 'kubectl taint', 'kubectl uncordon', 'kubectl label'],
    hint: 'Deploy workloads first, then cordon and taint the node, do maintenance, then uncordon.',
    challenges: [
      { id: 'lab14-1', task: 'Create deployment "web" with 4 replicas', hint: 'kubectl create deployment web --image=nginx --replicas=4', answer: 'kubectl create deployment web --image=nginx --replicas=4', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web' && r.metadata.replicas === 4) },
      { id: 'lab14-2', task: 'Cordon node-1 to prevent scheduling', hint: 'kubectl cordon node-1', answer: 'kubectl cordon node-1', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.metadata.status === 'Ready,SchedulingDisabled') },
      { id: 'lab14-3', task: 'Taint node-1 with maintenance=true:NoSchedule', hint: 'kubectl taint nodes node-1 maintenance=true:NoSchedule', answer: 'kubectl taint nodes node-1 maintenance=true:NoSchedule', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && Array.isArray(r.metadata.taints) && (r.metadata.taints as string[]).length > 0) },
      { id: 'lab14-4', task: 'Remove the maintenance taint from node-1', hint: 'kubectl taint nodes node-1 maintenance=true:NoSchedule-', answer: 'kubectl taint nodes node-1 maintenance=true:NoSchedule-', validate: (c) => { const n = c.resources.find(r => r.type === 'node' && r.name === 'node-1'); const taints = (n?.metadata.taints as string[]) || []; return n?.metadata.status === 'Ready,SchedulingDisabled' && !taints.some(t => t.startsWith('maintenance=')); } },
      { id: 'lab14-5', task: 'Label node-1 with maintained=true to mark maintenance complete', hint: 'kubectl label nodes node-1 maintained=true', answer: 'kubectl label nodes node-1 maintained=true', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-1' && r.labels.maintained === 'true') },
      { id: 'lab14-6', task: 'Uncordon node-1 to bring it back into rotation', hint: 'kubectl uncordon node-1', answer: 'kubectl uncordon node-1', validate: (c) => { const n = c.resources.find(r => r.type === 'node' && r.name === 'node-1'); return n !== undefined && n.metadata.status === 'Ready' && n.labels.maintained === 'true'; } },
      { id: 'lab14-7', task: 'Label node-2 with tier=frontend', hint: 'kubectl label nodes node-2 tier=frontend', answer: 'kubectl label nodes node-2 tier=frontend', validate: (c) => c.resources.some(r => r.type === 'node' && r.name === 'node-2' && r.labels.tier === 'frontend') },
    ],
  },
];

export const categories = [...new Set(lessons.map(l => l.category))];

export const allLessons: Lesson[] = [...lessons, ...ckaLessons, ...ckadLessons];

export function getLessonsByCategory(course?: CourseId): Record<string, Lesson[]> {
  const map: Record<string, Lesson[]> = {};
  const filtered = course ? allLessons.filter(l => l.course === course) : allLessons;
  for (const l of filtered) {
    if (!map[l.category]) map[l.category] = [];
    map[l.category].push(l);
  }
  return map;
}

export function getLessonsForCourse(course: CourseId): Lesson[] {
  return allLessons.filter(l => l.course === course);
}
