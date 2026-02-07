import type { Lesson } from './types';

export const lessons: Lesson[] = [
  // ── KUBERNETES FUNDAMENTALS ──
  {
    id: 'what-is-k8s',
    title: 'What is Kubernetes?',
    category: 'Kubernetes Fundamentals',
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
    ],
  },
  {
    id: 'cluster-architecture',
    title: 'Cluster Architecture',
    category: 'Kubernetes Fundamentals',
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
    ],
  },
  // ── PODS ──
  {
    id: 'pods',
    title: 'Pods',
    category: 'Workloads',
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
      { id: 'pod-4', task: 'Delete the "cache" pod', hint: 'kubectl delete pod <name>', answer: 'kubectl delete pod cache', validate: (c) => !c.resources.some(r => r.type === 'pod' && r.name === 'cache') },
    ],
  },
  // ── DEPLOYMENTS ──
  {
    id: 'deployments',
    title: 'Deployments',
    category: 'Workloads',
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
  // ── SERVICES ──
  {
    id: 'services',
    title: 'Services',
    category: 'Networking',
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
  // ── NAMESPACES ──
  {
    id: 'namespaces',
    title: 'Namespaces',
    category: 'Cluster Management',
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
    ],
  },
  // ── CONFIGMAPS & SECRETS ──
  {
    id: 'configmaps-secrets',
    title: 'ConfigMaps & Secrets',
    category: 'Configuration',
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
      { id: 'cfg-3', task: 'Create a ConfigMap called "app-settings"', hint: 'kubectl create configmap app-settings', answer: 'kubectl create configmap app-settings', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-settings') },
      { id: 'cfg-4', task: 'Create a Secret called "db-password"', hint: 'kubectl create secret db-password', answer: 'kubectl create secret db-password', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-password') },
    ],
  },
  // ── INGRESS ──
  {
    id: 'ingress',
    title: 'Ingress',
    category: 'Networking',
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
    ],
  },
  // ── CLOUD NATIVE CONCEPTS ──
  {
    id: 'cloud-native',
    title: 'Cloud Native Concepts',
    category: 'Cloud Native',
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
    category: 'Cloud Native',
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
  // ── INTERVIEW & TROUBLESHOOTING LABS ──
  {
    id: 'lab-deploy-expose',
    title: 'Lab: Deploy & Expose an App',
    category: 'Interview Labs',
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
];

export const categories = [...new Set(lessons.map(l => l.category))];

export function getLessonsByCategory(): Record<string, Lesson[]> {
  const map: Record<string, Lesson[]> = {};
  for (const l of lessons) {
    if (!map[l.category]) map[l.category] = [];
    map[l.category].push(l);
  }
  return map;
}
