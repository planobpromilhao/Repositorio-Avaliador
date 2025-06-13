import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Star, Heart, ShoppingCart, Filter, Search, CheckCircle, Loader, Plus, Minus, X, CreditCard, MapPin, Truck, Wallet, AlertCircle } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { UpsellPage } from './UpsellPage';
import { type TransactionResponse } from '../services/pixapi';

interface ShopeeFlashSaleProps {
  onBack: () => void;
  totalCredits: number;
}

interface CartItem {
  id: number;
  quantity: number;
}

export const ShopeeFlashSale: React.FC<ShopeeFlashSaleProps> = ({ onBack, totalCredits }) => {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hora em segundos
  const [showLoadingPopup, setShowLoadingPopup] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  
  // Novos estados para o sistema de pagamento
  const [showUpsell, setShowUpsell] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string>('');

  // Popup de carregamento - alterado para 2,3s
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowLoadingPopup(false);
      setShowSuccessMessage(true);
      
      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 2300); // Alterado de 1500 para 2300 (2,3 segundos)

    return () => clearTimeout(loadingTimer);
  }, []);

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

  // Verificar se pode adicionar mais produtos (máximo 3 tipos diferentes)
  const canAddNewProduct = () => {
    const uniqueProducts = cart.length;
    return uniqueProducts < 3;
  };

  // Mostrar aviso de limite
  const showLimitAlert = () => {
    setShowLimitWarning(true);
    setTimeout(() => setShowLimitWarning(false), 3000);
  };

  // Calcular total do carrinho
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = flashSaleProducts.find(p => p.id === item.id);
      return total + (product ? product.flashPrice * item.quantity : 0);
    }, 0);
  };

  // Verificar se há saldo suficiente para adicionar um produto
  const canAffordProduct = (productId: number) => {
    const product = flashSaleProducts.find(p => p.id === productId);
    if (!product) return false;
    
    const currentCartTotal = getCartTotal();
    const newTotal = currentCartTotal + product.flashPrice;
    
    return newTotal <= totalCredits;
  };

  // Funções do carrinho
  const addToCart = (productId: number) => {
    const product = flashSaleProducts.find(p => p.id === productId);
    if (!product) return;

    // Verificar se há saldo suficiente
    if (!canAffordProduct(productId)) {
      alert(`Saldo insuficiente! Você tem R$ ${totalCredits.toFixed(2)} disponível e o carrinho ficaria com R$ ${(getCartTotal() + product.flashPrice).toFixed(2)}.`);
      return;
    }

    // Verificar se o produto já está no carrinho
    const existingItem = cart.find(item => item.id === productId);
    
    // Se é um produto novo e já temos 3 tipos diferentes, mostrar aviso
    if (!existingItem && !canAddNewProduct()) {
      showLimitAlert();
      return;
    }

    setCart(prev => {
      if (existingItem) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { id: productId, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.id !== productId);
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartQuantity = (productId: number) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartProducts = () => {
    return cart.map(item => {
      const product = flashSaleProducts.find(p => p.id === item.id);
      return { ...product, quantity: item.quantity };
    }).filter(Boolean);
  };

  // Função para lidar com pagamento bem-sucedido
  const handlePaymentSuccess = (transactionId: string) => {
    console.log('✅ Pagamento confirmado! Redirecionando para upsell...', transactionId);
    setCurrentTransactionId(transactionId);
    setShowCheckout(false);
    setShowUpsell(true);
    // Limpar carrinho após pagamento confirmado
    setCart([]);
  };

  // Função para lidar com pagamento pendente - REMOVIDA
  // A função handlePaymentPending foi removida pois não usamos mais a PaymentPendingPage

  const handleFinalizePurchase = () => {
    // Esta função não é mais usada diretamente
    // O fluxo agora é controlado pela função handlePaymentSuccess
    console.log('Compra finalizada através do novo sistema de verificação');
  };

  // Calcular saldo restante
  const getRemainingBalance = () => {
    return totalCredits - getCartTotal();
  };

  // Função para voltar da página de upsell
  const handleBackFromUpsell = () => {
    setShowUpsell(false);
    // Aqui você pode redirecionar para onde desejar após o upsell
    // Por exemplo, voltar para a página principal ou mostrar confirmação final
  };

  // Se está mostrando upsell, renderizar página de upsell
  if (showUpsell) {
    return (
      <UpsellPage 
        onBack={handleBackFromUpsell}
        transactionId={currentTransactionId}
        customerData={{
          name: 'Cliente', // Você pode passar dados reais do cliente aqui
          email: 'cliente@exemplo.com'
        }}
      />
    );
  }

  const flashSaleProducts = [
    {
      id: 1,
      name: "Smartphone Samsung Galaxy A54 PRETO",
      originalPrice: 899.90,
      flashPrice: 139.90,
      discount: 82,
      image: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=300",
      sold: 947,
      stock: 50,
      rating: 4.8,
      reviews: 2341
    },
    {
      id: 2,
      name: "Fone Bluetooth JBL Tune 510BT BRANCO",
      originalPrice: 199.90,
      flashPrice: 49.90,
      discount: 75,
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300",
      sold: 892,
      stock: 25,
      rating: 4.6,
      reviews: 1567
    },
    {
      id: 3,
      name: "Smart TV 32\" 4K Samsung PRETA",
      originalPrice: 799.90,
      flashPrice: 119.90,
      discount: 81,
      image: "/src/components/tv.jpg",
      sold: 456,
      stock: 15,
      rating: 4.7,
      reviews: 987
    },
    {
      id: 4,
      name: "Tablet Lenovo M9\" Tela 9 PRATA",
      originalPrice: 459.90,
      flashPrice: 81.49,
      discount: 80,
      image: "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=300&h=200",
      sold: 234,
      stock: 8,
      rating: 4.5,
      reviews: 654
    },
    {
      id: 5,
      name: "Air Fryer Mondial 4L PRETA",
      originalPrice: 302.90,
      flashPrice: 73.90,
      discount: 74,
      image: "/src/components/airfryer.jpg",
      sold: 876,
      stock: 35,
      rating: 4.9,
      reviews: 3421
    },
    {
      id: 6,
      name: "Massageador Elétrico Profissional",
      originalPrice: 199.90,
      flashPrice: 67.77,
      discount: 76,
      image: "/src/components/massageador.jpg",
      sold: 678,
      stock: 42,
      rating: 4.7,
      reviews: 1234
    },
    {
      id: 7,
      name: "Smartwatch Xiaomi Mi Band 7 PRETO",
      originalPrice: 299.90,
      flashPrice: 91.66,
      discount: 79,
      image: "https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=300",
      sold: 523,
      stock: 28,
      rating: 4.6,
      reviews: 2876
    },
    {
      id: 8,
      name: "Cafeteira Elétrica Mondial INOX",
      originalPrice: 189.90,
      flashPrice: 49.90,
      discount: 69,
      image: "/src/components/cafeteira.jpg",
      sold: 445,
      stock: 18,
      rating: 4.8,
      reviews: 987
    },
    // NOVOS PRODUTOS ADICIONADOS
    {
      id: 9,
      name: "Sanduicheira Grill Antiaderente 750W",
      originalPrice: 149.90,
      flashPrice: 32.90,
      discount: 71,
      image: "https://down-br.img.susercontent.com/file/sg-11134201-7ratn-mabbh4bbhm5j26.webp",
      sold: 264,
      stock: 67,
      rating: 4.5,
      reviews: 1876
    },
    {
      id: 10,
      name: "Mini Máquina De Costura Portátil Com Pedal",
      originalPrice: 199.90,
      flashPrice: 61.73,
      discount: 65,
      image: "https://down-br.img.susercontent.com/file/sg-11134201-7rd5z-m7d2ttqvyvaue5.webp",
      sold: 789,
      stock: 23,
      rating: 4.7,
      reviews: 2134
    },
    {
      id: 11,
      name: "Mouse Gamer RGB Sem Fio PRETO",
      originalPrice: 179.90,
      flashPrice: 54.90,
      discount: 69,
      image: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=300",
      sold: 567,
      stock: 34,
      rating: 4.6,
      reviews: 1543
    },
    {
      id: 12,
      name: "Jogo de Panelas Antiaderente Teflon 10 Peças",
      originalPrice: 289.90,
      flashPrice: 74.70,
      discount: 83,
      image: "https://down-br.img.susercontent.com/file/br-11134207-7r98o-ly2cc3hdvzjz3f.webp",
      sold: 892,
      stock: 45,
      rating: 4.4,
      reviews: 987
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Popup de Carregamento */}
      {showLoadingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 text-center max-w-xs w-full mx-4 shadow-2xl">
            <div className="mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Aplicando Cupom
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Estamos aplicando seu cupom de desconto no valor de <span className="font-bold text-orange-600">R$ {totalCredits.toFixed(2)}</span>
            </p>
            
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500">Aguarde um momento...</p>
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-green-500 text-white rounded-xl p-4 shadow-xl flex items-center space-x-3 max-w-sm mx-auto">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">Cupom aplicado!</p>
              <p className="text-xs opacity-90">Preços atualizados de acordo com o cupom de desconto</p>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de Limite de Produtos */}
      {showLimitWarning && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-red-500 text-white rounded-xl p-4 shadow-xl flex items-center space-x-3 max-w-sm mx-auto">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">Limite atingido!</p>
              <p className="text-xs opacity-90">Você pode selecionar no máximo 3 produtos diferentes</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <img 
                src="https://i.imgur.com/K0sHM7g.png" 
                alt="Shopee" 
                className="w-28 h-10 sm:w-32 sm:h-12 object-contain"
              />
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div className="bg-white/20 rounded-full px-3 py-2 sm:px-4 sm:py-2 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-white" />
                <span className="text-white text-sm sm:text-base font-bold">
                  R$ {getRemainingBalance().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cronômetro Reposicionado - Abaixo do Header */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            <span className="text-orange-500 font-bold text-xs sm:text-sm">OFERTAS RELÂMPAGO</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <span className="text-gray-600 text-xs sm:text-sm font-medium">TERMINA EM</span>
            </div>
            
            {/* Cronômetro com caixas pretas - Otimizado para mobile */}
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <div className="bg-black text-white px-1.5 py-1 rounded text-xs sm:text-sm font-bold min-w-[24px] sm:min-w-[32px] text-center">
                {Math.floor(timeLeft / 3600).toString().padStart(2, '0').charAt(0)}
              </div>
              <div className="bg-black text-white px-1.5 py-1 rounded text-xs sm:text-sm font-bold min-w-[24px] sm:min-w-[32px] text-center">
                {Math.floor(timeLeft / 3600).toString().padStart(2, '0').charAt(1)}
              </div>
              <span className="text-black font-bold text-xs sm:text-sm">:</span>
              <div className="bg-black text-white px-1.5 py-1 rounded text-xs sm:text-sm font-bold min-w-[24px] sm:min-w-[32px] text-center">
                {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0').charAt(0)}
              </div>
              <div className="bg-black text-white px-1.5 py-1 rounded text-xs sm:text-sm font-bold min-w-[24px] sm:min-w-[32px] text-center">
                {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0').charAt(1)}
              </div>
              <span className="text-black font-bold text-xs sm:text-sm">:</span>
              <div className="bg-black text-white px-1.5 py-1 rounded text-xs sm:text-sm font-bold min-w-[24px] sm:min-w-[32px] text-center">
                {(timeLeft % 60).toString().padStart(2, '0').charAt(0)}
              </div>
              <div className="bg-black text-white px-1.5 py-1 rounded text-xs sm:text-sm font-bold min-w-[24px] sm:min-w-[32px] text-center">
                {(timeLeft % 60).toString().padStart(2, '0').charAt(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 relative overflow-hidden">
        {/* Fundo com padrão de raios */}
        <div className="absolute inset-0">
          {/* Raios amarelos posicionados estrategicamente */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-12">
            <svg width="20" height="40" viewBox="0 0 20 40" className="text-yellow-400 fill-current">
              <path d="M10 0L15 15H5L10 0Z M5 15L10 40L15 15H5Z" />
            </svg>
          </div>
          <div className="absolute left-8 top-1/4 transform rotate-12">
            <svg width="12" height="24" viewBox="0 0 12 24" className="text-yellow-400 fill-current">
              <path d="M6 0L9 9H3L6 0Z M3 9L6 24L9 9H3Z" />
            </svg>
          </div>
          <div className="absolute left-12 top-3/4 transform -rotate-12">
            <svg width="8" height="16" viewBox="0 0 8 16" className="text-yellow-400 fill-current">
              <path d="M4 0L6 6H2L4 0Z M2 6L4 16L6 6H2Z" />
            </svg>
          </div>
          
          {/* Raios do lado direito */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-12">
            <svg width="20" height="40" viewBox="0 0 20 40" className="text-yellow-400 fill-current">
              <path d="M10 0L15 15H5L10 0Z M5 15L10 40L15 15H5Z" />
            </svg>
          </div>
          <div className="absolute right-8 top-1/4 transform -rotate-12">
            <svg width="12" height="24" viewBox="0 0 12 24" className="text-yellow-400 fill-current">
              <path d="M6 0L9 9H3L6 0Z M3 9L6 24L9 9H3Z" />
            </svg>
          </div>
          <div className="absolute right-12 top-3/4 transform rotate-12">
            <svg width="8" height="16" viewBox="0 0 8 16" className="text-yellow-400 fill-current">
              <path d="M4 0L6 6H2L4 0Z M2 6L4 16L6 6H2Z" />
            </svg>
          </div>
        </div>
        
        {/* Conteúdo principal do banner */}
        <div className="relative z-10 text-center py-6 sm:py-8 px-4">
          <h1 className="text-white font-black text-2xl sm:text-4xl md:text-5xl mb-1 tracking-wider leading-tight">
            OFERTAS RE<span className="inline-block mx-1 font-black">L</span>ÂMPAGO
          </h1>
          <p className="text-white font-bold text-lg sm:text-2xl md:text-3xl tracking-wide">
            TODOS OS DIAS
          </p>
        </div>
        
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
            <button className="flex items-center space-x-1 sm:space-x-2 bg-orange-100 text-orange-600 px-2 sm:px-3 py-2 rounded-full whitespace-nowrap">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Filtros</span>
            </button>
            <button className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap">
              Mais Vendidos
            </button>
            <button className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap">
              Menor Preço
            </button>
            <button className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap">
              Maior Desconto
            </button>
          </div>
        </div>
      </div>

      {/* Aviso de Limite de Produtos - Fixo no topo da lista */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-2 text-blue-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Máximo de 3 produtos diferentes por compra • {cart.length}/3 selecionados
            </span>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="max-w-7xl mx-auto p-3 pb-24">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {flashSaleProducts.map((product) => {
            const cartQuantity = getCartQuantity(product.id);
            const canAfford = canAffordProduct(product.id);
            const isInCart = cartQuantity > 0;
            const canAddNewType = canAddNewProduct() || isInCart;
            
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Imagem do produto */}
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-40 sm:h-44 object-cover"
                    style={{
                      objectPosition: product.id === 5 ? 'center center' : // Air Fryer
                                     product.id === 6 ? 'center center' : // Massageador
                                     product.id === 8 ? 'center center' : // Cafeteira
                                     product.id === 3 ? 'center center' : // TV
                                     'center center',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    -{product.discount}%
                  </div>
                  <button className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>
                  
                  {/* Badge de estoque baixo */}
                  {product.stock <= 10 && (
                    <div className="absolute bottom-2 left-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-lg text-xs font-bold">
                      Últimas {product.stock} unidades!
                    </div>
                  )}

                  {/* Badge de saldo insuficiente */}
                  {!canAfford && cartQuantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        Saldo Insuficiente
                      </div>
                    </div>
                  )}

                  {/* Badge de limite atingido */}
                  {!canAddNewType && cartQuantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold text-center">
                        Limite de 3 produtos atingido
                      </div>
                    </div>
                  )}
                </div>

                {/* Informações do produto */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  {/* Preços */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-600 font-bold text-lg">
                        R$ {product.flashPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  {/* Vendidos */}
                  <div className="mb-3">
                    <div className="bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((product.sold / (product.sold + product.stock)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {product.sold} vendidos | {product.stock} restantes
                    </span>
                  </div>

                  {/* Sistema de carrinho simplificado e simétrico */}
                  {cartQuantity === 0 ? (
                    <button 
                      onClick={() => addToCart(product.id)}
                      disabled={!canAfford || !canAddNewType}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 shadow-lg h-10 ${
                        canAfford && canAddNewType
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {!canAfford ? 'Sem Saldo' : 
                         !canAddNewType ? 'Limite 3' : 'Adicionar'}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2 border border-gray-200 h-10">
                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      
                      <div className="text-center">
                        <span className="font-bold text-gray-800 text-base">
                          {cartQuantity}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product.id)}
                        disabled={!canAfford}
                        className={`rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200 shadow-md ${
                          canAfford 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão carregar mais */}
        <div className="text-center mt-6">
          <button className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg">
            Carregar Mais Produtos
          </button>
        </div>
      </div>

      {/* Aba de Ver no Carrinho - Simplificada */}
      {getTotalCartItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto p-3">
            <div className="flex items-center justify-between">
              {/* Informações do carrinho */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                    {getTotalCartItems()}
                  </div>
                </div>
                
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    {cart.length} {cart.length === 1 ? 'tipo' : 'tipos'} • {getTotalCartItems()} {getTotalCartItems() === 1 ? 'item' : 'itens'}
                  </p>
                  <p className="text-orange-600 font-bold text-lg">
                    R$ {getCartTotal().toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Botão de finalizar menor */}
              <button 
                onClick={() => setShowCheckout(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg transform active:scale-95 flex items-center space-x-2"
              >
                <span>FINALIZAR PEDIDO</span>
                <div className="bg-white/20 rounded-full px-2 py-1">
                  <span className="text-xs font-bold">{getTotalCartItems()}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckout && (
        <CheckoutModal
          show={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartProducts={getCartProducts()}
          cartTotal={getCartTotal()}
          totalCredits={totalCredits}
          onFinalizePurchase={handleFinalizePurchase}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentPending={() => {}} // Função vazia pois não usamos mais
        />
      )}
    </div>
  );
};