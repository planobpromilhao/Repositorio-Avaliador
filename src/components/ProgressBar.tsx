import React from 'react';
import { Star } from 'lucide-react';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  totalCredits: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
  totalCredits
}) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const remainingCredits = 659.77 - totalCredits;

  return (
    <div className="space-y-3 mb-4">
      {/* Carteira de Saldo - Compacta para Mobile */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-4 relative overflow-hidden shadow-xl border border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-yellow-500/5"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full p-1.5">
                <Star className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-300 text-xs font-medium">Seu Saldo</span>
            </div>
            
            <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          </div>

          <div className="text-white text-2xl font-bold mb-3">
            R${totalCredits.toFixed(2)}
          </div>

          <div className="border-t border-dashed border-gray-600 my-3"></div>

          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-orange-400 text-sm font-bold leading-tight">
              Fantástico! Você ainda tem R$ {remainingCredits.toFixed(2)} a serem resgatados!
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Continue respondendo para acumular mais
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Progresso Mobile-First */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-1.5">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-800">
              Seu Progresso
            </span>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-3 py-1 border border-orange-300">
            <span className="text-orange-600 font-bold text-sm">
              {currentQuestion}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Barra de progresso compacta */}
        <div className="relative mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-md"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Marcadores compactos */}
        <div className="flex justify-between">
          {[...Array(totalQuestions)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < currentQuestion 
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 shadow-sm' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};