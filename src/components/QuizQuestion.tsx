import React from 'react';
import { QuizQuestion as QuizQuestionType } from '../types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (answerId: string) => void;
  animate: boolean;
  rewardAmount: number;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  animate,
  rewardAmount
}) => {
  return (
    <div className={`transform transition-all duration-500 ${
      animate ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Pergunta otimizada para mobile */}
        <div className="p-4 sm:p-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center leading-relaxed">
              {question.question}
            </h2>
          </div>

          {/* Opções otimizadas para mobile */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onAnswer(option.id)}
                className="w-full p-4 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-red-50 border-2 border-gray-200 hover:border-orange-400 rounded-xl transition-all duration-300 transform active:scale-95 hover:shadow-lg group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                    {option.id}
                  </div>
                  <span className="font-medium text-gray-700 flex-1 text-sm sm:text-base">
                    {option.text}
                  </span>
                  {option.emoji && (
                    <span className="text-xl group-hover:animate-bounce flex-shrink-0">
                      {option.emoji}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Dica motivacional para mobile com valor dinâmico */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
            <p className="text-center text-green-700 font-medium text-sm">
              💡 Responda e garante R$ {rewardAmount.toFixed(2)}!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};