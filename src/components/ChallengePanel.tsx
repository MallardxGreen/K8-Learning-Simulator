import { useState } from 'react';
import type { Challenge } from '../types';
import type { ClusterState } from '../clusterState';

interface ChallengePanelProps {
  challenges: Challenge[];
  cluster: ClusterState;
  completedIds: Set<string>;
}

export default function ChallengePanel({ challenges, cluster, completedIds }: ChallengePanelProps) {
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());

  const toggleHint = (id: string) => {
    setShowHints(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAnswer = (id: string) => {
    setShowAnswers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const results = challenges.map(ch => ({
    ...ch,
    passed: ch.validate(cluster),
    wasCompleted: completedIds.has(ch.id),
  }));

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
                  {!isDone && (
                    <div className="flex items-center gap-3 mt-1">
                      {ch.hint && (
                        <button
                          onClick={() => toggleHint(ch.id)}
                          className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          {showHints.has(ch.id) ? '🙈 Hide hint' : '💡 Hint'}
                        </button>
                      )}
                      {ch.answer && (
                        <button
                          onClick={() => toggleAnswer(ch.id)}
                          className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          {showAnswers.has(ch.id) ? '🙈 Hide answer' : '📝 Show Answer'}
                        </button>
                      )}
                    </div>
                  )}
                  {!isDone && showHints.has(ch.id) && ch.hint && (
                    <p className="text-xs text-amber-300/70 mt-1 italic">
                      Hint: {ch.hint}
                    </p>
                  )}
                  {!isDone && showAnswers.has(ch.id) && ch.answer && (
                    <div className="mt-1.5">
                      {ch.answer.split('\n').map((line, j) => (
                        <code key={j} className="block text-xs text-blue-300 bg-gray-900 px-2 py-1 rounded font-mono mt-0.5">
                          {line}
                        </code>
                      ))}
                    </div>
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
