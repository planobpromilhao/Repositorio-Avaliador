import React, { useEffect, useState } from 'react';
import { Gift, Coins, Sparkles, Trophy } from 'lucide-react';

interface RewardPopupProps {
  show: boolean;
  amount: number;
  totalCredits: number;
  onClose: () => void;
}

export const RewardPopup: React.FC<RewardPopupProps> = ({ 
  show, 
  amount, 
  totalCredits,
  onClose 
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setAnimate(true);
      
      // Tocar o arquivo de áudio reward-sound.mp3
      const playRewardSound = () => {
        try {
          const audio = new Audio('/src/components/reward-sound.mp3');
          audio.volume = 0.5; // Volume em 50%
          
          // Definir a duração do áudio para 1.8 segundos
          audio.addEventListener('loadedmetadata', () => {
            // Se o áudio for mais longo que 1.8s, cortar em 1.8s
            if (audio.duration > 1.8) {
              setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
              }, 1800);
            }
          });
          
          audio.play().catch(error => {
            console.log('Erro ao reproduzir áudio:', error);
          });
        } catch (error) {
          console.log('Erro ao carregar áudio:', error);
        }
      };

      playRewardSound();

      const timer = setTimeout(() => {
        onClose();
      }, 1800); // 1,8 segundos - mesmo tempo do áudio

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-2xl p-6 text-white text-center max-w-xs w-full transform transition-all duration-700 shadow-2xl ${
        animate ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-12'
      }`}>
        <div className="relative">
          {/* Confetes animados melhorados */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={`absolute animate-bounce`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                {i % 4 === 0 ? (
                  <Sparkles className="w-2 h-2 text-yellow-200" />
                ) : i % 4 === 1 ? (
                  <Coins className="w-2 h-2 text-yellow-300" />
                ) : i % 4 === 2 ? (
                  <div className="w-1 h-1 bg-yellow-300 rounded-full" />
                ) : (
                  <div className="w-1 h-1 bg-white rounded-full" />
                )}
              </div>
            ))}
          </div>

          {/* Ícone principal animado */}
          <div className="relative mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center animate-bounce border-2 border-white/30">
              <Trophy className="w-8 h-8 text-yellow-200" />
            </div>
            
            {/* Círculos de energia */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
            <div className="absolute inset-1 rounded-full border border-yellow-300/40 animate-pulse"></div>
          </div>

          {/* Título */}
          <h2 className="text-xl font-bold mb-3 animate-pulse">
            🎊 PARABÉNS! 🎊
          </h2>
          
          {/* Card de recompensa simplificado */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/30">
            <p className="text-sm font-semibold mb-2 text-yellow-100">Você ganhou:</p>
            
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Coins className="w-5 h-5 text-white animate-spin" />
                <div className="text-2xl font-bold text-white">
                  R$ {amount.toFixed(2)}
                </div>
                <Coins className="w-5 h-5 text-white animate-spin" style={{ animationDirection: 'reverse' }} />
              </div>
              <p className="text-white/90 text-xs font-medium">
                ✨ Créditos adicionados!
              </p>
            </div>
          </div>

          {/* Mensagem motivacional */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-2 border border-white/20">
            <p className="text-white/90 text-xs font-medium">
              🚀 Continue assim! Cada resposta te deixa mais perto do prêmio máximo!
            </p>
          </div>

          {/* Efeito de brilho */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse rounded-t-2xl"></div>
        </div>
      </div>
    </div>
  );
};