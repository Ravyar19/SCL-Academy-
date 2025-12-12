export enum UserRole {
  ENGINEER = 'Site Engineer',
  MANAGER = 'Manager',
  SME = 'SME'
}

export interface Area {
  id: string;
  name: string; // e.g. "München"
  code: string; // e.g. "MU1"
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  xp: number;
  streak: number;
  areaId?: string; // If null/undefined, user sees Public + their Area content
}

export type BlockType = 'heading' | 'subheading' | 'text' | 'image' | 'audio' | 'slides' | 'callout' | 'video';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Text content, image URL, or script for audio
  metadata?: any; // For slides data, audio base64, durations, loading states, etc.
}

export enum ModuleType {
  MIXED = 'mixed',
  QUIZ = 'quiz'
}

export interface Slide {
  title: string;
  bullets: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  type: ModuleType;
  duration: string;
  completed: boolean;
  blocks: ContentBlock[]; // Notion-like block list
}

export interface Chapter {
  id: string;
  title: string;
  modules: CourseModule[];
  sourceContent?: string; // The "Notebook" source material for this chapter
}

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  chapters: Chapter[];
  category: 'Sustainability' | 'Logistics' | 'Safety' | 'Compliance' | 'Innovation';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  areaId?: string; // If null, it is Public
  duration?: string;
}

export interface Podcast {
  id: string;
  title: string;
  duration: string;
  areaId?: string; // If null, it is Public
  audioData?: string; // Base64 or URL
  date: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AnalyticsData {
  name: string;
  value: number;
  fullMark: number;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  COURSES = 'courses',
  CREATE = 'create',
  ANALYTICS = 'analytics',
  PROFILE = 'profile',
  PODCAST = 'podcast'
}