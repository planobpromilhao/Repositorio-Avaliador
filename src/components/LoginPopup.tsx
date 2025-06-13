import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface LoginPopupProps {
  show: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: UserData) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  loginValue?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({ show, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 4; // ALTERADO: de 6 para 4 caracteres
  };

  const validateLoginField = (value: string) => {
    return value.trim().length > 0;
  };

  const isPhoneNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11 && /^\d+$/.test(cleaned);
  };

  const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const extractFirstName = (fullName: string): string => {
    if (!fullName) return '';
    const firstName = fullName.trim().split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const extractNameFromEmail = (email: string): string => {
    if (!isEmail(email)) return '';
    
    const localPart = email.split('@')[0];
    const cleanName = localPart.replace(/[0-9._-]/g, ' ').trim();
    
    if (cleanName) {
      const firstName = cleanName.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    
    const fallbackName = localPart.charAt(0).toUpperCase() + localPart.slice(1, 4).toLowerCase();
    return fallbackName;
  };

  const validateForm = () => {
    if (!isLogin) {
      // Validações para cadastro
      if (!formData.name.trim()) {
        setError('Nome é obrigatório');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length !== 11) {
        setError('Celular deve ter 11 dígitos');
        return false;
      }
      if (!validateEmail(formData.email)) {
        setError('E-mail inválido');
        return false;
      }
    } else {
      // Validações para login
      if (!validateLoginField(formData.email)) {
        setError('Campo de login é obrigatório');
        return false;
      }
    }

    if (!validatePassword(formData.password)) {
      setError('Senha deve ter pelo menos 4 caracteres'); // ALTERADO: de 6 para 4 caracteres
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        let userName = 'Usuário';
        let userEmail = 'usuario@exemplo.com';
        let userPhone = '';

        // Determinar o tipo de login e extrair nome apropriado
        const loginValue = formData.email.trim();

        if (isPhoneNumber(loginValue)) {
          // Login com telefone - usar nome padrão
          userName = 'Usuário';
          userPhone = loginValue;
          console.log('📞 Login com telefone - nome padrão');
        } else if (isEmail(loginValue)) {
          // Login com email - extrair nome do email
          userName = extractNameFromEmail(loginValue);
          userEmail = loginValue;
          console.log('📧 Login com email, nome extraído:', userName);
        } else {
          // Login com nome de usuário ou outro formato
          userName = extractFirstName(loginValue);
          console.log('👤 Login com nome de usuário:', userName);
        }

        const userData: UserData = {
          id: `user_${Date.now()}`,
          name: userName,
          email: userEmail,
          phone: userPhone,
          loginValue: loginValue,
          createdAt: new Date().toISOString()
        };

        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          onAuthSuccess(userData);
        }, 1000);
      } else {
        // Para cadastro, usar apenas o primeiro nome do nome completo digitado
        const firstName = extractFirstName(formData.name);
        
        const userData: UserData = {
          id: `user_${Date.now()}`,
          name: firstName, // Usar apenas o primeiro nome
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          loginValue: formData.name,
          createdAt: new Date().toISOString()
        };

        console.log('📝 Cadastro - usando primeiro nome:', firstName, 'do nome completo:', formData.name);

        setSuccess('Cadastro realizado com sucesso!');
        setTimeout(() => {
          onAuthSuccess(userData);
        }, 1000);
      }
    } catch (error) {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center">
      {/* Container Mobile-First - Posicionado abaixo do header mas não na parte inferior */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl mx-4 mt-20 mb-8 max-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center pt-2">
            <img 
              src="https://i.imgur.com/K0sHM7g.png" 
              alt="Shopee" 
              className="w-28 h-11 object-contain mx-auto mb-3"
            />
            <h2 className="text-white font-bold text-base">
              Sua melhor plataforma de compras online
            </h2>
            <p className="text-white/90 text-sm">
              {isLogin ? 'Entre agora e resgate seu saldo disponível!' : 'Cadastre-se e ganhe até R$ 659,77'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 text-center font-bold text-sm transition-all duration-300 ${
              isLogin 
                ? 'bg-white text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500'
            }`}
          >
            ENTRAR
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 text-center font-bold text-sm transition-all duration-300 ${
              !isLogin 
                ? 'bg-white text-orange-600 border-b-2 border-orange-500' 
                : 'text-gray-500'
            }`}
          >
            CADASTRAR
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mensagens de Status */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`${isLogin ? 'space-y-4' : 'space-y-3'}`}>
            {/* Nome (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="Nome completo"
                    required={!isLogin}
                  />
                </div>
                {formData.name && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nome de usuário será: <span className="font-medium text-orange-600">
                      {extractFirstName(formData.name)}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* E-mail/Login */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                <input
                  type={isLogin ? "text" : "email"}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder={isLogin ? "E-mail/Celular/Nome de usuário" : "E-mail"}
                  required
                />
              </div>
            </div>

            {/* Telefone (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                  <input
                    type="tel"
                    value={formatPhone(formData.phone)}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="Celular"
                    maxLength={15}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Senha */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder="Senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-bold text-base transition-all duration-300 transform active:scale-95 shadow-lg flex items-center justify-center space-x-2 ${
                isLogin ? 'mt-6' : 'mt-4'
              } ${
                loading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLogin ? 'ENTRANDO...' : 'CRIANDO CONTA...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'ENTRAR' : 'CRIAR CONTA'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Termos (apenas no cadastro) - Espaçamento reduzido e com espaço em branco abaixo */}
            {!isLogin && (
              <div className="mt-2 text-center mb-4">
                <p className="text-xs text-gray-500 leading-relaxed px-2">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <button className="text-orange-600 hover:text-orange-700 underline">
                    Termos de Uso
                  </button>{' '}
                  e{' '}
                  <button className="text-orange-600 hover:text-orange-700 underline">
                    Política de Privacidade
                  </button>
                </p>
              </div>
            )}
          </form>

          {/* Links Adicionais */}
          {isLogin && (
            <div className="text-center mt-4">
              <button className="text-orange-600 text-sm hover:text-orange-700">
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>

        {/* Footer com benefícios - Fonte aumentada */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-bold text-orange-600 text-base">R$ 659,77</div>
              <div className="text-xs">Prêmio Máximo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600 text-base">PIX</div>
              <div className="text-xs">Saque Rápido</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600 text-base">100%</div>
              <div className="text-xs">Seguro</div>
            </div>
          </div>
          
          {/* Nova mensagem de segurança e processamento */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="w-3 h-3 text-green-500" />
              <span>Dados protegidos • Processamento instantâneo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};