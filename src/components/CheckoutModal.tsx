import React, { useState, useEffect } from 'react';
import { X, User, Mail, CreditCard, MapPin, Truck, ArrowRight, ArrowLeft, CheckCircle, Loader, Search, Copy, QrCode, Clock } from 'lucide-react';
import { pixApiService, type TransactionRequest, type TransactionResponse } from '../services/pixapi';

interface CheckoutModalProps {
  show: boolean;
  onClose: () => void;
  cartProducts: any[];
  cartTotal: number;
  totalCredits: number;
  onFinalizePurchase: () => void;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentPending: (transactionData: TransactionResponse) => void;
}

interface FormData {
  name: string;
  email: string;
  cpf: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  show,
  onClose,
  cartProducts,
  cartTotal,
  totalCredits,
  onFinalizePurchase,
  onPaymentSuccess,
  onPaymentPending
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cpf: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [pixData, setPixData] = useState<TransactionResponse | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
  const [showPaymentPendingPopup, setShowPaymentPendingPopup] = useState(false);

  // VALOR ATUALIZADO DO FRETE PARA TESTES - R$ 5,00
  const shippingCost = 23.64;
  
  // Calcular valores conforme solicitado:
  const discountFromWallet = cartTotal;
  const remainingWalletBalance = totalCredits - discountFromWallet;
  const totalToPay = shippingCost;

  // Timer para expiração do PIX
  useEffect(() => {
    if (pixData && timeLeft > 0) {
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
    }
  }, [pixData, timeLeft]);

  // Sistema de verificação automática de pagamento
  useEffect(() => {
    if (pixData && !paymentConfirmed && !checkingPayment) {
      const checkInterval = setInterval(async () => {
        try {
          setCheckingPayment(true);
          console.log('🔍 Verificando status do pagamento automaticamente...');
          
          const paymentDetails = await pixApiService.getPaymentDetails(pixData.id);
          
          console.log('📊 Status atual do pagamento:', {
            id: paymentDetails.id,
            status: paymentDetails.status,
            amount: paymentDetails.amount
          });
          
          // Verificar se o pagamento foi aprovado
          if (paymentDetails.status === 'APPROVED' || paymentDetails.status === 'PAID') {
            console.log('✅ Pagamento confirmado automaticamente! Redirecionando para upsell...');
            setPaymentConfirmed(true);
            clearInterval(checkInterval);
            
            // Redirecionar automaticamente para página de upsell
            setTimeout(() => {
              onPaymentSuccess(pixData.id);
            }, 1000);
          }
        } catch (error) {
          console.error('❌ Erro ao verificar status do pagamento:', error);
        } finally {
          setCheckingPayment(false);
        }
      }, 10000); // Verificar a cada 10 segundos

      return () => clearInterval(checkInterval);
    }
  }, [pixData, paymentConfirmed, checkingPayment, onPaymentSuccess]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para simplificar nomes dos produtos
  const simplifyProductName = (name: string): string => {
    const wordsToRemove = ['PRETO', 'BRANCO', 'PRATA', 'INOX', 'Elétrica', 'Elétrico', 'Antiaderente', 'Profissional', 'Portátil', 'Com Pedal', 'Sem Fio', 'RGB', 'Teflon', '10 Peças'];
    
    let simplified = name;
    
    wordsToRemove.forEach(word => {
      simplified = simplified.replace(new RegExp(word, 'gi'), '').trim();
    });
    
    simplified = simplified.replace(/\s+/g, ' ').trim();
    
    const words = simplified.split(' ');
    if (words.length > 3) {
      simplified = words.slice(0, 3).join(' ');
    }
    
    // Casos específicos para produtos conhecidos
    if (name.includes('Smartphone')) simplified = 'Smartphone Samsung';
    if (name.includes('Fone Bluetooth')) simplified = 'Fone JBL';
    if (name.includes('Smart TV')) simplified = 'Smart TV 32"';
    if (name.includes('Tablet')) simplified = 'Tablet Lenovo';
    if (name.includes('Air Fryer')) simplified = 'Air Fryer';
    if (name.includes('Massageador')) simplified = 'Massageador';
    if (name.includes('Smartwatch')) simplified = 'Smartwatch Xiaomi';
    if (name.includes('Cafeteira')) simplified = 'Cafeteira';
    if (name.includes('Sanduicheira')) simplified = 'Sanduicheira Grill';
    if (name.includes('Máquina De Costura')) simplified = 'Máquina Costura';
    if (name.includes('Mouse Gamer')) simplified = 'Mouse Gamer';
    if (name.includes('Jogo de Panelas')) simplified = 'Jogo Panelas';
    
    return simplified;
  };

  // Buscar endereço por CEP
  const searchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }));
      } else {
        alert('CEP não encontrado. Verifique e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Gerar PIX usando a API real
  const generatePixPayment = async () => {
    setLoadingPix(true);
    setPaymentError(null);
    
    try {
      // Validar dados obrigatórios
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!formData.email.trim()) {
        throw new Error('E-mail é obrigatório');
      }
      if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length !== 11) {
        throw new Error('CPF inválido');
      }

      // Preparar descrição detalhada do pedido
      const itemsDescription = cartProducts.map(item => 
        `${item.quantity}x ${simplifyProductName(item.name)}`
      ).join(', ');
      
      const description = `Shopee Frete - ${cartProducts.length} ${cartProducts.length === 1 ? 'item' : 'itens'}: ${itemsDescription}`;

      // Preparar itens para a API (apenas o frete)
      const apiItems = [
        {
          unitPrice: Math.round(totalToPay * 100),
          title: `Frete SEDEX - ${cartProducts.length} ${cartProducts.length === 1 ? 'item' : 'itens'}`,
          quantity: 1,
          tangible: true
        }
      ];

      // Criar requisição PIX com dados do cliente
      const pixRequest: TransactionRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: '16999999999',
        paymentMethod: "PIX",
        amount: Math.round(totalToPay * 100),
        traceable: true,
        items: apiItems,
        cep: formData.zipCode.replace(/\D/g, ''),
        complement: '',
        number: formData.number.trim(),
        street: formData.address.trim(),
        district: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        externalId: `shopee_frete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('🛒 Gerando PIX para frete do pedido:', {
        valor_produtos: `R$ ${cartTotal.toFixed(2)} (descontado da carteira)`,
        valor_frete: `R$ ${shippingCost.toFixed(2)} (a pagar via PIX)`,
        saldo_carteira_antes: `R$ ${totalCredits.toFixed(2)}`,
        saldo_carteira_depois: `R$ ${remainingWalletBalance.toFixed(2)}`,
        quantidade_itens: cartProducts.reduce((sum, item) => sum + item.quantity, 0),
        cliente: formData.name,
        email: formData.email,
        cpf: formData.cpf
      });

      const pixResponse = await pixApiService.createPixTransaction(pixRequest);
      setPixData(pixResponse);
      
      // Calcular tempo restante até expiração
      const expiresAt = new Date(pixResponse.expiresAt).getTime();
      const now = Date.now();
      const timeLeftSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(timeLeftSeconds);

      console.log('✅ PIX gerado com sucesso via API:', {
        id: pixResponse.id,
        valor: `R$ ${(pixResponse.amount / 100).toFixed(2)}`,
        status: pixResponse.status,
        expira_em: `${Math.floor(timeLeftSeconds / 60)} minutos`,
        pixCode: pixResponse.pixCode ? 'Gerado' : 'Não disponível',
        pixQrCode: pixResponse.pixQrCode ? 'Gerado' : 'Não disponível'
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar PIX via API:', error);
      setPaymentError(error instanceof Error ? error.message : 'Erro ao gerar PIX');
    } finally {
      setLoadingPix(false);
    }
  };

  const isStep1Valid = () => {
    return formData.name.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.cpf.replace(/\D/g, '').length === 11;
  };

  const isStep2Valid = () => {
    return formData.address.trim() !== '' && 
           formData.number.trim() !== '' && 
           formData.neighborhood.trim() !== '' && 
           formData.city.trim() !== '' && 
           formData.state.trim() !== '' && 
           formData.zipCode.replace(/\D/g, '').length === 8;
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid()) {
      setCurrentStep(3);
      generatePixPayment();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Nova função para lidar com confirmação de pagamento
  const handleConfirmPayment = async () => {
    if (!pixData) return;

    setCheckingPayment(true);
    
    try {
      console.log('🔍 Verificando status do pagamento manualmente...');
      
      // Verificar status atual do pagamento
      const paymentDetails = await pixApiService.getPaymentDetails(pixData.id);
      
      console.log('📊 Status do pagamento verificado:', {
        id: paymentDetails.id,
        status: paymentDetails.status,
        amount: paymentDetails.amount
      });
      
      if (paymentDetails.status === 'APPROVED' || paymentDetails.status === 'PAID') {
        // Pagamento confirmado - redirecionar para upsell
        console.log('✅ Pagamento confirmado! Redirecionando para upsell...');
        setPaymentConfirmed(true);
        
        setTimeout(() => {
          onPaymentSuccess(pixData.id);
        }, 1000);
      } else {
        // Pagamento ainda pendente - mostrar popup
        console.log('⏳ Pagamento ainda pendente. Mostrando popup...');
        setShowPaymentPendingPopup(true);
        
        // Esconder popup após 3 segundos
        setTimeout(() => {
          setShowPaymentPendingPopup(false);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', error);
      setPaymentError('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50">
      {/* Popup de confirmação de cópia */}
      {showCopyConfirmation && (
        <div className="fixed top-4 left-4 right-4 z-60">
          <div className="bg-green-500 text-white rounded-xl p-3 shadow-xl flex items-center space-x-2 max-w-xs mx-auto">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Código PIX copiado!</span>
          </div>
        </div>
      )}

      {/* Popup de Pagamento Pendente */}
      {showPaymentPendingPopup && (
        <div className="fixed top-4 left-4 right-4 z-60">
          <div className="bg-yellow-500 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Pagamento Pendente</p>
                <p className="text-xs opacity-90">
                  O pagamento ainda não foi confirmado. Verifique se o PIX foi realizado corretamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Container principal otimizado para mobile */}
      <div className="h-full w-full bg-white flex flex-col">
        {/* Header fixo */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold text-lg">Finalizar Compra</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-1 ${
                    step < currentStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 max-w-xs mx-auto">
            <span>Dados</span>
            <span>Endereço</span>
            <span>Pagamento</span>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-24">
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-500" />
                  Dados Pessoais
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                  Endereço de Entrega
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatZipCode(formData.zipCode)}
                      onChange={(e) => {
                        const newCep = e.target.value.replace(/\D/g, '');
                        handleInputChange('zipCode', newCep);
                        if (newCep.length === 8) {
                          searchAddressByCep(newCep);
                        }
                      }}
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {loadingCep && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Digite o CEP para preenchimento automático
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder="Sua cidade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    >
                      <option value="">UF</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                </div>

                {/* Opção de Frete */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-orange-500" />
                    Opção de Frete
                  </h4>
                  
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          name="shipping" 
                          defaultChecked 
                          className="text-blue-500" 
                        />
                        <div>
                          <span className="font-medium text-blue-700">Frete SEDEX</span>
                          <p className="text-xs text-blue-600">Entrega em 3-5 dias úteis</p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-700">R$ {shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-blue-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Rastreamento incluído</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pagamento PIX */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                  Pagamento PIX
                </h3>

                {paymentConfirmed ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="text-lg font-bold text-green-700 mb-2">
                      Pagamento Confirmado!
                    </h4>
                    <p className="text-green-600 text-sm">
                      Redirecionando para próxima etapa...
                    </p>
                  </div>
                ) : loadingPix ? (
                  <div className="text-center py-8">
                    <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      Gerando PIX...
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Processando pagamento para {formData.name}
                    </p>
                  </div>
                ) : paymentError ? (
                  <div className="text-center py-8">
                    <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-bold text-red-700 mb-2">
                      Erro ao Gerar PIX
                    </h4>
                    <p className="text-red-600 text-sm mb-4">
                      {paymentError}
                    </p>
                    <button
                      onClick={generatePixPayment}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : pixData ? (
                  <div className="space-y-4">
                    {/* Timer de expiração */}
                    {timeLeft > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-red-700 font-bold text-lg">
                          ⏰ {formatTime(timeLeft)}
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                          Tempo restante para pagamento
                        </p>
                      </div>
                    )}

                    {/* Resumo do pedido - SIMPLIFICADO */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">Resumo do Pedido</h4>
                      <div className="space-y-1 text-sm">
                        {cartProducts.map((product, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{product.quantity}x {simplifyProductName(product.name)}</span>
                            <span className="line-through text-gray-400">R$ {(product.flashPrice * product.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-1 mt-2">
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>Subtotal (Descontado da Carteira)</span>
                            <span>-R$ {cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Frete SEDEX</span>
                            <span>R$ {shippingCost.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-1 mt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total a Pagar</span>
                              <span className="text-orange-600">R$ {totalToPay.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>Saldo Restante na Carteira</span>
                              <span>R$ {remainingWalletBalance.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code PIX */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {pixData.pixQrCode ? (
                        <div className="mb-3">
                          <img 
                            src={pixData.pixQrCode} 
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-4 mb-3">
                          <div className="w-32 h-32 bg-black mx-auto rounded-lg flex items-center justify-center">
                            <QrCode className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        Escaneie o QR Code com seu app do banco
                      </p>
                      <p className="text-xs text-gray-500">
                        Ou copie o código PIX abaixo
                      </p>
                    </div>

                    {/* Código PIX */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código PIX (Copia e Cola)
                        </label>
                        <div className="space-y-2">
                          <textarea
                            value={pixData.pixCode || 'Código PIX não disponível'}
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-xs h-20 resize-none"
                          />
                          {pixData.pixCode && (
                            <button
                              onClick={() => copyToClipboard(pixData.pixCode!, 'Código PIX')}
                              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copiar Código PIX</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instruções */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h5 className="font-medium text-yellow-800 mb-2">Como pagar:</h5>
                      <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. Abra o app do seu banco</li>
                        <li>2. Escolha a opção PIX</li>
                        <li>3. Escaneie o QR Code ou cole o código</li>
                        <li>4. Confirme o pagamento de R$ {totalToPay.toFixed(2)}</li>
                      </ol>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Footer fixo com botões - TAMANHO AUMENTADO */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="flex space-x-3">
            {currentStep > 1 && !paymentConfirmed && (
              <button 
                onClick={handleBack}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                onClick={handleNext}
                disabled={currentStep === 1 ? !isStep1Valid() : !isStep2Valid()}
                className={`flex-2 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 text-sm ${
                  (currentStep === 1 ? isStep1Valid() : isStep2Valid())
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : pixData && !paymentConfirmed && !paymentError ? (
              <button 
                onClick={handleConfirmPayment}
                disabled={checkingPayment}
                className={`flex-2 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 text-sm ${
                  checkingPayment 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                }`}
              >
                {checkingPayment ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>VERIFICANDO...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>CONFIRMAR PAGAMENTO</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
          
          {!paymentConfirmed && (
            <p className="text-center text-xs text-gray-500 mt-2">
              CNPJ/MF: 35.635.824/0001-12. - © 2025 Shopee.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};