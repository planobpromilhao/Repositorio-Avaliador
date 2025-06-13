import React, { useState } from 'react';
import { ArrowLeft, Wallet, DollarSign, Shield, CheckCircle, AlertCircle, Loader, User } from 'lucide-react';
import { PixWithdrawalSecondPage } from './PixWithdrawalSecondPage';

interface PixWithdrawalPageProps {
  onBack: () => void;
  totalCredits: number;
  userName?: string;
  userEmail?: string;
}

export const PixWithdrawalPage: React.FC<PixWithdrawalPageProps> = ({
  onBack,
  totalCredits,
  userName = '',
  userEmail = ''
}) => {
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecondPage, setShowSecondPage] = useState(false);

  // Função para extrair e formatar o nome do usuário
  const getDisplayName = (name: string): string => {
    if (!name) return 'Usuário';
    
    // Se é um nome completo, extrair apenas o primeiro nome
    const firstName = name.trim().split(' ')[0];
    
    // Capitalizar primeira letra
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const displayName = userName ? getDisplayName(userName) : 'Usuário';

  const handleValidatePixKey = async () => {
    setError(null);
    
    // Remover validação automática - aceitar qualquer chave PIX digitada
    if (!pixKey.trim()) {
      setError('Por favor, digite sua chave PIX.');
      return;
    }

    setLoading(true);

    try {
      // Simular validação da chave PIX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ir para segunda página em vez de mostrar sucesso
      setShowSecondPage(true);
      
    } catch (error) {
      setError('Erro ao processar saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromSecondPage = () => {
    setShowSecondPage(false);
  };

  // Se deve mostrar segunda página, renderizar ela
  if (showSecondPage) {
    return (
      <PixWithdrawalSecondPage 
        onBack={handleBackFromSecondPage}
        onFinish={onBack}
        totalCredits={totalCredits}
        userName={userName}
        userEmail={userEmail}
        pixKey={pixKey}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header - SEM CARTEIRA, COM USUÁRIO */}
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
                <p className="text-white/80 text-sm">Retire seus créditos</p>
              </div>
            </div>
            
            {/* Usuário logado no lugar da carteira */}
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
        {/* Mensagens de erro */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

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

              <div className="border-t border-dashed border-gray-600 my-4"></div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-orange-400 text-sm font-bold leading-tight">
                  Retire seu saldo via PIX instantâneo
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Transferência segura e imediata
                </p>
              </div>
            </div>
          </div>

          {/* Formulário de Saque */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-orange-500" />
              Dados para Saque
            </h2>

            <div className="space-y-4">
              {/* Chave PIX - SEM BOTÃO DE COPIAR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX *
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder="Digite sua chave PIX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vamos validar sua chave Pix para a retirada do seu saldo.
                </p>
              </div>

              {/* Informações de Segurança */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1 text-sm">
                      🔒 Transferência Segura
                    </h4>
                    <ul className="text-blue-700 text-xs space-y-1">
                      <li>• Transferência instantânea via PIX</li>
                      <li>• Dados criptografados e protegidos</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botão de Validação */}
              <button
                onClick={handleValidatePixKey}
                disabled={loading || !pixKey.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                  loading || !pixKey.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform active:scale-95 shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>VALIDANDO PIX...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>VALIDAR PIX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};