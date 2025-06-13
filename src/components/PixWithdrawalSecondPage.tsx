import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, DollarSign, Minus, Plus, Wallet } from 'lucide-react';
import { PixWithdrawalThirdPage } from './PixWithdrawalThirdPage';

interface PixWithdrawalSecondPageProps {
  onBack: () => void;
  onFinish: () => void;
  totalCredits: number;
  userName?: string;
  userEmail?: string;
  pixKey: string;
}

export const PixWithdrawalSecondPage: React.FC<PixWithdrawalSecondPageProps> = ({
  onBack,
  onFinish,
  totalCredits,
  userName = '',
  userEmail = '',
  pixKey
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>(null);
  const [showThirdPage, setShowThirdPage] = useState(false);

  // Função para extrair e formatar o nome do usuário
  const getDisplayName = (name: string): string => {
    if (!name) return 'Usuário';
    
    // Se é um nome completo, extrair apenas o primeiro nome
    const firstName = name.trim().split(' ')[0];
    
    // Capitalizar primeira letra
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const displayName = userName ? getDisplayName(userName) : 'Usuário';

  const handleWithdraw = () => {
    if (!withdrawAmount) {
      alert('Por favor, selecione um valor para saque.');
      return;
    }
    
    // Ir para terceira página (página do IOF)
    setShowThirdPage(true);
  };

  const handleBackFromThirdPage = () => {
    setShowThirdPage(false);
  };

  // Se deve mostrar terceira página, renderizar ela
  if (showThirdPage && withdrawAmount) {
    return (
      <PixWithdrawalThirdPage 
        onBack={handleBackFromThirdPage}
        onFinish={onFinish}
        totalCredits={totalCredits}
        userName={userName}
        userEmail={userEmail}
        pixKey={pixKey}
        withdrawAmount={withdrawAmount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-white font-bold text-lg">Saque PIX</h1>
                <p className="text-white/80 text-sm">Escolha o valor</p>
              </div>
            </div>
            
            {/* Usuário logado */}
            <div className="bg-white/20 rounded-full px-3 py-2 flex items-center space-x-2">
              <div className="bg-white/20 rounded-full p-1.5">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-bold">
                {displayName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-sm mx-auto p-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Carteira de Saldo */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full p-2">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">Carteira Digital</span>
                </div>
                
                <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">S</span>
                </div>
              </div>

              <div className="text-white text-3xl font-bold mb-2">
                R$ {totalCredits.toFixed(2)}
              </div>
              
              <p className="text-gray-400 text-sm">
                Saldo disponível para saque
              </p>
            </div>
          </div>

          {/* Seção de Saque - ESPAÇAMENTO REDUZIDO */}
          <div className="p-6 pt-4">
            {/* Título com logo PIX - LOGO AINDA MAIOR */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Sacar dinheiro
              </h2>
              <img 
                src="https://images.seeklogo.com/logo-png/50/2/pix-banco-central-brasil-logo-png_seeklogo-500502.png" 
                alt="PIX" 
                className="w-20 h-20 object-contain ml-6"
              />
            </div>

            {/* Opções de valor - BOTÕES MENORES E VALOR TOTAL DINÂMICO - ESPAÇAMENTO REDUZIDO */}
            <div className="space-y-3 mb-4">
              {/* Primeira linha - R$100 e R$200 - BOTÕES MENORES */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWithdrawAmount(100)}
                  className={`py-3 px-3 rounded-lg text-base font-bold transition-colors border-2 ${
                    withdrawAmount === 100
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  R$100
                </button>
                
                <button
                  onClick={() => setWithdrawAmount(200)}
                  className={`py-3 px-3 rounded-lg text-base font-bold transition-colors border-2 ${
                    withdrawAmount === 200
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  R$200
                </button>
              </div>

              {/* Segunda linha - Valor total DINÂMICO baseado na carteira */}
              <button
                onClick={() => setWithdrawAmount(totalCredits)}
                className={`w-full py-3 px-3 rounded-lg text-lg font-bold transition-colors border-2 ${
                  withdrawAmount === totalCredits
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
                }`}
              >
                R${totalCredits.toFixed(2)}
              </button>
            </div>

            {/* Botão de Sacar Dinheiro */}
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-300 text-lg ${
                withdrawAmount
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Sacar Dinheiro
            </button>

            {/* Aviso sobre limites - MANTIDO COMO SOLICITADO */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-gray-600 text-sm leading-relaxed text-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Para sacar dinheiro, seu saldo deve estar acima de R$10,00. Os limites de saque para saques individuais e mensais podem variar conforme sua cidade e estado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};