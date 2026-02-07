import { useState, useCallback, useRef, useEffect } from 'react';
import TryItTerminal from './TryItTerminal';
import LiveDiagram from './LiveDiagram';
import type { ClusterState } from '../clusterState';
import type { Lesson } from '../types';

interface InteractivePanelProps {
  lesson: Lesson;
  cluster: ClusterState;
  onCommand: (cmd: string) => { success: boolean; message: string };
}

export default function InteractivePanel({ lesson, cluster, onCommand }: InteractivePanelProps) {
  const [splitPercent, setSplitPercent] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div style={{ width: `${splitPercent}%` }} className="h-full min-w-0">
        <TryItTerminal lesson={lesson} onCommand={onCommand} />
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-1.5 bg-gray-800 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors"
        title="Drag to resize"
      />
      <div style={{ width: `${100 - splitPercent}%` }} className="h-full min-w-0">
        <LiveDiagram cluster={cluster} />
      </div>
    </div>
  );
}
