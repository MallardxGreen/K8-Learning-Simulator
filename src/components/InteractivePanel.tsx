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
  const [showGuide, setShowGuide] = useState(true);
  const [visibleHints, setVisibleHints] = useState<Set<string>>(new Set());
  const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());
  const isDragging = useRef(false);

  const toggleHint = (id: string) => {
    setVisibleHints(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAnswer = (id: string) => {
    setVisibleAnswers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
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

  const hasChallenges = lesson.challenges && lesson.challenges.length > 0;
  const challengesDone = hasChallenges
    ? lesson.challenges!.filter(c => c.validate(cluster)).length
    : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Collapsible guide bar */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800">
        <button
          onClick={() => setShowGuide(g => !g)}
          className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">{showGuide ? '▼' : '▶'}</span>
            <span className="text-sm font-medium text-gray-300">📋 {lesson.title} — Quick Reference</span>
          </div>
          <div className="flex items-center gap-3">
            {lesson.example && (
              <span className="text-xs text-gray-500 font-mono">{lesson.example}</span>
            )}
            {hasChallenges && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                challengesDone === lesson.challenges!.length
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                🏆 {challengesDone}/{lesson.challenges!.length}
              </span>
            )}
          </div>
        </button>

        {showGuide && (
          <div className="px-4 pb-3 max-h-48 overflow-y-auto">
            <div className="flex gap-4">
              {/* Commands to try */}
              {lesson.expectedCommands && lesson.expectedCommands.length > 0 && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-400 mb-1.5">🧪 Commands to Try</p>
                  <div className="space-y-1">
                    {lesson.expectedCommands.map((cmd, i) => (
                      <code key={i} className="block text-xs text-green-300/80 bg-gray-800 px-2 py-1 rounded font-mono truncate">
                        {cmd}
                      </code>
                    ))}
                  </div>
                  {lesson.hint && (
                    <p className="text-xs text-gray-500 mt-1.5 italic">💡 {lesson.hint}</p>
                  )}
                </div>
              )}

              {/* Example command if no expectedCommands */}
              {!lesson.expectedCommands?.length && lesson.example && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-400 mb-1.5">🧪 Try This</p>
                  <code className="block text-xs text-green-300/80 bg-gray-800 px-2 py-1 rounded font-mono">
                    {lesson.example}
                  </code>
                  {lesson.hint && (
                    <p className="text-xs text-gray-500 mt-1.5 italic">💡 {lesson.hint}</p>
                  )}
                </div>
              )}

              {/* Challenges */}
              {hasChallenges && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-400 mb-1.5">🏆 Challenges</p>
                  <div className="space-y-1.5">
                    {lesson.challenges!.map(ch => {
                      const done = ch.validate(cluster);
                      return (
                        <div key={ch.id}>
                          <div className="flex items-start gap-1.5">
                            <span className="text-xs mt-0.5">{done ? '✅' : '⬜'}</span>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs ${done ? 'text-green-400/70 line-through' : 'text-gray-400'}`}>
                                {ch.task}
                              </span>
                              {!done && (
                                <span className="inline-flex gap-2 ml-2">
                                  {ch.hint && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleHint(ch.id); }}
                                      className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                                    >
                                      {visibleHints.has(ch.id) ? '🙈' : '💡 Hint'}
                                    </button>
                                  )}
                                  {ch.answer && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleAnswer(ch.id); }}
                                      className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                                    >
                                      {visibleAnswers.has(ch.id) ? '🙈' : '📝 Answer'}
                                    </button>
                                  )}
                                </span>
                              )}
                              {!done && visibleHints.has(ch.id) && ch.hint && (
                                <p className="text-xs text-amber-300/70 mt-0.5 italic">
                                  {ch.hint}
                                </p>
                              )}
                              {!done && visibleAnswers.has(ch.id) && ch.answer && (
                                <div className="mt-0.5">
                                  {ch.answer.split('\n').map((line, j) => (
                                    <code key={j} className="block text-xs text-blue-300 bg-gray-800 px-2 py-0.5 rounded font-mono mt-0.5">
                                      {line}
                                    </code>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Terminal + Diagram split */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">
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
    </div>
  );
}
