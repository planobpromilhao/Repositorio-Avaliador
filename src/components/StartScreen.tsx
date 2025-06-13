import React from 'react';
import { Play, User } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  userName?: string;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, userName }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header com Logo */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
            <div className="mb-4">
              <img 
                src="https://i.imgur.com/K0sHM7g.png" 
                alt="Logo" 
                className="w-32 h-12 object-contain mx-auto"
              />
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">
              Quiz Premiado
            </h1>
            <p className="text-white/90 text-sm">
              Responda 10 perguntas e ganhe créditos
            </p>
          </div>

          {/* Saudação Personalizada */}
          {userName && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200">
              <div className="flex items-center justify-center space-x-2">
                <User className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium text-sm">
                  Olá, {userName}! Pronto para começar?
                </span>
              </div>
            </div>
          )}

          {/* Prêmio */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-white font-bold">🏆 PRÊMIO MÁXIMO</span>
              </div>
              <div className="text-2xl font-bold text-white">
                R$ 659,77
              </div>
              <p className="text-white/90 text-sm">
                em créditos garantidos
              </p>
            </div>

            {/* Como funciona */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 text-center mb-4">
                Como Funciona
              </h2>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <span className="text-gray-700 text-sm">10 perguntas rápidas</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <span className="text-gray-700 text-sm">Ganhe créditos a cada resposta</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <span className="text-gray-700 text-sm">Resgate via PIX ou cupom</span>
                </div>
              </div>
            </div>

            {/* Botão */}
            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transform active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>COMEÇAR AGORA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};