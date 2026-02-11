import type { ClusterState } from './clusterState';

export interface Challenge {
  id: string;
  task: string;           // what to display: "Create a namespace called production"
  hint?: string;          // optional hint if they're stuck
  answer?: string;        // the exact command to complete the challenge
  validate: (cluster: ClusterState) => boolean;  // check cluster state
}

export type CourseId = 'kcna' | 'cka' | 'ckad';

export interface CourseInfo {
  id: CourseId;
  name: string;
  subtitle: string;
  icon: string;
}

export const courses: CourseInfo[] = [
  { id: 'kcna', name: 'KCNA', subtitle: 'Cloud Native Associate', icon: '☸️' },
  { id: 'cka', name: 'CKA', subtitle: 'Certified K8s Admin', icon: '🛠️' },
  { id: 'ckad', name: 'CKAD', subtitle: 'App Developer', icon: '💻' },
];

export interface Lesson {
  id: string;
  title: string;
  category: string;
  course: CourseId;
  content: string;
  example?: string;
  expectedCommands?: string[];
  hint?: string;
  challenges?: Challenge[];
  diagram?: DiagramNode[];
}

export interface DiagramNode {
  id: string;
  label: string;
  type: string;
  icon: string;
  color: string;
  children?: string[];
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
}

export interface UserProgress {
  completedLessons: string[];
  completedChallenges: string[];
  currentLesson: string;
  currentCourse: CourseId;
}
