# K8s Academy

An interactive, browser-based Kubernetes learning platform for KCNA, CKA, and CKAD certification prep.

![K8s Academy Screenshot](./docs/screenshot.png)

## What is this?

K8s Academy is a hands-on Kubernetes study tool that runs entirely in your browser. It features a simulated kubectl terminal, a live cluster diagram, and challenges that validate against simulated cluster state — no real cluster required.

## Features

- **Three certification tracks** — KCNA, CKA, and CKAD, each aligned to official exam domains
- **Simulated kubectl terminal** — Run commands like `kubectl create deployment`, `kubectl get pods`, `kubectl expose`, and more against an in-memory cluster
- **Live cluster visualization** — SVG diagram updates in real time as you create and modify resources
- **Hands-on labs** — 10 labs per CKA/CKAD track with guided challenges and validation
- **Progress tracking** — Completed lessons and challenges saved to localStorage

## Getting Started

```sh
git clone https://github.com/MallardxGreen/K8-Learning-Simulator.git
cd K8-Learning-Simulator/k8s-simulator
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4

## License

MIT
