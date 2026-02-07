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
    hint: 'Try running kubectl cluster-info to see your simulated cluster.',
    diagram: [
      { id: 'cp', label: 'Control Plane', type: 'control-plane', icon: '🧠', color: '#8b5cf6', children: ['n1', 'n2'] },
      { id: 'n1', label: 'Worker Node 1', type: 'node', icon: '🖥️', color: '#6366f1', children: ['p1', 'p2'] },
      { id: 'n2', label: 'Worker Node 2', type: 'node', icon: '🖥️', color: '#6366f1', children: ['p3'] },
      { id: 'p1', label: 'Pod A', type: 'pod', icon: '🐳', color: '#06b6d4' },
      { id: 'p2', label: 'Pod B', type: 'pod', icon: '🐳', color: '#06b6d4' },
      { id: 'p3', label: 'Pod C', type: 'pod', icon: '🐳', color: '#06b6d4' },
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

# Step 3: Create a deployment to see the architecture in action
kubectl create deployment web --image=nginx

# Step 4: See what was created (Deployment → ReplicaSet → Pod)
kubectl get all

# Step 5: Describe a node
kubectl describe node node-1</code></pre>
`,
    example: 'kubectl get nodes',
    hint: 'Use kubectl get nodes to see the nodes in your cluster.',
    diagram: [
      { id: 'api', label: 'API Server', type: 'component', icon: '🔌', color: '#8b5cf6', children: ['etcd', 'sched', 'cm'] },
      { id: 'etcd', label: 'etcd', type: 'component', icon: '💾', color: '#f59e0b' },
      { id: 'sched', label: 'Scheduler', type: 'component', icon: '📋', color: '#10b981' },
      { id: 'cm', label: 'Controller Manager', type: 'component', icon: '⚙️', color: '#06b6d4' },
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

<h3>Creating a Pod</h3>
<p>The simplest way to create a Pod is with <code>kubectl run</code>:</p>
<pre><code>kubectl run nginx --image=nginx</code></pre>

<p>You can also create Pods declaratively with YAML:</p>
<pre><code>apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> You rarely create Pods directly in production. Instead, you use Deployments or other controllers that manage Pods for you.
</div>

<h3>🧪 Commands to Try</h3>
<p>Enter these in the terminal below and watch the diagram update:</p>
<pre><code># Step 1: Create a pod
kubectl run nginx --image=nginx

# Step 2: See your pod
kubectl get pods

# Step 3: Get details about it
kubectl describe pod nginx

# Step 4: Create another pod
kubectl run redis --image=redis

# Step 5: See all pods
kubectl get pods

# Step 6: Clean up
kubectl delete pod nginx</code></pre>
`,
    example: 'kubectl run nginx --image=nginx',
    expectedCommands: ['kubectl run nginx --image=nginx', 'kubectl get pods'],
    hint: 'Create a pod with kubectl run, then check it with kubectl get pods.',
  },
  // ── DEPLOYMENTS ──
  {
    id: 'deployments',
    title: 'Deployments',
    category: 'Workloads',
    content: `
<h2>Deployments</h2>
<p>A <strong>Deployment</strong> provides declarative updates for Pods and ReplicaSets. You describe a desired state, and the Deployment controller changes the actual state to match.</p>

<h3>What Deployments Do</h3>
<ul>
  <li>Create and manage <strong>ReplicaSets</strong> which in turn manage Pods</li>
  <li>Support <strong>rolling updates</strong> — gradually replace old Pods with new ones</li>
  <li>Support <strong>rollbacks</strong> — revert to a previous version if something goes wrong</li>
  <li>Allow <strong>scaling</strong> — increase or decrease the number of replicas</li>
</ul>

<h3>The Deployment → ReplicaSet → Pod Chain</h3>
<p>When you create a Deployment:</p>
<ol>
  <li>The Deployment creates a <strong>ReplicaSet</strong></li>
  <li>The ReplicaSet creates the specified number of <strong>Pods</strong></li>
  <li>If a Pod dies, the ReplicaSet automatically creates a new one</li>
</ol>

<pre><code>kubectl create deployment webapp --image=nginx --replicas=3</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Deployments are the recommended way to manage stateless applications. For stateful apps, use StatefulSets.
</div>

<h3>🧪 Commands to Try</h3>
<p>Enter these in the terminal and watch the Deployment → ReplicaSet → Pod chain appear:</p>
<pre><code># Step 1: Create a deployment (creates ReplicaSet + Pod automatically)
kubectl create deployment webapp --image=nginx

# Step 2: See the deployment
kubectl get deployments

# Step 3: See everything it created
kubectl get all

# Step 4: Scale it up to 3 replicas
kubectl scale deployment/webapp --replicas=3

# Step 5: See the new pods appear
kubectl get pods

# Step 6: Scale back down
kubectl scale deployment/webapp --replicas=1

# Step 7: Expose it as a service
kubectl expose deployment webapp --port=80</code></pre>
`,
    example: 'kubectl create deployment webapp --image=nginx',
    expectedCommands: ['kubectl create deployment webapp --image=nginx', 'kubectl get deployments', 'kubectl scale deployment/webapp --replicas=3'],
    hint: 'Create a deployment, then try scaling it up with kubectl scale.',
  },
  // ── SERVICES ──
  {
    id: 'services',
    title: 'Services',
    category: 'Networking',
    content: `
<h2>Services</h2>
<p>A <strong>Service</strong> is an abstraction that defines a logical set of Pods and a policy to access them. Services enable stable networking for ephemeral Pods.</p>

<h3>Why Services?</h3>
<p>Pods are ephemeral — they get new IP addresses when recreated. Services provide a <strong>stable IP and DNS name</strong> that doesn't change, even as Pods come and go.</p>

<h3>Service Types</h3>
<table>
  <tr><th>Type</th><th>Description</th></tr>
  <tr><td><code>ClusterIP</code></td><td>Default. Exposes the Service on an internal cluster IP. Only reachable within the cluster.</td></tr>
  <tr><td><code>NodePort</code></td><td>Exposes the Service on each Node's IP at a static port (30000-32767).</td></tr>
  <tr><td><code>LoadBalancer</code></td><td>Exposes the Service externally using a cloud provider's load balancer.</td></tr>
  <tr><td><code>ExternalName</code></td><td>Maps the Service to a DNS name (CNAME record).</td></tr>
</table>

<h3>Creating a Service</h3>
<pre><code>kubectl expose deployment webapp --port=80 --type=ClusterIP</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Services use <strong>label selectors</strong> to determine which Pods to route traffic to. This is a core concept in Kubernetes networking.
</div>

<h3>🧪 Commands to Try</h3>
<p>You need a deployment first, then expose it:</p>
<pre><code># Step 1: Create a deployment to expose
kubectl create deployment webapp --image=nginx

# Step 2: Expose it as a ClusterIP service
kubectl expose deployment webapp --port=80

# Step 3: See the service
kubectl get services

# Step 4: Create a standalone service
kubectl create service my-svc --port=8080

# Step 5: See everything
kubectl get all</code></pre>
`,
    example: 'kubectl expose deployment webapp --port=80',
    expectedCommands: ['kubectl expose deployment webapp --port=80'],
    hint: 'First create a deployment named "webapp", then expose it as a service.',
  },
  // ── NAMESPACES ──
  {
    id: 'namespaces',
    title: 'Namespaces',
    category: 'Cluster Management',
    content: `
<h2>Namespaces</h2>
<p><strong>Namespaces</strong> provide a way to divide cluster resources between multiple users or teams. They're like virtual clusters within a physical cluster.</p>

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

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Not all resources are namespaced. Nodes, PersistentVolumes, and Namespaces themselves are <strong>cluster-scoped</strong>.
</div>

<h3>🧪 Commands to Try</h3>
<p>Practice creating and using namespaces:</p>
<pre><code># Step 1: Create a namespace
kubectl create namespace dev-team

# Step 2: Create a pod in that namespace
kubectl run nginx --image=nginx -n dev-team

# Step 3: List pods in dev-team
kubectl get pods -n dev-team

# Step 4: Create another namespace
kubectl create namespace staging

# Step 5: List all namespaces
kubectl get namespaces

# Step 6: List everything across all namespaces
kubectl get all -A</code></pre>
`,
    example: 'kubectl create namespace dev-team',
    expectedCommands: ['kubectl create namespace dev-team', 'kubectl run nginx --image=nginx -n dev-team'],
    hint: 'Create a namespace, then create a pod inside it using the -n flag.',
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

<pre><code>kubectl create configmap app-config --from-literal=DB_HOST=mysql --from-literal=DB_PORT=3306</code></pre>

<h3>Secrets</h3>
<p>A <strong>Secret</strong> is similar to a ConfigMap but designed for sensitive data like passwords, tokens, and keys. Values are base64-encoded (not encrypted by default!).</p>

<pre><code>kubectl create secret generic db-creds --from-literal=password=mysecretpass</code></pre>

<h3>Key Differences</h3>
<table>
  <tr><th>Feature</th><th>ConfigMap</th><th>Secret</th></tr>
  <tr><td>Data type</td><td>Non-sensitive config</td><td>Sensitive data</td></tr>
  <tr><td>Encoding</td><td>Plain text</td><td>Base64 encoded</td></tr>
  <tr><td>Size limit</td><td>1 MB</td><td>1 MB</td></tr>
  <tr><td>Encryption at rest</td><td>No</td><td>Optional (EncryptionConfiguration)</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Secrets are base64-encoded, NOT encrypted. For real security, enable encryption at rest or use external secret managers like AWS Secrets Manager or HashiCorp Vault.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a configmap
kubectl create configmap app-config

# Step 2: Create a secret
kubectl create secret db-creds

# Step 3: See your config resources
kubectl get configmaps
kubectl get secrets

# Step 4: Describe them
kubectl describe configmap app-config
kubectl describe secret db-creds</code></pre>
`,
    example: 'kubectl create configmap app-config',
    expectedCommands: ['kubectl create configmap app-config', 'kubectl create secret db-creds'],
    hint: 'Try creating a configmap and a secret.',
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

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> The KCNA exam covers CNCF ecosystem heavily. Know the maturity levels and which projects belong to each.
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
</ul>

<h3>Orchestration Platforms</h3>
<table>
  <tr><th>Platform</th><th>Notes</th></tr>
  <tr><td><strong>Kubernetes</strong></td><td>Industry standard, most widely adopted</td></tr>
  <tr><td>Docker Swarm</td><td>Simpler but less feature-rich</td></tr>
  <tr><td>Apache Mesos</td><td>General-purpose cluster manager</td></tr>
  <tr><td>Nomad (HashiCorp)</td><td>Flexible, supports non-container workloads</td></tr>
</table>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> Kubernetes has become the de facto standard for container orchestration. Understanding <em>why</em> orchestration is needed is just as important as knowing how K8s works.
</div>
`,
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

<pre><code>apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80</code></pre>

<div class="info-box">
  <strong>💡 KCNA Tip:</strong> An Ingress resource alone does nothing — you need an <strong>Ingress Controller</strong> running in the cluster to implement the rules.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code># Step 1: Create a deployment and service first
kubectl create deployment api --image=nginx
kubectl expose deployment api --port=80

# Step 2: Create an ingress
kubectl create ingress app-ingress

# Step 3: See all networking resources
kubectl get services
kubectl get ingress

# Step 4: See everything
kubectl get all</code></pre>
`,
    example: 'kubectl create ingress app-ingress',
    hint: 'Create an ingress resource to see it appear in the simulator.',
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
