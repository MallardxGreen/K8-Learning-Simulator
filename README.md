# K8s Learning Simulator ☸️

An interactive, browser-based Kubernetes learning environment. Practice real `kubectl` commands against a simulated cluster — no cloud account, no Docker, no setup required.

Built to help people learn Kubernetes hands-on, from fundamentals through KCNA exam prep.

## What It Does

- **Simulated cluster** — a fully in-browser K8s cluster with nodes, namespaces, pods, deployments, services, and more
- **Interactive terminal** — type real `kubectl` commands and see realistic output
- **Structured lessons** — progressive curriculum covering K8s fundamentals, architecture, workloads, networking, storage, security, and observability
- **Hands-on challenges** — each lesson includes validation-based challenges that check your actual cluster state
- **Live diagrams** — visual representation of your cluster as you build it
- **Progress tracking** — pick up where you left off with localStorage-based progress

## Tech Stack

- **React 19** + **TypeScript** — type-safe component architecture
- **Vite** — fast dev server and build tooling
- **Tailwind CSS 4** — utility-first styling
- **Custom K8s engine** — full command parser and cluster state machine (`clusterState.ts`) that handles 50+ kubectl operations including resource creation, scaling, labeling, context switching, and more

## Project Structure

```
src/
├── App.tsx                  # Main app layout and state management
├── clusterState.ts          # K8s cluster simulation engine (command parser + state machine)
├── lessons.ts               # Full lesson curriculum with challenges
├── types.ts                 # TypeScript interfaces
└── components/
    ├── Sidebar.tsx           # Lesson navigation and progress
    ├── LessonContent.tsx     # Lesson display with markdown rendering
    ├── InteractivePanel.tsx  # Practice panel with terminal + diagram tabs
    ├── TryItTerminal.tsx     # Interactive kubectl terminal
    ├── ChallengePanel.tsx    # Challenge validation UI
    └── LiveDiagram.tsx       # Real-time cluster visualization
```

## Getting Started

```bash
git clone https://github.com/MallardxGreen/K8-Learning-Simulator.git
cd K8-Learning-Simulator
npm install
npm run dev
```

Open `http://localhost:5173` and start learning.

## Supported Commands

The simulator handles a wide range of kubectl operations:

- `kubectl get [resource]` — list resources with filtering and namespace support
- `kubectl create` — namespaces, deployments, services, configmaps, secrets, and more
- `kubectl run` — create pods with image specification
- `kubectl apply -f` — YAML-based resource creation
- `kubectl delete` — remove resources
- `kubectl describe` — detailed resource information
- `kubectl scale` — adjust replica counts
- `kubectl label` / `kubectl annotate` — metadata management
- `kubectl config` — context switching between clusters
- `etcdctl` — simulated etcd operations
- And more: `logs`, `exec`, `port-forward`, `top`, `cordon/uncordon`, `taint`

## Why I Built This

I'm an AWS Solutions Architect with a background in cloud support engineering. Kubernetes is a core skill in the cloud native space, and I wanted a way to practice and teach K8s concepts without needing a full cluster running. This simulator lets anyone jump in and start learning immediately.

## License

MIT
