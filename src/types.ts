export interface Lesson {
  id: string;
  title: string;
  category: string;
  content: string;        // markdown-ish HTML content
  example?: string;       // example kubectl command(s)
  expectedCommands?: string[]; // commands user should try
  hint?: string;
  diagram?: DiagramNode[];
}

export interface DiagramNode {
  id: string;
  label: string;
  type: string;
  icon: string;
  color: string;
  children?: string[];    // ids of connected nodes
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
}

export interface UserProgress {
  completedLessons: string[];
  currentLesson: string;
}
