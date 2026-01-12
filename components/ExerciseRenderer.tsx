
import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseType } from '../types';
import { speakText } from '../services/geminiService';

interface Props {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
}

const ExerciseRenderer: React.FC<Props> = ({ exercise, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (exercise.type === ExerciseType.SCRAMBLED_SENTENCE) {
      // Prioritize provided options, fallback to splitting answer if necessary
      const words = (exercise.options && exercise.options.length > 0) 
        ? [...exercise.options] 
        : (exercise.targetSentence || exercise.answer).split(/\s+/).filter(Boolean);
      
      setScrambledWords([...words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
    setSelectedOption(null);
    setInputValue('');
  }, [exercise]);

  const handleSpeak = async () => {
    const textToSpeak = exercise.targetSentence || exercise.answer;
    if (!textToSpeak || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakText(textToSpeak);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSubmit = () => {
    let isCorrect = false;
    if (exercise.type === ExerciseType.MULTIPLE_CHOICE) {
      isCorrect = selectedOption === exercise.answer;
    } else if (exercise.type === ExerciseType.FILL_IN_BLANK || exercise.type === ExerciseType.TRANSLATION) {
      isCorrect = inputValue.trim().toLowerCase() === exercise.answer.toLowerCase();
    } else if (exercise.type === ExerciseType.SCRAMBLED_SENTENCE) {
      isCorrect = selectedWords.join(' ').trim() === exercise.answer.trim();
    }
    onAnswer(isCorrect);
  };

  const toggleWord = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    const newScrambled = [...scrambledWords];
    newScrambled.splice(index, 1);
    setScrambledWords(newScrambled);
  };

  const removeWord = (word: string, index: number) => {
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setScrambledWords([...scrambledWords, word]);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">{exercise.question}</h2>
        {(exercise.targetSentence || exercise.type === ExerciseType.SCRAMBLED_SENTENCE) && (
          <div className="flex items-center justify-center space-x-3">
            <button 
              onClick={handleSpeak}
              disabled={isSpeaking}
              className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-all active:scale-95 disabled:opacity-50"
              title="Listen to pronunciation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            {exercise.targetSentence && exercise.type !== ExerciseType.SCRAMBLED_SENTENCE && (
              <p className="text-2xl text-blue-900 font-medium">"{exercise.targetSentence}"</p>
            )}
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto">
        {exercise.type === ExerciseType.MULTIPLE_CHOICE && (
          <div className="grid grid-cols-1 gap-3">
            {exercise.options && exercise.options.length > 0 ? (
              exercise.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(option)}
                  className={`p-4 text-lg rounded-2xl border-2 transition-all text-left flex items-center space-x-4 ${
                    selectedOption === option
                      ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md font-bold'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-slate-700'
                  }`}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                    selectedOption === option ? 'border-blue-500 text-blue-600' : 'border-slate-300 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-tight">{option}</span>
                </button>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 italic">
                No options generated for this question.
              </div>
            )}
          </div>
        )}

        {(exercise.type === ExerciseType.FILL_IN_BLANK || exercise.type === ExerciseType.TRANSLATION) && (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-6 text-xl border-b-4 border-gray-100 focus:border-blue-500 focus:bg-blue-50/30 outline-none transition-all text-center rounded-t-2xl text-slate-800 font-medium"
            />
          </div>
        )}

        {exercise.type === ExerciseType.SCRAMBLED_SENTENCE && (
          <div className="space-y-10">
            <div className="min-h-[100px] p-6 border-2 border-dashed border-gray-200 rounded-3xl flex flex-wrap gap-2 justify-center items-center bg-gray-50/50">
              {selectedWords.map((word, idx) => (
                <button
                  key={`selected-${idx}`}
                  onClick={() => removeWord(word, idx)}
                  className="bg-white px-5 py-2.5 rounded-xl border-2 border-gray-200 shadow-sm text-lg text-slate-800 font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  {word}
                </button>
              ))}
              {selectedWords.length === 0 && <span className="text-gray-400 font-medium">Click words below to build the sentence</span>}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {scrambledWords.map((word, idx) => (
                <button
                  key={`scrambled-${idx}`}
                  onClick={() => toggleWord(word, idx)}
                  className="bg-white px-5 py-2.5 rounded-xl border-2 border-gray-200 shadow-md text-lg hover:border-blue-400 hover:-translate-y-1 active:translate-y-0 transition-all font-bold text-slate-700"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl px-16 py-4 rounded-2xl shadow-[0_5px_0_rgb(30,58,138)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
          disabled={exercise.type === ExerciseType.MULTIPLE_CHOICE ? !selectedOption : exercise.type === ExerciseType.SCRAMBLED_SENTENCE ? selectedWords.length === 0 : !inputValue}
        >
          Check Answer
        </button>
      </div>
    </div>
  );
};

export default ExerciseRenderer;
