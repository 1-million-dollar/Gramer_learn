
import { GrammarTopic } from './types';

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  { id: 'tenses', name: 'Verb Tenses', icon: '⏳', description: 'Past, Present, and Future mastery', color: 'bg-blue-600' },
  { id: 'articles', name: 'Articles & Nouns', icon: '📝', description: 'A, An, The and countables', color: 'bg-indigo-600' },
  { id: 'conditionals', name: 'Conditionals', icon: '🔀', description: 'If-clauses and possibilities', color: 'bg-purple-600' },
  { id: 'prepositions', name: 'Prepositions', icon: '📍', description: 'Time, Place, and Movement', color: 'bg-cyan-600' },
  { id: 'modals', name: 'Modal Verbs', icon: '✨', description: 'Can, Should, Must, Might', color: 'bg-teal-600' },
  { id: 'phrasal', name: 'Phrasal Verbs', icon: '🔗', description: 'Common idiomatic combinations', color: 'bg-emerald-600' },
];

export const APP_NAME = "GrammarFlow";
