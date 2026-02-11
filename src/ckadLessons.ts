import type { Lesson } from './types';

export const ckadLessons: Lesson[] = [
  // ── APPLICATION DESIGN & BUILD (20%) ──
  {
    id: 'ckad-multi-container',
    title: 'Multi-Container Pod Patterns',
    category: 'App Design & Build',
    course: 'ckad',
    content: `
<h2>Multi-Container Pod Patterns</h2>
<p>The CKAD focuses on application development patterns. Multi-container pods are a key topic — containers in the same pod share network and storage.</p>

<h3>Patterns</h3>
<ul>
  <li><strong>Sidecar</strong> — Enhances the main container (e.g., log shipper, proxy)</li>
  <li><strong>Ambassador</strong> — Proxies network connections (e.g., database proxy)</li>
  <li><strong>Adapter</strong> — Transforms output (e.g., log format converter)</li>
  <li><strong>Init Container</strong> — Runs before main containers start (e.g., DB migration, config fetch)</li>
</ul>

<h3>Init Containers</h3>
<pre><code>spec:
  initContainers:
  - name: init-db
    image: busybox
    command: ['sh', '-c', 'until nslookup db-svc; do sleep 2; done']
  containers:
  - name: app
    image: myapp:v1</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Init containers run sequentially and must all succeed before the main containers start. They're great for dependency checks.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run sidecar-demo --image=nginx
kubectl get pods
kubectl describe pod sidecar-demo</code></pre>
`,
    example: 'kubectl run sidecar-demo --image=nginx',
    challenges: [
      { id: 'ckad-mc-1', task: 'Run a pod called "sidecar-demo" with nginx', hint: 'kubectl run sidecar-demo --image=nginx', answer: 'kubectl run sidecar-demo --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'sidecar-demo') },
    ],
  },
  {
    id: 'ckad-jobs',
    title: 'Jobs & CronJobs for Developers',
    category: 'App Design & Build',
    course: 'ckad',
    content: `
<h2>Jobs & CronJobs for Developers</h2>
<p>Jobs run tasks to completion. CronJobs schedule them on a recurring basis. The CKAD expects you to create and configure both.</p>

<h3>Job</h3>
<pre><code>kubectl create job my-job --image=busybox -- echo "Hello from job"

# Key settings:
# completions: how many pods must succeed
# parallelism: how many pods run at once
# backoffLimit: retries before marking failed
# activeDeadlineSeconds: timeout</code></pre>

<h3>CronJob</h3>
<pre><code>kubectl create cronjob my-cron --image=busybox --schedule="*/5 * * * *" -- echo "tick"

# Key settings:
# successfulJobsHistoryLimit
# failedJobsHistoryLimit
# concurrencyPolicy: Allow | Forbid | Replace</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Cron schedule format<br/><br/>
  <table style="width:100%; border-collapse:collapse; font-size:0.85em; margin-bottom:12px;">
    <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
      <th style="text-align:left; padding:6px 8px; color:#818cf8;">Field</th>
      <th style="text-align:left; padding:6px 8px; color:#818cf8;">Range</th>
      <th style="text-align:left; padding:6px 8px; color:#818cf8;">Example</th>
      <th style="text-align:left; padding:6px 8px; color:#818cf8;">Meaning</th>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:6px 8px;">Minute</td>
      <td style="padding:6px 8px;"><code>0–59</code></td>
      <td style="padding:6px 8px;"><code>*/5</code></td>
      <td style="padding:6px 8px;">every 5 minutes</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:6px 8px;">Hour</td>
      <td style="padding:6px 8px;"><code>0–23</code></td>
      <td style="padding:6px 8px;"><code>8</code></td>
      <td style="padding:6px 8px;">at 8 AM</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:6px 8px;">Day of Month</td>
      <td style="padding:6px 8px;"><code>1–31</code></td>
      <td style="padding:6px 8px;"><code>15</code></td>
      <td style="padding:6px 8px;">on the 15th</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
      <td style="padding:6px 8px;">Month</td>
      <td style="padding:6px 8px;"><code>1–12</code></td>
      <td style="padding:6px 8px;"><code>*/3</code></td>
      <td style="padding:6px 8px;">every 3 months</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;">Day of Week</td>
      <td style="padding:6px 8px;"><code>0–6</code></td>
      <td style="padding:6px 8px;"><code>1</code></td>
      <td style="padding:6px 8px;">Monday (0=Sun)</td>
    </tr>
  </table>
  <strong>Full command examples:</strong><br/>
  <code>kubectl create cronjob backup --schedule="*/5 * * * *" --image=busybox -- echo backup</code><br/>
  <span style="color:#9ca3af; font-size:0.85em;">↳ runs every 5 minutes</span><br/><br/>
  <code>kubectl create cronjob report --schedule="30 8 * * 1" --image=busybox -- echo report</code><br/>
  <span style="color:#9ca3af; font-size:0.85em;">↳ runs every Monday at 8:30 AM</span><br/><br/>
  <code>kubectl create cronjob cleanup --schedule="0 0 1 * *" --image=busybox -- echo clean</code><br/>
  <span style="color:#9ca3af; font-size:0.85em;">↳ runs at midnight on the 1st of every month</span>
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create job hello-job --image=busybox -- echo "done"
kubectl get jobs
kubectl create cronjob ticker --image=busybox --schedule="*/1 * * * *" -- echo "tick"
kubectl get cronjobs</code></pre>
`,
    example: 'kubectl get jobs',
    challenges: [
      { id: 'ckad-job-1', task: 'Create a job called "hello-job" using busybox', hint: 'kubectl create job hello-job --image=busybox -- echo done', answer: 'kubectl create job hello-job --image=busybox -- echo done', validate: (c) => c.resources.some(r => r.type === 'job' && r.name === 'hello-job') },
      { id: 'ckad-job-2', task: 'Create a cronjob called "ticker" that runs every minute', hint: 'kubectl create cronjob ticker --image=busybox --schedule="*/1 * * * *" -- echo tick', answer: 'kubectl create cronjob ticker --image=busybox --schedule="*/1 * * * *" -- echo tick', validate: (c) => c.resources.some(r => r.type === 'cronjob' && r.name === 'ticker') },
    ],
  },

  // ── APPLICATION DEPLOYMENT (20%) ──
  {
    id: 'ckad-deployments',
    title: 'Deployment Strategies',
    category: 'App Deployment',
    course: 'ckad',
    content: `
<h2>Deployment Strategies</h2>
<p>The CKAD tests your ability to manage application deployments, rolling updates, and rollbacks.</p>

<h3>Rolling Update (Default)</h3>
<pre><code># Update image
kubectl set image deployment/web web=nginx:1.25

# Watch the rollout
kubectl rollout status deployment/web

# Check history
kubectl rollout history deployment/web

# Rollback
kubectl rollout undo deployment/web
kubectl rollout undo deployment/web --to-revision=2</code></pre>

<h3>Strategy Configuration</h3>
<pre><code>spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # extra pods during update
      maxUnavailable: 0   # zero downtime</code></pre>

<h3>Blue-Green & Canary</h3>
<p>Not built into Deployments directly, but achievable with label selectors and services:</p>
<ul>
  <li><strong>Blue-Green</strong> — Two deployments, switch service selector</li>
  <li><strong>Canary</strong> — Small deployment with same labels, traffic splits by replica ratio</li>
</ul>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create deployment web --image=nginx:1.24 --replicas=3
kubectl set image deployment/web nginx=nginx:1.25
kubectl rollout status deployment/web
kubectl rollout undo deployment/web</code></pre>
`,
    example: 'kubectl create deployment web --image=nginx:1.24 --replicas=3',
    challenges: [
      { id: 'ckad-deploy-1', task: 'Create deployment "web" with nginx:1.24 and 3 replicas', hint: 'kubectl create deployment web --image=nginx:1.24 --replicas=3', answer: 'kubectl create deployment web --image=nginx:1.24 --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web') },
      { id: 'ckad-deploy-2', task: 'Update the deployment to nginx:1.25', hint: 'kubectl set image deployment/web nginx=nginx:1.25', answer: 'kubectl set image deployment/web nginx=nginx:1.25', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'web' && r.metadata?.image === 'nginx:1.25') },
    ],
  },
  {
    id: 'ckad-helm',
    title: 'Using Helm as a Developer',
    category: 'App Deployment',
    course: 'ckad',
    content: `
<h2>Using Helm as a Developer</h2>
<p>Helm is the package manager for Kubernetes. The CKAD expects you to use Helm to install, upgrade, and manage releases.</p>

<h3>Key Commands</h3>
<pre><code># Search for charts
helm search repo nginx
helm search hub wordpress

# Install a release
helm install my-release bitnami/nginx

# List releases
helm list

# Upgrade with new values
helm upgrade my-release bitnami/nginx --set replicaCount=3

# Rollback
helm rollback my-release 1

# Uninstall
helm uninstall my-release</code></pre>

<h3>Custom Values</h3>
<pre><code># values.yaml
replicaCount: 3
image:
  tag: "1.25"

helm install my-app ./my-chart -f values.yaml</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> You don't need to create charts from scratch, but you should know how to install, upgrade, rollback, and pass custom values.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create deployment helm-demo --image=nginx --replicas=2
kubectl get deployments</code></pre>
`,
    example: 'kubectl get deployments',
    challenges: [
      { id: 'ckad-helm-1', task: 'Create a deployment "helm-demo" with 2 replicas', hint: 'kubectl create deployment helm-demo --image=nginx --replicas=2', answer: 'kubectl create deployment helm-demo --image=nginx --replicas=2', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'helm-demo') },
    ],
  },

  // ── APPLICATION ENVIRONMENT, CONFIGURATION & SECURITY (25%) ──
  {
    id: 'ckad-configmaps-secrets',
    title: 'ConfigMaps & Secrets for Apps',
    category: 'App Config & Security',
    course: 'ckad',
    content: `
<h2>ConfigMaps & Secrets for Apps</h2>
<p>The CKAD heavily tests your ability to inject configuration into pods using ConfigMaps and Secrets.</p>

<h3>ConfigMaps</h3>
<pre><code># From literal values
kubectl create configmap app-config --from-literal=DB_HOST=postgres --from-literal=DB_PORT=5432

# From file
kubectl create configmap app-config --from-file=config.properties

# Use as env vars
env:
- name: DB_HOST
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: DB_HOST

# Use as volume mount
volumes:
- name: config-vol
  configMap:
    name: app-config</code></pre>

<h3>Secrets</h3>
<pre><code># Create a secret
kubectl create secret generic db-creds --from-literal=username=admin --from-literal=password=s3cret

# Secrets are base64 encoded, NOT encrypted by default</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Know all the ways to consume ConfigMaps and Secrets: env vars, envFrom, volume mounts. Also know how to create them imperatively.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create configmap app-config --from-literal=ENV=production --from-literal=LOG_LEVEL=info
kubectl create secret generic db-creds --from-literal=user=admin --from-literal=pass=secret
kubectl get configmaps
kubectl get secrets</code></pre>
`,
    example: 'kubectl get configmaps',
    challenges: [
      { id: 'ckad-cm-1', task: 'Create a configmap "app-config" with ENV=production', hint: 'kubectl create configmap app-config --from-literal=ENV=production', answer: 'kubectl create configmap app-config --from-literal=ENV=production', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'app-config') },
      { id: 'ckad-cm-2', task: 'Create a secret "db-creds" with user=admin', hint: 'kubectl create secret generic db-creds --from-literal=user=admin', answer: 'kubectl create secret generic db-creds --from-literal=user=admin', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'db-creds') },
    ],
  },
  {
    id: 'ckad-security-context',
    title: 'Security Contexts & Service Accounts',
    category: 'App Config & Security',
    course: 'ckad',
    content: `
<h2>Security Contexts & Service Accounts</h2>
<p>The CKAD expects you to configure pod and container security settings.</p>

<h3>Security Context</h3>
<pre><code>spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]</code></pre>

<h3>Service Accounts</h3>
<pre><code># Create a service account
kubectl create serviceaccount app-sa

# Use in a pod
spec:
  serviceAccountName: app-sa
  automountServiceAccountToken: false</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Always set <code>allowPrivilegeEscalation: false</code> and drop all capabilities unless specifically needed. Know how to assign service accounts to pods.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create serviceaccount app-sa
kubectl get serviceaccounts
kubectl run secure-app --image=nginx</code></pre>
`,
    example: 'kubectl get serviceaccounts',
    challenges: [
      { id: 'ckad-sec-1', task: 'Create a service account called "app-sa"', hint: 'kubectl create serviceaccount app-sa', answer: 'kubectl create serviceaccount app-sa', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'app-sa') },
    ],
  },

  // ── SERVICES & NETWORKING (20%) ──
  {
    id: 'ckad-services',
    title: 'Exposing Applications',
    category: 'Services & Networking',
    course: 'ckad',
    content: `
<h2>Exposing Applications</h2>
<p>The CKAD focuses on how developers expose their applications to other services and external users.</p>

<h3>Service Types</h3>
<pre><code># ClusterIP (default — internal only)
kubectl expose deployment web --port=80 --name=web-svc

# NodePort (external access via node IP)
kubectl expose deployment web --port=80 --type=NodePort --name=web-np

# Create from scratch
kubectl create service clusterip my-svc --tcp=80:8080</code></pre>

<h3>Ingress for HTTP Routing</h3>
<pre><code>kubectl create ingress app-ingress --rule="myapp.com/api=api-svc:8080" --rule="myapp.com/web=web-svc:80"</code></pre>

<h3>Port Forwarding (for debugging)</h3>
<pre><code>kubectl port-forward pod/web 8080:80
kubectl port-forward svc/web-svc 8080:80</code></pre>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create deployment api --image=nginx --replicas=2
kubectl expose deployment api --port=80 --name=api-svc
kubectl get svc
kubectl get endpoints api-svc</code></pre>
`,
    example: 'kubectl get svc',
    challenges: [
      { id: 'ckad-svc-1', task: 'Create deployment "api" with 2 replicas and expose as "api-svc"', hint: 'kubectl create deployment api --image=nginx --replicas=2 then kubectl expose deployment api --port=80 --name=api-svc', answer: 'kubectl expose deployment api --port=80 --name=api-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'api-svc') },
    ],
  },

  // ── APPLICATION OBSERVABILITY & MAINTENANCE (15%) ──
  {
    id: 'ckad-probes',
    title: 'Probes & Health Checks',
    category: 'Observability & Maintenance',
    course: 'ckad',
    content: `
<h2>Probes & Health Checks</h2>
<p>Probes tell Kubernetes whether your application is healthy and ready to serve traffic.</p>

<h3>Probe Types</h3>
<ul>
  <li><strong>Liveness Probe</strong> — Is the container alive? If it fails, Kubernetes restarts the container.</li>
  <li><strong>Readiness Probe</strong> — Is the container ready for traffic? If it fails, the pod is removed from service endpoints.</li>
  <li><strong>Startup Probe</strong> — Has the container started? Disables liveness/readiness checks until it succeeds. Good for slow-starting apps.</li>
</ul>

<h3>Probe Methods</h3>
<pre><code># HTTP GET
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10

# TCP Socket
readinessProbe:
  tcpSocket:
    port: 3306

# Exec command
livenessProbe:
  exec:
    command: ["cat", "/tmp/healthy"]</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Know when to use each probe type and method. Liveness restarts, readiness removes from service, startup gates the other probes.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run healthy-app --image=nginx
kubectl describe pod healthy-app
kubectl get pods</code></pre>
`,
    example: 'kubectl get pods',
    challenges: [
      { id: 'ckad-probe-1', task: 'Run a pod called "healthy-app" with nginx', hint: 'kubectl run healthy-app --image=nginx', answer: 'kubectl run healthy-app --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'healthy-app') },
    ],
  },
  {
    id: 'ckad-logging',
    title: 'Logging & Debugging',
    category: 'Observability & Maintenance',
    course: 'ckad',
    content: `
<h2>Logging & Debugging</h2>
<p>The CKAD tests your ability to debug running applications using logs, exec, and resource inspection.</p>

<h3>Viewing Logs</h3>
<pre><code># Basic logs
kubectl logs &lt;pod-name&gt;

# Follow logs
kubectl logs -f &lt;pod-name&gt;

# Specific container in multi-container pod
kubectl logs &lt;pod-name&gt; -c &lt;container-name&gt;

# Previous container (after crash)
kubectl logs &lt;pod-name&gt; --previous</code></pre>

<h3>Debugging</h3>
<pre><code># Exec into a running container
kubectl exec -it &lt;pod-name&gt; -- /bin/sh

# Check resource usage
kubectl top pods
kubectl top nodes</code></pre>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run debug-pod --image=nginx
kubectl describe pod debug-pod
kubectl get pods -o wide</code></pre>
`,
    example: 'kubectl get pods -o wide',
    challenges: [
      { id: 'ckad-log-1', task: 'Run a pod called "debug-pod" and describe it', hint: 'kubectl run debug-pod --image=nginx', answer: 'kubectl run debug-pod --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'debug-pod') },
    ],
  },

  // ── CKAD: APPLICATION DESIGN ADDITIONS ──
  {
    id: 'ckad-container-images',
    title: 'Container Images',
    category: 'App Design & Build',
    course: 'ckad',
    content: `
<h2>Container Images</h2>
<p>The CKAD expects you to understand how container images are built, tagged, and used in Kubernetes.</p>

<h3>Dockerfile Basics</h3>
<pre><code>FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
USER 1000
CMD ["node", "server.js"]</code></pre>

<h3>Best Practices</h3>
<ul>
  <li>Use <strong>specific tags</strong> (not <code>latest</code>) for reproducibility</li>
  <li>Use <strong>multi-stage builds</strong> to reduce image size</li>
  <li>Run as <strong>non-root user</strong> for security</li>
  <li>Minimize layers — combine RUN commands</li>
  <li>Use <code>.dockerignore</code> to exclude unnecessary files</li>
</ul>

<h3>Multi-Stage Build</h3>
<pre><code># Build stage
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o myapp

# Runtime stage
FROM alpine:3.19
COPY --from=builder /app/myapp /usr/local/bin/
CMD ["myapp"]</code></pre>

<h3>Image in Kubernetes</h3>
<pre><code># imagePullPolicy options:
# Always — always pull (default for :latest)
# IfNotPresent — pull only if not cached (default for tagged)
# Never — only use cached images

spec:
  containers:
  - name: app
    image: myregistry.io/myapp:v1.2.3
    imagePullPolicy: IfNotPresent</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Know Dockerfile instructions (FROM, COPY, RUN, CMD, ENTRYPOINT, EXPOSE, USER), multi-stage builds, and how <code>imagePullPolicy</code> works in pod specs.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run myapp --image=nginx:1.25
kubectl describe pod myapp</code></pre>
`,
    example: 'kubectl run myapp --image=nginx:1.25',
    challenges: [
      { id: 'ckad-img-1', task: 'Run a pod "myapp" with a specific nginx version (nginx:1.25)', hint: 'kubectl run myapp --image=nginx:1.25', answer: 'kubectl run myapp --image=nginx:1.25', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'myapp') },
    ],
  },
  {
    id: 'ckad-volumes',
    title: 'Persistent & Ephemeral Volumes',
    category: 'App Design & Build',
    course: 'ckad',
    content: `
<h2>Persistent & Ephemeral Volumes</h2>
<p>The CKAD tests your ability to use volumes in pods for both temporary and durable storage.</p>

<h3>Ephemeral Volumes</h3>
<pre><code># emptyDir — shared temp storage between containers
spec:
  containers:
  - name: app
    volumeMounts:
    - name: cache
      mountPath: /tmp/cache
  - name: sidecar
    volumeMounts:
    - name: cache
      mountPath: /data
  volumes:
  - name: cache
    emptyDir: {}

# emptyDir with memory backing (tmpfs)
  volumes:
  - name: fast-cache
    emptyDir:
      medium: Memory
      sizeLimit: 100Mi</code></pre>

<h3>Persistent Volumes</h3>
<pre><code># PVC in pod spec
spec:
  containers:
  - name: db
    volumeMounts:
    - name: data
      mountPath: /var/lib/postgresql/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: db-data

---
# PVC definition
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 5Gi</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> <code>emptyDir</code> is great for sharing data between containers in the same pod. It's deleted when the pod is removed. Use PVCs for data that must survive pod restarts.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run db --image=postgres
kubectl get pvc</code></pre>
`,
    example: 'kubectl get pvc',
    challenges: [
      { id: 'ckad-vol-1', task: 'Run a pod "db" with postgres image', hint: 'kubectl run db --image=postgres', answer: 'kubectl run db --image=postgres', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'db') },
    ],
  },

  // ── CKAD: DEPLOYMENT ADDITIONS ──
  {
    id: 'ckad-kustomize',
    title: 'Kustomize',
    category: 'App Deployment',
    course: 'ckad',
    content: `
<h2>Kustomize</h2>
<p>Kustomize is built into kubectl and lets you customize Kubernetes YAML without templating. It's now on the CKAD exam.</p>

<h3>How It Works</h3>
<pre><code># kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
namePrefix: dev-
commonLabels:
  env: development
images:
- name: myapp
  newTag: v2.0.0</code></pre>

<h3>Key Commands</h3>
<pre><code># Preview the output
kubectl kustomize ./

# Apply directly
kubectl apply -k ./

# Build with overlays
kubectl kustomize overlays/production/</code></pre>

<h3>Overlays Pattern</h3>
<pre><code>base/
  deployment.yaml
  service.yaml
  kustomization.yaml
overlays/
  dev/
    kustomization.yaml    # patches for dev
  prod/
    kustomization.yaml    # patches for prod
    replica-patch.yaml</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Know <code>kubectl apply -k</code> and <code>kubectl kustomize</code>. Understand how to use namePrefix, commonLabels, images, and patches in kustomization.yaml.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create deployment kust-demo --image=nginx
kubectl get deployments</code></pre>
`,
    example: 'kubectl get deployments',
    challenges: [
      { id: 'ckad-kust-1', task: 'Create a deployment "kust-demo" with nginx', hint: 'kubectl create deployment kust-demo --image=nginx', answer: 'kubectl create deployment kust-demo --image=nginx', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'kust-demo') },
    ],
  },

  // ── CKAD: OBSERVABILITY ADDITIONS ──
  {
    id: 'ckad-api-deprecations',
    title: 'API Deprecations & Versions',
    category: 'Observability & Maintenance',
    course: 'ckad',
    content: `
<h2>API Deprecations & Versions</h2>
<p>Kubernetes evolves its APIs through alpha → beta → stable stages. The CKAD expects you to handle API version changes.</p>

<h3>API Lifecycle</h3>
<table style="width:100%; border-collapse:collapse; font-size:0.85em; margin:12px 0;">
  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Stage</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Example</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Stability</th>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">Alpha</td>
    <td style="padding:6px 8px;"><code>v1alpha1</code></td>
    <td style="padding:6px 8px;">May change or be removed</td>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">Beta</td>
    <td style="padding:6px 8px;"><code>v1beta1</code></td>
    <td style="padding:6px 8px;">Well-tested, may have minor changes</td>
  </tr>
  <tr>
    <td style="padding:6px 8px;">Stable</td>
    <td style="padding:6px 8px;"><code>v1</code></td>
    <td style="padding:6px 8px;">GA, backward compatible</td>
  </tr>
</table>

<h3>Common Migrations</h3>
<ul>
  <li><code>extensions/v1beta1</code> Ingress → <code>networking.k8s.io/v1</code></li>
  <li><code>rbac.authorization.k8s.io/v1beta1</code> → <code>rbac.authorization.k8s.io/v1</code></li>
  <li><code>batch/v1beta1</code> CronJob → <code>batch/v1</code></li>
</ul>

<h3>Useful Commands</h3>
<pre><code># Check available API versions
kubectl api-versions

# Check available resources and their API groups
kubectl api-resources

# Convert deprecated manifests
kubectl convert -f old-ingress.yaml --output-version networking.k8s.io/v1</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Always use the latest stable API version in your manifests. Use <code>kubectl api-resources</code> to check which version is current for a resource type.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pods
kubectl get nodes</code></pre>
`,
    example: 'kubectl get pods',
    challenges: [
      { id: 'ckad-api-1', task: 'List all pods to verify cluster access', hint: 'kubectl get pods', answer: 'kubectl get pods', validate: () => true },
    ],
  },
  {
    id: 'ckad-debugging',
    title: 'Debugging in Kubernetes',
    category: 'Observability & Maintenance',
    course: 'ckad',
    content: `
<h2>Debugging in Kubernetes</h2>
<p>The CKAD tests your ability to debug applications using kubectl tools and techniques.</p>

<h3>Debug Workflow</h3>
<ol>
  <li><strong>Check status</strong> — <code>kubectl get pods</code> (look for CrashLoopBackOff, Error, Pending)</li>
  <li><strong>Describe</strong> — <code>kubectl describe pod &lt;name&gt;</code> (check Events section)</li>
  <li><strong>Logs</strong> — <code>kubectl logs &lt;name&gt;</code> (application output)</li>
  <li><strong>Exec</strong> — <code>kubectl exec -it &lt;name&gt; -- /bin/sh</code> (interactive debugging)</li>
  <li><strong>Ephemeral debug container</strong> — <code>kubectl debug &lt;name&gt; -it --image=busybox</code></li>
</ol>

<h3>kubectl debug</h3>
<pre><code># Attach a debug container to a running pod
kubectl debug mypod -it --image=busybox --target=mycontainer

# Create a copy of the pod with a debug container
kubectl debug mypod -it --image=busybox --copy-to=debug-pod

# Debug a node
kubectl debug node/mynode -it --image=ubuntu</code></pre>

<h3>Common Debug Scenarios</h3>
<table style="width:100%; border-collapse:collapse; font-size:0.85em; margin:12px 0;">
  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Problem</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">Tool</th>
    <th style="text-align:left; padding:6px 8px; color:#818cf8;">What to Look For</th>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">Pod won't start</td>
    <td style="padding:6px 8px;"><code>describe</code></td>
    <td style="padding:6px 8px;">Events: image pull errors, resource limits</td>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">App crashes</td>
    <td style="padding:6px 8px;"><code>logs --previous</code></td>
    <td style="padding:6px 8px;">Stack traces, config errors</td>
  </tr>
  <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
    <td style="padding:6px 8px;">Can't connect</td>
    <td style="padding:6px 8px;"><code>exec</code> + wget/curl</td>
    <td style="padding:6px 8px;">DNS resolution, port binding</td>
  </tr>
  <tr>
    <td style="padding:6px 8px;">Distroless image</td>
    <td style="padding:6px 8px;"><code>kubectl debug</code></td>
    <td style="padding:6px 8px;">Attach debug container with tools</td>
  </tr>
</table>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> <code>kubectl debug</code> is essential for distroless or minimal images that don't have a shell. Know how to use it to attach ephemeral containers.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run debug-target --image=nginx
kubectl describe pod debug-target
kubectl get pods</code></pre>
`,
    example: 'kubectl get pods',
    challenges: [
      { id: 'ckad-debug-1', task: 'Run a pod "debug-target" and describe it', hint: 'kubectl run debug-target --image=nginx', answer: 'kubectl run debug-target --image=nginx', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'debug-target') },
    ],
  },

  // ── CKAD: CONFIG & SECURITY ADDITIONS ──
  {
    id: 'ckad-crds-operators',
    title: 'CRDs & Operators',
    category: 'App Config & Security',
    course: 'ckad',
    content: `
<h2>CRDs & Operators</h2>
<p>The CKAD now includes discovering and using resources that extend Kubernetes via Custom Resource Definitions and Operators.</p>

<h3>What Are CRDs?</h3>
<p>CRDs let you define new resource types in Kubernetes. Once created, you can use kubectl to manage them just like built-in resources.</p>

<pre><code># List all CRDs
kubectl get crds

# Describe a CRD to see its schema
kubectl describe crd certificates.cert-manager.io

# List custom resources
kubectl get certificates
kubectl get cert  # using shortName</code></pre>

<h3>Working with Operators</h3>
<p>Operators automate application lifecycle management using CRDs + controllers.</p>
<ul>
  <li><strong>Install</strong> — Usually via Helm chart or kubectl apply</li>
  <li><strong>Use</strong> — Create custom resources that the operator watches</li>
  <li><strong>Manage</strong> — The operator handles scaling, backups, upgrades automatically</li>
</ul>

<pre><code># Example: cert-manager Certificate resource
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-cert
spec:
  secretName: my-cert-tls
  issuerRef:
    name: letsencrypt
    kind: ClusterIssuer
  dnsNames:
  - myapp.example.com</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> You won't create CRDs from scratch, but you need to know how to discover them (<code>kubectl get crds</code>), understand their schema, and create instances of custom resources.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl get pods
kubectl get nodes</code></pre>
`,
    example: 'kubectl get pods',
    challenges: [
      { id: 'ckad-crd-1', task: 'List pods to verify cluster access', hint: 'kubectl get pods', answer: 'kubectl get pods', validate: () => true },
    ],
  },
  {
    id: 'ckad-resource-requirements',
    title: 'Resource Requests, Limits & Quotas',
    category: 'App Config & Security',
    course: 'ckad',
    content: `
<h2>Resource Requests, Limits & Quotas</h2>
<p>The CKAD expects you to define resource requirements for containers and understand namespace-level quotas.</p>

<h3>Requests & Limits</h3>
<pre><code>spec:
  containers:
  - name: app
    image: myapp:v1
    resources:
      requests:
        cpu: "250m"       # 0.25 CPU cores
        memory: "128Mi"   # 128 MiB
      limits:
        cpu: "500m"       # 0.5 CPU cores
        memory: "256Mi"   # 256 MiB</code></pre>

<h3>What Happens When Limits Are Exceeded?</h3>
<ul>
  <li><strong>CPU</strong> — Container is throttled (slowed down), not killed</li>
  <li><strong>Memory</strong> — Container is OOMKilled and restarted</li>
</ul>

<h3>ResourceQuota</h3>
<pre><code>apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "4"
    requests.memory: "8Gi"
    limits.cpu: "8"
    limits.memory: "16Gi"
    pods: "20"
    services: "10"</code></pre>

<h3>LimitRange</h3>
<pre><code>apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: dev
spec:
  limits:
  - default:
      cpu: "500m"
      memory: "256Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    type: Container</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> If a namespace has a ResourceQuota for CPU/memory, every pod must specify resource requests. LimitRange sets defaults so pods without explicit resources still get constraints.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create namespace dev
kubectl create quota dev-quota --hard=pods=10,cpu=4,memory=8Gi -n dev
kubectl describe quota dev-quota -n dev</code></pre>
`,
    example: 'kubectl create namespace dev',
    challenges: [
      { id: 'ckad-rq-1', task: 'Create namespace "dev"', hint: 'kubectl create namespace dev', answer: 'kubectl create namespace dev', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'dev') },
    ],
  },
  {
    id: 'ckad-admission-auth',
    title: 'Authentication & Admission Control',
    category: 'App Config & Security',
    course: 'ckad',
    content: `
<h2>Authentication & Admission Control</h2>
<p>The CKAD covers how Kubernetes authenticates requests and how admission controllers validate and mutate them.</p>

<h3>Request Flow</h3>
<ol>
  <li><strong>Authentication</strong> — Who are you? (certificates, tokens, OIDC)</li>
  <li><strong>Authorization</strong> — Are you allowed? (RBAC, ABAC, Webhook)</li>
  <li><strong>Admission Control</strong> — Should this be modified or rejected? (Mutating → Validating webhooks)</li>
</ol>

<h3>Service Accounts</h3>
<pre><code># Create a service account
kubectl create serviceaccount app-sa

# Use in pod spec
spec:
  serviceAccountName: app-sa
  automountServiceAccountToken: false  # security best practice

# Bind permissions
kubectl create rolebinding app-binding --role=app-role --serviceaccount=default:app-sa</code></pre>

<h3>Common Admission Controllers</h3>
<ul>
  <li><strong>NamespaceLifecycle</strong> — Prevents operations in non-existent namespaces</li>
  <li><strong>LimitRanger</strong> — Enforces LimitRange defaults</li>
  <li><strong>ResourceQuota</strong> — Enforces resource quotas</li>
  <li><strong>PodSecurity</strong> — Enforces Pod Security Standards (replaced PodSecurityPolicy)</li>
</ul>

<h3>Pod Security Standards</h3>
<pre><code># Label a namespace to enforce security standards
kubectl label namespace prod pod-security.kubernetes.io/enforce=restricted
kubectl label namespace prod pod-security.kubernetes.io/warn=restricted</code></pre>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> Know the request flow (authn → authz → admission). Understand ServiceAccounts, RBAC bindings, and Pod Security Standards (privileged, baseline, restricted).
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl create serviceaccount app-sa
kubectl auth can-i get pods --as system:serviceaccount:default:app-sa</code></pre>
`,
    example: 'kubectl get serviceaccounts',
    challenges: [
      { id: 'ckad-auth-1', task: 'Create a service account "app-sa"', hint: 'kubectl create serviceaccount app-sa', answer: 'kubectl create serviceaccount app-sa', validate: (c) => c.resources.some(r => r.type === 'serviceaccount' && r.name === 'app-sa') },
    ],
  },

  // ── CKAD: NETWORKING ADDITIONS ──
  {
    id: 'ckad-networkpolicies',
    title: 'Network Policies',
    category: 'Services & Networking',
    course: 'ckad',
    content: `
<h2>Network Policies</h2>
<p>The CKAD expects a basic understanding of NetworkPolicies to control traffic between pods.</p>

<h3>Default Deny All Ingress</h3>
<pre><code>apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress</code></pre>

<h3>Allow Specific Ingress</h3>
<pre><code>apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          env: prod
    ports:
    - protocol: TCP
      port: 8080</code></pre>

<h3>Key Concepts</h3>
<ul>
  <li>No NetworkPolicy = all traffic allowed</li>
  <li>Once a policy selects a pod, only explicitly allowed traffic gets through</li>
  <li><code>podSelector: {}</code> selects all pods in the namespace</li>
  <li>Ingress = incoming traffic, Egress = outgoing traffic</li>
  <li>Multiple <code>from</code> entries are OR'd; items within a single <code>from</code> entry are AND'd</li>
</ul>

<div class="info-box">
  <strong>💡 CKAD Tip:</strong> The AND vs OR distinction in NetworkPolicy rules is a common exam trap. Separate <code>- from:</code> entries are OR'd. Multiple selectors within one <code>- from:</code> entry are AND'd.
</div>

<h3>🧪 Commands to Try</h3>
<pre><code>kubectl run api --image=nginx --labels=app=api
kubectl run frontend --image=nginx --labels=app=frontend
kubectl get pods --show-labels</code></pre>
`,
    example: 'kubectl get pods --show-labels',
    challenges: [
      { id: 'ckad-np-1', task: 'Create pod "api" with label app=api', hint: 'kubectl run api --image=nginx --labels=app=api', answer: 'kubectl run api --image=nginx --labels=app=api', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'api' && r.labels['app'] === 'api') },
      { id: 'ckad-np-2', task: 'Create pod "frontend" with label app=frontend', hint: 'kubectl run frontend --image=nginx --labels=app=frontend', answer: 'kubectl run frontend --image=nginx --labels=app=frontend', validate: (c) => c.resources.some(r => r.type === 'pod' && r.name === 'frontend' && r.labels['app'] === 'frontend') },
    ],
  },

  // ── CKAD LAB ──
  {
    id: 'ckad-lab-full',
    title: 'Lab: CKAD Practice Scenario',
    category: 'CKAD Labs',
    course: 'ckad',
    content: `
<h2>🧪 Lab: CKAD Practice Scenario</h2>
<p>This lab simulates a CKAD-style scenario focused on application development tasks.</p>

<h3>Scenario</h3>
<p>You're deploying a microservices application. Complete the following:</p>
<ol>
  <li>Create a namespace called <code>app-dev</code></li>
  <li>Create a configmap <code>api-config</code> with <code>API_URL=http://backend:8080</code></li>
  <li>Create a secret <code>api-secret</code> with <code>API_KEY=mysecretkey</code></li>
  <li>Deploy a backend with 3 replicas called <code>backend</code></li>
  <li>Expose backend as a ClusterIP service called <code>backend-svc</code> on port 80</li>
  <li>Create a job called <code>db-migrate</code> to run a migration</li>
</ol>
`,
    example: 'kubectl create namespace app-dev',
    challenges: [
      { id: 'ckad-lab-1', task: 'Create namespace "app-dev"', hint: 'kubectl create namespace app-dev', answer: 'kubectl create namespace app-dev', validate: (c) => c.resources.some(r => r.type === 'namespace' && r.name === 'app-dev') },
      { id: 'ckad-lab-2', task: 'Create configmap "api-config" with API_URL=http://backend:8080', hint: 'kubectl create configmap api-config --from-literal=API_URL=http://backend:8080', answer: 'kubectl create configmap api-config --from-literal=API_URL=http://backend:8080', validate: (c) => c.resources.some(r => r.type === 'configmap' && r.name === 'api-config') },
      { id: 'ckad-lab-3', task: 'Create secret "api-secret" with API_KEY=mysecretkey', hint: 'kubectl create secret generic api-secret --from-literal=API_KEY=mysecretkey', answer: 'kubectl create secret generic api-secret --from-literal=API_KEY=mysecretkey', validate: (c) => c.resources.some(r => r.type === 'secret' && r.name === 'api-secret') },
      { id: 'ckad-lab-4', task: 'Create deployment "backend" with 3 replicas', hint: 'kubectl create deployment backend --image=nginx --replicas=3', answer: 'kubectl create deployment backend --image=nginx --replicas=3', validate: (c) => c.resources.some(r => r.type === 'deployment' && r.name === 'backend') },
      { id: 'ckad-lab-5', task: 'Expose backend as "backend-svc" on port 80', hint: 'kubectl expose deployment backend --port=80 --name=backend-svc', answer: 'kubectl expose deployment backend --port=80 --name=backend-svc', validate: (c) => c.resources.some(r => r.type === 'service' && r.name === 'backend-svc') },
      { id: 'ckad-lab-6', task: 'Create job "db-migrate" using busybox', hint: 'kubectl create job db-migrate --image=busybox -- echo migrate', answer: 'kubectl create job db-migrate --image=busybox -- echo migrate', validate: (c) => c.resources.some(r => r.type === 'job' && r.name === 'db-migrate') },
    ],
  },
];
