import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Package, Truck, Mail, Clock, Star, Gift, Zap, Shield, Wallet, DollarSign, Coins } from 'lucide-react';
import { PixWithdrawalPage } from './PixWithdrawalPage';

interface UpsellPageProps {
  onBack: () => void;
  transactionId: string;
  customerData?: {
    name: string;
    email: string;
  };
}

export const UpsellPage: React.FC<UpsellPageProps> = ({ 
  onBack, 
  transactionId,
  customerData 
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [showWithdrawalPopup, setShowWithdrawalPopup] = useState(false);
  const [showPixWithdrawal, setShowPixWithdrawal] = useState(false);

  // Simulação de valores da carteira
  const totalCreditsOriginal = 659.77; // Saldo original da carteira
  const purchaseAmount = 139.90; // Valor simulado da compra realizada
  const remainingBalance = totalCreditsOriginal - purchaseAmount; // Saldo restante

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

  // Popup de saldo disponível após 6,5 segundos
  useEffect(() => {
    const popupTimer = setTimeout(() => {
      setShowWithdrawalPopup(true);
    }, 6500); // 6,5 segundos

    return () => clearTimeout(popupTimer);
  }, []);

  // Formatar tempo para MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWithdraw = () => {
    // Redirecionar para primeira página de saque PIX
    setShowPixWithdrawal(true);
  };

  const handleWithdrawFromPopup = () => {
    setShowWithdrawalPopup(false);
    // Redirecionar para primeira página de saque PIX
    setShowPixWithdrawal(true);
  };

  const handleBackFromPixWithdrawal = () => {
    setShowPixWithdrawal(false);
  };

  // Se está mostrando página de saque PIX, renderizar ela
  if (showPixWithdrawal) {
    return (
      <PixWithdrawalPage 
        onBack={handleBackFromPixWithdrawal}
        totalCredits={remainingBalance}
        userName={customerData?.name}
        userEmail={customerData?.email}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Popup de Saldo Disponível para Saque */}
      {showWithdrawalPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Header do popup - SEM BOTÃO X */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-white font-bold text-lg mb-1">
                  💰 Saldo Disponível!
                </h2>
                <p className="text-white/90 text-sm">
                  Você ainda tem saldo a retirar
                </p>
              </div>
            </div>

            {/* Conteúdo do popup */}
            <div className="p-4">
              {/* Valor disponível */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-6 h-6 text-green-600 animate-spin" />
                  <div className="text-3xl font-black text-green-600">
                    R$ {remainingBalance.toFixed(2)}
                  </div>
                  <Coins className="w-6 h-6 text-green-600 animate-spin" style={{ animationDirection: 'reverse' }} />
                </div>
                <p className="text-green-700 font-bold text-sm">
                   Saldo restante disponível 
                </p>
              </div>

              {/* Benefícios do saque - ATUALIZADOS */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">Transferência instantânea</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">Saque via PIX</span>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <button
                  onClick={handleWithdrawFromPopup}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform active:scale-95 shadow-lg flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>SACAR AGORA</span>
                </button>
                
                <button
                  onClick={() => setShowWithdrawalPopup(false)}
                  className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  Quero perder meu saldo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header LIGEIRAMENTE AUMENTADO - Otimizado para mobile */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-4">
          {/* Linha única - Tudo na mesma linha para mobile */}
          <div className="flex items-center justify-between">
            {/* Logo com botão voltar - Compacto */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button 
                onClick={onBack}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img 
                src="https://i.imgur.com/K0sHM7g.png" 
                alt="Shopee" 
                className="w-22 h-8 object-contain"
              />
            </div>
            
            {/* Carteira e Saque compactos */}
            <div className="flex items-center space-x-2">
              {/* Carteira compacta */}
              <div className="bg-white/20 rounded-lg px-2.5 py-2 flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5 text-white" />
                <div>
                  <div className="text-white text-sm font-bold leading-tight">
                    R$ {remainingBalance.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Botão de saque compacto */}
              <button
                onClick={handleWithdraw}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center space-x-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>SACAR</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Container principal mobile-first */}
      <div className="max-w-sm mx-auto p-3 py-4 sm:p-4 sm:py-6">
        {/* Status do Pedido - Estilo rastreamento Shopee */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
          {/* Header de confirmação - Sem mensagem de obrigado */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 sm:p-4 text-center">
            <div className="bg-white/20 rounded-full p-2 sm:p-3 w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
              🎉 Pagamento Confirmado!
            </h1>
            <p className="text-white/90 text-xs sm:text-sm">
              Seu pedido foi processado com sucesso
            </p>
          </div>

          {/* Status do rastreamento - Estilo Shopee com 6 etapas */}
          <div className="p-3 sm:p-4">
            <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-center text-sm sm:text-base">
              📦 Status do Pedido
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Etapa 1 - Confirmado */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-green-500 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-700 text-sm sm:text-base">Pagamento Confirmado</p>
                  <p className="text-xs sm:text-sm text-green-600">Processado com sucesso</p>
                </div>
                <span className="text-xs sm:text-sm text-green-600 font-medium">✓</span>
              </div>

              {/* Linha conectora */}
              <div className="ml-4 sm:ml-6 border-l-2 border-green-300 h-3 sm:h-4"></div>

              {/* Etapa 2 - Confirmado */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-green-500 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-700 text-sm sm:text-base">Pedido encaminhado para Separação</p>
                  <p className="text-xs sm:text-sm text-green-600">Em processamento</p>
                </div>
                <span className="text-xs sm:text-sm text-green-600 font-medium">✓</span>
              </div>

              {/* Linha conectora */}
              <div className="ml-4 sm:ml-6 border-l-2 border-gray-300 h-3 sm:h-4"></div>

              {/* Etapa 3 - Pendente */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gray-300 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-600 text-sm sm:text-base">Pedido encaminhado para transportadora</p>
                  <p className="text-xs sm:text-sm text-gray-500">Aguardando</p>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">⏳</span>
              </div>

              {/* Linha conectora */}
              <div className="ml-4 sm:ml-6 border-l-2 border-gray-300 h-3 sm:h-4"></div>

              {/* Etapa 4 - Pendente */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gray-300 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-600 text-sm sm:text-base">Pedido sendo encaminhado ao Destinatário</p>
                  <p className="text-xs sm:text-sm text-gray-500">Aguardando</p>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">⏳</span>
              </div>

              {/* Linha conectora */}
              <div className="ml-4 sm:ml-6 border-l-2 border-gray-300 h-3 sm:h-4"></div>

              {/* Etapa 5 - Pendente */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gray-300 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-600 text-sm sm:text-base">Pedido em rota de destino</p>
                  <p className="text-xs sm:text-sm text-gray-500">Aguardando</p>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">⏳</span>
              </div>

              {/* Linha conectora */}
              <div className="ml-4 sm:ml-6 border-l-2 border-gray-300 h-3 sm:h-4"></div>

              {/* Etapa 6 - Pendente */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gray-300 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-600 text-sm sm:text-base">Pedido entregue</p>
                  <p className="text-xs sm:text-sm text-gray-500">Aguardando</p>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">⏳</span>
              </div>
            </div>

            {/* Informação sobre rastreamento */}
            <div className="mt-4 sm:mt-6 bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-1 text-xs sm:text-sm">
                    📦 Pedido em separação
                  </h4>
                  <p className="text-orange-700 text-xs leading-relaxed">
                    Seu pedido está sendo preparado. Em até <strong>3 dias úteis</strong>, 
                    o código de rastreamento será enviado ao seu e-mail.
                  </p>
                  {customerData?.email && (
                    <p className="text-orange-600 text-xs mt-1 sm:mt-2">
                      📧 {customerData.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};