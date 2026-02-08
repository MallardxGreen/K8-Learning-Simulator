import type { Lesson } from '../types';
import type { ClusterState } from '../clusterState';
import ChallengePanel from './ChallengePanel';

interface LessonContentProps {
  lesson: Lesson;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  cluster: ClusterState;
  onSwitchToPractice: () => void;
}

export default function LessonContent({
  lesson, isCompleted, onMarkComplete, onNext, onPrev, hasNext, hasPrev,
  cluster, onSwitchToPractice,
}: LessonContentProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full">
            {lesson.category}
          </span>
          {isCompleted && (
            <span className="text-xs font-semibold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">
              ✅ Completed
            </span>
          )}
        </div>

        <article
          className="lesson-content prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {lesson.example && (
          <div className="mt-8 p-5 bg-gray-800/80 rounded-xl border border-gray-700">
            <h3 className="text-sm font-semibold text-green-400 mb-3">🧪 Try It Yourself</h3>
            <p className="text-sm text-gray-400 mb-3">
              Switch to the Practice tab to use the terminal. Resources you create will appear in the live diagram.
            </p>
            <code className="block bg-gray-900 text-green-300 px-4 py-2 rounded-lg text-sm font-mono">
              {lesson.example}
            </code>
            {lesson.hint && (
              <p className="text-xs text-gray-500 mt-3 italic">💡 {lesson.hint}</p>
            )}
            <button
              onClick={onSwitchToPractice}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              Open Practice Terminal →
            </button>
          </div>
        )}

        {lesson.challenges && lesson.challenges.length > 0 && (
          <ChallengePanel
            challenges={lesson.challenges}
            cluster={cluster}
          />
        )}

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-800">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={onMarkComplete}
            className={`px-5 py-2 text-sm rounded-lg font-medium transition-colors ${
              isCompleted
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {isCompleted ? '✅ Completed' : 'Mark Complete'}
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
