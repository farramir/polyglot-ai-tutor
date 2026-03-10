export interface VocabularyItem {
  term: string;
  translation: string;
  pronunciation: string;
  example: string;
}

export interface IdiomItem {
  phrase: string;
  translation: string;
  pronunciation: string; // Added
  meaning: string;
  usage: string;
}

export interface GrammarPoint {
  conceptName: string; // Used for tracking history (e.g., "Present Perfect")
  explanation: string;
  examples: Array<{ target: string; translation: string; pronunciation: string }>; // Added pronunciation
}

export interface LessonContent {
  title: string;
  introduction: string;
  vocabulary: VocabularyItem[];
  idioms: IdiomItem[];
  grammar: GrammarPoint;
  practiceSentences: Array<{ target: string; translation: string; pronunciation: string }>; // Added pronunciation
  culturalNote?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Lesson {
  id: string;
  topic: string;
  content: LessonContent;
  timestamp: number;
  chatHistory: ChatMessage[];
}

export interface LanguageProfile {
  id: string;
  language: string; // e.g., "Spanish", "Japanese"
  createdAt: number;
  knownGrammarConcepts: string[];
  knownTopics: string[];
  lessons: Lesson[];
}

export interface AppState {
  profiles: LanguageProfile[];
  activeProfileId: string | null;
}