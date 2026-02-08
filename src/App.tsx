import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LessonContent from './components/LessonContent';
import InteractivePanel from './components/InteractivePanel';
import { lessons } from './lessons';
import { parseAndExecute } from './clusterState';
import type { ClusterState } from './clusterState';
import type { UserProgress } from './types';

const STORAGE_KEY = 'k8s-academy-progress';

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

function loadProgress(): UserProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completedLessons: parsed.completedLessons || [],
        completedChallenges: parsed.completedChallenges || [],
        currentLesson: parsed.currentLesson || lessons[0].id,
      };
    }
  } catch { /* ignore */ }
  return { completedLessons: [], completedChallenges: [], currentLesson: lessons[0].id };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [cluster, setCluster] = useState<ClusterState>(makeInitialCluster);
  const [activeTab, setActiveTab] = useState<'learn' | 'practice'>('learn');
  const currentLesson = lessons.find(l => l.id === progress.currentLesson) || lessons[0];
  const currentIdx = lessons.findIndex(l => l.id === currentLesson.id);

  useEffect(() => {
    setCluster(makeInitialCluster());
  }, [currentLesson.id]);

  const updateProgress = useCallback((update: Partial<UserProgress>) => {
    setProgress(prev => {
      const next = { ...prev, ...update };
      saveProgress(next);
      return next;
    });
  }, []);

  const selectLesson = useCallback((id: string) => {
    updateProgress({ currentLesson: id });
    setActiveTab('learn');
  }, [updateProgress]);

  const markComplete = useCallback(() => {
    const completed = progress.completedLessons.includes(currentLesson.id)
      ? progress.completedLessons.filter(id => id !== currentLesson.id)
      : [...progress.completedLessons, currentLesson.id];
    updateProgress({ completedLessons: completed });
  }, [progress, currentLesson, updateProgress]);

  const goNext = useCallback(() => {
    if (currentIdx < lessons.length - 1) selectLesson(lessons[currentIdx + 1].id);
  }, [currentIdx, selectLesson]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) selectLesson(lessons[currentIdx - 1].id);
  }, [currentIdx, selectLesson]);

  const handleCommand = useCallback((cmd: string) => {
    const { state: newState, result } = parseAndExecute(cluster, cmd);
    setCluster(newState);
    return result;
  }, [cluster]);

  const resetProgress = useCallback(() => {
    const fresh: UserProgress = { completedLessons: [], completedChallenges: [], currentLesson: lessons[0].id };
    setProgress(fresh);
    saveProgress(fresh);
    setCluster(makeInitialCluster());
    setActiveTab('learn');
  }, []);

  const hasPractice = !!currentLesson.example;
  const challengesDone = currentLesson.challenges
    ? currentLesson.challenges.filter(c => c.validate(cluster)).length
    : 0;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-950">
      <Sidebar
        currentLessonId={currentLesson.id}
        progress={progress}
        onSelectLesson={selectLesson}
        onResetProgress={resetProgress}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Tab bar */}
        <div className="flex items-center bg-gray-900 border-b border-gray-800 px-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'learn'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            📖 Learn
          </button>
          {hasPractice && (
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'practice'
                  ? 'border-green-500 text-green-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              🧪 Practice
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-600">{currentLesson.title}</span>
            {currentLesson.challenges && currentLesson.challenges.length > 0 && (
              <span className="text-xs text-amber-500">
                🏆 {challengesDone}/{currentLesson.challenges.length}
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'learn' ? (
            <LessonContent
              lesson={currentLesson}
              isCompleted={progress.completedLessons.includes(currentLesson.id)}
              onMarkComplete={markComplete}
              onNext={goNext}
              onPrev={goPrev}
              hasNext={currentIdx < lessons.length - 1}
              hasPrev={currentIdx > 0}
              cluster={cluster}
              onSwitchToPractice={() => setActiveTab('practice')}
            />
          ) : (
            <InteractivePanel lesson={currentLesson} cluster={cluster} onCommand={handleCommand} />
          )}
        </div>
      </div>
    </div>
  );
}
