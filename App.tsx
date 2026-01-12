
import React, { useState } from 'react';
import { GrammarTopic, Difficulty, Exercise, SessionState } from './types';
import { GRAMMAR_TOPICS } from './constants';
import ExerciseRenderer from './components/ExerciseRenderer';
import { generateExercises } from './services/geminiService';

const App: React.FC = () => {
  const [session, setSession] = useState<SessionState>({
    topic: null,
    difficulty: null,
    exercises: [],
    currentIndex: 0,
    score: 0,
    isComplete: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const selectTopic = (topic: GrammarTopic) => {
    setSession(prev => ({ ...prev, topic }));
    setError(null);
  };

  const startPractice = async (level: Difficulty) => {
    if (!session.topic) return;
    setLoading(true);
    setError(null);
    try {
      const generated = await generateExercises(session.topic, level);
      setSession(prev => ({
        ...prev,
        difficulty: level,
        exercises: generated,
        currentIndex: 0,
        score: 0,
        isComplete: false,
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "We encountered a hiccup while crafting your English module. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    const currentEx = session.exercises[session.currentIndex];
    setFeedback({
      isCorrect,
      message: isCorrect ? "Excellent English!" : `Keep learning! The answer is: ${currentEx.answer}`
    });
    if (isCorrect) {
      setSession(prev => ({ ...prev, score: prev.score + 1 }));
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (session.currentIndex + 1 < session.exercises.length) {
      setSession(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      setSession(prev => ({ ...prev, isComplete: true }));
    }
  };

  const restart = () => {
    setSession({
      topic: null,
      difficulty: null,
      exercises: [],
      currentIndex: 0,
      score: 0,
      isComplete: false,
    });
    setFeedback(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 uppercase text-xs">AI</div>
        </div>
        <p className="mt-8 text-2xl font-black text-slate-800 tracking-tight">Generating your English module...</p>
        <p className="text-slate-500 mt-2">Consulting Oxford & Cambridge standards</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white rounded-[2.5rem] p-12 max-w-lg w-full shadow-2xl text-center space-y-8 border-b-8 border-rose-200 animate-in zoom-in duration-300">
          <div className="text-6xl animate-bounce">🔌</div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Connection Problem</h1>
          <p className="text-lg text-slate-500 font-medium">
            {error}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => session.difficulty && startPractice(session.difficulty)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-[0_5px_0_rgb(30,58,138)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
            >
              Try Again
            </button>
            <button
              onClick={restart}
              className="w-full text-slate-400 font-black hover:text-slate-600 uppercase tracking-widest text-sm py-2 transition-colors"
            >
              Go Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session.isComplete) {
    const percentage = Math.round((session.score / session.exercises.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white rounded-[2rem] p-12 max-w-md w-full shadow-2xl text-center space-y-8 border-b-8 border-blue-200">
          <div className="text-6xl">🎓</div>
          <h1 className="text-4xl font-black text-slate-900">Module Mastery</h1>
          <div className="flex justify-center">
            <div className="text-7xl font-black text-blue-600">{percentage}%</div>
          </div>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            You've mastered <span className="text-slate-900 font-bold">{session.score}</span> patterns in <span className="text-blue-600 font-bold">{session.topic?.name}</span>.
          </p>
          <button
            onClick={restart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-[0_5px_0_rgb(30,58,138)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            Choose New Topic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-['Nunito']">
      {/* Navbar */}
      <header className="bg-white border-b-2 border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button onClick={restart} className="flex items-center space-x-3 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">GrammarFlow</span>
        </button>
        
        {session.difficulty && (
          <div className="flex items-center space-x-6 flex-1 max-w-2xl mx-12">
            <div className="h-4 bg-slate-100 rounded-full flex-1 overflow-hidden border border-slate-200 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out" 
                style={{ width: `${((session.currentIndex + 1) / session.exercises.length) * 100}%` }}
              ></div>
            </div>
            <span className="font-black text-slate-400 font-mono">{session.currentIndex + 1}/{session.exercises.length}</span>
          </div>
        )}

        <div className="hidden md:flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl font-black border-2 border-blue-100">
           <span className="text-sm">LVL</span>
           <span>{session.difficulty || '0'}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pt-16 px-6">
        {!session.topic ? (
          <div className="space-y-16 animate-in slide-in-from-bottom-10 duration-700">
            <div className="text-center space-y-6">
              <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">What shall we <span className="text-blue-600">perfect</span> today?</h1>
              <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto">Select a module to begin your journey toward native-level English fluency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {GRAMMAR_TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => selectTopic(topic)}
                  className="group relative bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-2xl hover:-translate-y-2 text-left"
                >
                  <div className={`w-16 h-16 rounded-3xl ${topic.color} flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {topic.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{topic.name}</h3>
                  <p className="text-slate-500 font-bold leading-snug">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : !session.difficulty ? (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-black text-sm uppercase tracking-widest mb-4">Topic Selected</div>
              <h2 className="text-5xl font-black text-slate-900">{session.topic.name}</h2>
              <p className="text-xl text-slate-500 font-medium">Choose a level that challenges you.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map(level => (
                <button
                  key={level}
                  onClick={() => startPractice(level)}
                  className="p-8 bg-white border-2 border-slate-200 rounded-3xl hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="text-left">
                    <span className="block text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors uppercase italic">{level}</span>
                    <span className="text-slate-500 font-bold">
                      {level === Difficulty.BEGINNER ? 'Fundamentals & common rules' : 
                       level === Difficulty.INTERMEDIATE ? 'Complexity & nuance' : 
                       'Advanced exceptions & formal styles'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-xl font-black">→</div>
                </button>
              ))}
            </div>
            <button onClick={() => setSession(prev => ({ ...prev, topic: null }))} className="w-full text-slate-400 font-black hover:text-slate-600 uppercase tracking-widest text-sm py-4">← Back to topics</button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="bg-white rounded-[3rem] border-2 border-slate-200 p-10 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${session.topic.color}`}></div>
                <ExerciseRenderer 
                  exercise={session.exercises[session.currentIndex]} 
                  onAnswer={handleAnswer} 
                />
             </div>
          </div>
        )}
      </main>

      {/* Feedback Overlay */}
      {feedback && (
        <div className={`fixed bottom-0 left-0 w-full p-10 border-t-4 transition-all transform animate-in slide-in-from-bottom duration-500 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] ${
          feedback.isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'
        }`}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-8">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg ${
                feedback.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {feedback.isCorrect ? '✨' : '🧐'}
              </div>
              <div className="space-y-1">
                <h3 className={`text-3xl font-black tracking-tight ${feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {feedback.isCorrect ? 'Splendid!' : 'Not quite right'}
                </h3>
                <p className={`text-xl font-bold opacity-80 ${feedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {feedback.message}
                </p>
                {!feedback.isCorrect && (
                   <div className="mt-4 p-4 bg-rose-100/50 rounded-2xl border-l-4 border-rose-300">
                      <p className="text-rose-900 font-bold italic">Rule: {session.exercises[session.currentIndex].explanation}</p>
                   </div>
                )}
                {feedback.isCorrect && (
                   <p className="text-emerald-700 font-medium italic mt-2 opacity-70 italic">"{session.exercises[session.currentIndex].explanation}"</p>
                )}
              </div>
            </div>
            <button
              onClick={nextQuestion}
              className={`min-w-[240px] py-5 rounded-[1.5rem] font-black text-2xl text-white shadow-xl transition-all active:scale-95 uppercase tracking-widest ${
                feedback.isCorrect 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/40' 
                  : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/40'
              }`}
            >
              Continue Masterclass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
