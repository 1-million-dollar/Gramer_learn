
import React from 'react';
import { GrammarTopic } from '../types';

interface Props {
  topic: GrammarTopic;
  onSelect: (topic: GrammarTopic) => void;
}

const LanguageCard: React.FC<Props> = ({ topic, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(topic)}
      className={`relative overflow-hidden group p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-left`}
    >
      <div className="flex flex-col items-center space-y-4">
        <span className="text-6xl transform group-hover:scale-110 transition-transform">{topic.icon}</span>
        <span className="text-xl font-bold text-gray-700">{topic.name}</span>
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-1 ${topic.color}`}></div>
    </button>
  );
};

export default LanguageCard;
