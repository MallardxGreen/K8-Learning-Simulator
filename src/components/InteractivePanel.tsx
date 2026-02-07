import { useState, useCallback, useRef, useEffect } from 'react';
import TryItTerminal from './TryItTerminal';
import LiveDiagram from './LiveDiagram';
import { parseAndExecute } from '../clusterState';
import type { ClusterState } from '../clusterState';
import type { Lesson } from '../types';

interface InteractivePanelProps {
  lesson: Lesson;
}

function makeInitialCluster(): ClusterState {
  return {
    resources: [
      { id: 'ns-default', type: 'namespace', name: 'default', namespace: '', labels: {}, metadata: {}, createdAt: Date.now() },
      { id: 'ns-kube-system', type: 'namespace', name: 'kube-system', namespace: '', labels: {}, metadata: {}, createdAt: Date.now() },
      { id: 'node-1', type: 'node', name: 'node-1', namespace: '', labels: { role: 'worker' }, metadata: { status: 'Ready' }, createdAt: Date.now() },
      { id: 'node-2', type: 'node', name: 'node-2', namespace: '', labels: { role: 'worker' }, metadata: { status: 'Ready' }, createdAt: Date.now() },
    ],
  };
}

export default function InteractivePanel({ lesson }: InteractivePanelProps) {
  const [cluster, setCluster] = useState<ClusterState>(makeInitialCluster);
  const [splitPercent, setSplitPercent] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset cluster when lesson changes
  useEffect(() => {
    setCluster(makeInitialCluster());
  }, [lesson.id]);

  const handleCommand = useCallback((cmd: string) => {
    const { state: newState, result } = parseAndExecute(cluster, cmd);
    setCluster(newState);
    return result;
  }, [cluster]);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(80, Math.max(20, (x / rect.width) * 100));
      setSplitPercent(pct);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full flex overflow-hidden border-t border-gray-800">
      {/* Terminal side */}
      <div style={{ width: `${splitPercent}%` }} className="h-full min-w-0">
        <TryItTerminal lesson={lesson} onCommand={handleCommand} />
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1.5 bg-gray-800 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors"
        title="Drag to resize"
      />

      {/* Diagram side */}
      <div style={{ width: `${100 - splitPercent}%` }} className="h-full min-w-0">
        <LiveDiagram cluster={cluster} />
      </div>
    </div>
  );
}
