import { useState, useEffect, useRef } from 'react';
import type { Challenge } from '../types';
import type { ClusterState } from '../clusterState';

interface ChallengePanelProps {
  challenges: Challenge[];
  cluster: ClusterState;
  completedIds: Set<string>;
  onComplete: (id: string) => void;
}

export default function ChallengePanel({ challenges, cluster, completedIds, onComplete }: ChallengePanelProps) {
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [manuallyCompleted, setManuallyCompleted] = useState<Set<string>>(new Set());

  const toggleHint = (id: string) => {
    setShowHints(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Reset manual completions when challenges change (new lesson)
  const prevChallengeIds = useRef(challenges.map(c => c.id).join(','));
  useEffect(() => {
    const key = challenges.map(c => c.id).join(',');
    if (key !== prevChallengeIds.current) {
      prevChallengeIds.current = key;
      setManuallyCompleted(new Set());
    }
  }, [challenges]);

  // Check each challenge against current cluster state
  const results = challenges.map(ch => ({
    ...ch,
    passed: ch.validate(cluster),
    wasCompleted: completedIds.has(ch.id),
  }));

  // Auto-complete newly passing challenges in an effect, not during render
  useEffect(() => {
    for (const ch of challenges) {
      const passed = ch.validate(cluster);
      if (passed && !completedIds.has(ch.id)) {
        onComplete(ch.id);
      }
    }
  }, [cluster, challenges, completedIds, onComplete]);

  const allDone = results.every(r => r.passed || r.wasCompleted);

  return (
    <div className="mt-8 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-amber-400">
          🏆 Challenge — Now You Try!
        </h3>
        {allDone && (
          <span className="text-xs font-semibold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
            ✅ All Complete!
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Complete these tasks on your own using the terminal. No copy-pasting — prove you know it!
      </p>

      <div className="space-y-3">
        {results.map((ch, i) => {
          const isDone = ch.passed || ch.wasCompleted;
          return (
            <div
              key={ch.id}
              className={`p-3 rounded-lg border transition-colors ${
                isDone
                  ? 'border-green-500/40 bg-green-500/10'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg mt-0.5 ${isDone ? '' : 'grayscale opacity-50'}`}>
                  {isDone ? '✅' : `${i + 1}️⃣`}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDone ? 'text-green-300 line-through opacity-70' : 'text-gray-200'}`}>
                    {ch.task}
                  </p>
                  {!isDone && ch.hint && (
                    <button
                      onClick={() => toggleHint(ch.id)}
                      className="text-xs text-amber-500 hover:text-amber-400 mt-1 transition-colors"
                    >
                      {showHints.has(ch.id) ? '🙈 Hide hint' : '💡 Need a hint?'}
                    </button>
                  )}
                  {!isDone && showHints.has(ch.id) && ch.hint && (
                    <p className="text-xs text-amber-300/70 mt-1 italic">
                      Hint: {ch.hint}
                    </p>
                  )}
                  {isDone && (
                    <p className="text-xs text-green-500 mt-1">Verified ✓</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
