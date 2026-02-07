import { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LessonContent from './components/LessonContent';
import InteractivePanel from './components/InteractivePanel';
import { lessons } from './lessons';
import type { UserProgress } from './types';

const STORAGE_KEY = 'k8s-academy-progress';

function loadProgress(): UserProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { completedLessons: [], currentLesson: lessons[0].id };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const currentLesson = lessons.find(l => l.id === progress.currentLesson) || lessons[0];
  const currentIdx = lessons.findIndex(l => l.id === currentLesson.id);

  // Vertical split: percentage of height for lesson content (top)
  const [topPercent, setTopPercent] = useState(55);
  const isDraggingV = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const updateProgress = useCallback((update: Partial<UserProgress>) => {
    setProgress(prev => {
      const next = { ...prev, ...update };
      saveProgress(next);
      return next;
    });
  }, []);

  const selectLesson = useCallback((id: string) => {
    updateProgress({ currentLesson: id });
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

  // Vertical drag handler
  const handleVDragStart = useCallback(() => {
    isDraggingV.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingV.current || !mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = Math.min(85, Math.max(15, (y / rect.height) * 100));
      setTopPercent(pct);
    };
    const onUp = () => {
      if (isDraggingV.current) {
        isDraggingV.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-950">
      <Sidebar
        currentLessonId={currentLesson.id}
        progress={progress}
        onSelectLesson={selectLesson}
      />
      <div ref={mainRef} className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Lesson content — top */}
        <div style={{ height: `${topPercent}%` }} className="overflow-y-auto min-h-0">
          <LessonContent
            lesson={currentLesson}
            isCompleted={progress.completedLessons.includes(currentLesson.id)}
            onMarkComplete={markComplete}
            onNext={goNext}
            onPrev={goPrev}
            hasNext={currentIdx < lessons.length - 1}
            hasPrev={currentIdx > 0}
          />
        </div>

        {/* Horizontal drag handle */}
        <div
          onMouseDown={handleVDragStart}
          className="h-1.5 bg-gray-800 hover:bg-indigo-500 cursor-row-resize flex-shrink-0 transition-colors"
          title="Drag to resize"
        />

        {/* Interactive panel — bottom */}
        <div style={{ height: `${100 - topPercent}%` }} className="min-h-0">
          <InteractivePanel lesson={currentLesson} />
        </div>
      </div>
    </div>
  );
}
