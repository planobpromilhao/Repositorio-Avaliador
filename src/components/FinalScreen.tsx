import React, { useState, useEffect } from 'react';
import { Trophy, Gift, DollarSign, Sparkles, ArrowRight, Wallet, Star, Zap, Crown, Clock } from 'lucide-react';
import { ShopeeFlashSale } from './ShopeeFlashSale';
import { PixWithdrawalPage } from './PixWithdrawalPage';

interface FinalScreenProps {
  totalCredits: number;
  userName?: string;
  userEmail?: string;
}

export const FinalScreen: React.FC<FinalScreenProps> = ({ totalCredits, userName, userEmail }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hora em segundos
  const [showShopeeFlashSale, setShowShopeeFlashSale] = useState(false);
  const [showPixWithdrawal, setShowPixWithdrawal] = useState(false);

  // Cronômetro regressivo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatar tempo para HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: number) => {
    setSelectedOption(option);
    
    // Simular redirecionamento ou ação
    setTimeout(() => {
      if (option === 1) {
        // Redirecionar para página de saque PIX
        setShowPixWithdrawal(true);
      } else {
        // Redirecionar para página da Shopee Flash Sale
        setShowShopeeFlashSale(true);
      }
    }, 1000);
  };

  const handleBackFromShopee = () => {
    setShowShopeeFlashSale(false);
  };

  const handleBackFromPixWithdrawal = () => {
    setShowPixWithdrawal(false);
  };

  if (showShopeeFlashSale) {
    return <ShopeeFlashSale onBack={handleBackFromShopee} totalCredits={totalCredits} />;
  }

  if (showPixWithdrawal) {
    return (
      <PixWithdrawalPage 
        onBack={handleBackFromPixWithdrawal} 
        totalCredits={totalCredits}
        userName={userName}
        userEmail={userEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
      {/* Header com carteira de saldo máximo - AUMENTADO */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="https://i.imgur.com/K0sHM7g.png" 
                alt="Logo" 
                className="w-28 h-11 sm:w-36 sm:h-14 object-contain"
              />
            </div>

            {/* Carteira com saldo máximo */}
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full px-3 py-2 sm:px-4 sm:py-2 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-white" />
                <span className="text-white text-sm sm:text-base font-bold">
                  R$ 659,77
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 py-6">
        <div className="max-w-sm w-full">
          {/* Celebração Principal - SEM BADGES DE CONQUISTA */}
          <div className="relative mb-6">
            {/* Fundo com gradiente e efeitos */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-3xl p-6 text-white text-center relative overflow-hidden shadow-2xl">
              {/* Efeitos de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              
              {/* Confetes flutuantes */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${10 + (i * 8)}%`,
                      top: `${10 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${2 + Math.random()}s`
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-200 opacity-70" />
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                {/* Ícone principal com coroa */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border-2 border-white/30">
                      <Trophy className="w-12 h-12 text-yellow-300" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Crown className="w-6 h-6 text-yellow-300 animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-black mb-2 tracking-wide">
                  🎉 PARABÉNS! 🎉
                </h1>
                <p className="text-sm opacity-90 mb-4 font-medium">
                  Você conquistou o prêmio máximo!
                </p>
                
                {/* Display do prêmio - SEM BADGES */}
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 mb-4 border border-white/20 shadow-inner">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="w-6 h-6 text-yellow-300 animate-spin" />
                    <div className="text-4xl font-black text-yellow-300 tracking-wider">
                      R$ {totalCredits.toFixed(2)}
                    </div>
                    <Star className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  <p className="text-white/90 text-sm font-bold">
                    ✨ CRÉDITOS GARANTIDOS ✨
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Título das opções */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-gray-800 mb-2">
              🎯 Escolha seu resgate:
            </h2>
            <p className="text-gray-600 text-sm">
              Aproveite seus créditos da melhor forma!
            </p>
          </div>

          {/* Opções de Resgate - PIX em primeiro lugar */}
          <div className="space-y-4 mb-6">
            {/* Opção 1 - Saque PIX (INSTANTÂNEO) */}
            <div
              className={`bg-white rounded-2xl shadow-xl cursor-pointer transform transition-all duration-300 border-4 overflow-hidden ${
                selectedOption === 1 
                  ? 'border-green-400 scale-105 shadow-2xl' 
                  : 'border-transparent hover:border-purple-200 active:scale-95'
              }`}
              onClick={() => handleOptionSelect(1)}
            >
              {/* Header da opção */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-6 h-6 text-white" />
                    <span className="text-white font-bold text-lg">Saque via PIX</span>
                  </div>
                  <div className="bg-white/20 rounded-full px-2 py-1">
                    <span className="text-white text-xs font-bold">INSTANTÂNEO</span>
                  </div>
                </div>
              </div>

              {/* Conteúdo da opção */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                      Retire <span className="font-black text-purple-600 text-base">R$ {totalCredits.toFixed(2)}</span> diretamente para sua conta bancária
                    </p>
                    
                    {/* Benefícios do PIX */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-600 font-medium">Transferência instantânea</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-600 font-medium">Disponível 24h por dia</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" />
                </div>
              </div>
            </div>

            {/* Opção 2 - Cupom Shopee */}
            <div
              className={`bg-white rounded-2xl shadow-xl cursor-pointer transform transition-all duration-300 border-4 overflow-hidden ${
                selectedOption === 2 
                  ? 'border-green-400 scale-105 shadow-2xl' 
                  : 'border-transparent hover:border-orange-200 active:scale-95'
              }`}
              onClick={() => handleOptionSelect(2)}
            >
              {/* Header da opção */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-6 h-6 text-white" />
                    <span className="text-white font-bold text-lg">Cupom Shopee</span>
                  </div>
                  <div className="bg-white/20 rounded-full px-2 py-1">
                    <span className="text-white text-xs font-bold">DESCONTO</span>
                  </div>
                </div>
              </div>

              {/* Conteúdo da opção */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                      Transforme seus <span className="font-black text-green-600 text-base">R$ {totalCredits.toFixed(2)}</span> creditos em um SUPER desconto na Shopee!
                    </p>
                    
                    {/* Benefícios */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600 font-medium">Desconto imediato no checkout</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600 font-medium">Entrega para todo Brasil</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Final com Cronômetro */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-4 text-center shadow-xl border-2 border-red-400">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="animate-pulse">⏰</div>
              <span className="font-black text-xs">SEUS CRÉDITOS EXPIRAM EM:</span>
              <div className="animate-pulse">⏰</div>
            </div>
            
            {/* Cronômetro Digital */}
            <div className="bg-black/20 rounded-xl p-3 mb-3 border border-white/20">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-300 animate-pulse" />
                <div className="text-2xl font-mono font-black text-yellow-300 tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <Clock className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Horas : Minutos : Segundos
              </p>
            </div>
            
            <p className="text-sm opacity-95 font-medium leading-relaxed">
              Aproveite agora! Esta promoção especial expira em breve e você perderá seus créditos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};