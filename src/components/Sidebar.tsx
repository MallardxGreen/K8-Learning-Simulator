import { getLessonsByCategory } from '../lessons';
import type { UserProgress } from '../types';

interface SidebarProps {
  currentLessonId: string;
  progress: UserProgress;
  onSelectLesson: (id: string) => void;
  onResetProgress: () => void;
}

const categoryIcons: Record<string, string> = {
  'Kubernetes Fundamentals': '☸️',
  'Container Orchestration': '🔄',
  'Cloud Native App Delivery': '🚢',
  'Cloud Native Architecture': '☁️',
  'Interview Labs': '🎯',
};

export default function Sidebar({ currentLessonId, progress, onSelectLesson, onResetProgress }: SidebarProps) {
  const grouped = getLessonsByCategory();

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☸️</span>
          <div>
            <h1 className="text-base font-bold text-white">K8s Academy</h1>
            <p className="text-xs text-gray-500">KCNA Study Guide</p>
          </div>
        </div>
        <div className="mt-3 bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(progress.completedLessons.length / Object.values(grouped).flat().length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progress.completedLessons.length} / {Object.values(grouped).flat().length} completed
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hidden py-2">
        {Object.entries(grouped).map(([category, catLessons]) => (
          <div key={category} className="mb-1">
            <div className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {categoryIcons[category] || '📄'} {category}
            </div>
            {catLessons.map(lesson => {
              const isActive = lesson.id === currentLessonId;
              const isCompleted = progress.completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  className={`w-full text-left px-5 py-2 text-sm flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border-r-2 border-indigo-500'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <span className="text-xs">
                    {isCompleted ? '✅' : isActive ? '▶️' : '○'}
                  </span>
                  {lesson.title}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <button
          onClick={() => {
            if (window.confirm('Reset all progress? This clears completed lessons, challenges, and starts you back at the beginning.')) {
              onResetProgress();
            }
          }}
          className="w-full px-3 py-2 text-xs text-gray-500 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-gray-300 transition-colors"
        >
          🔄 Reset All Progress
        </button>
      </div>
    </aside>
  );
}
