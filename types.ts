
export enum ExerciseType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  SCRAMBLED_SENTENCE = 'SCRAMBLED_SENTENCE',
  TRANSLATION = 'TRANSLATION'
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  targetSentence?: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface GrammarTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface SessionState {
  topic: GrammarTopic | null;
  difficulty: Difficulty | null;
  exercises: Exercise[];
  currentIndex: number;
  score: number;
  isComplete: boolean;
}
