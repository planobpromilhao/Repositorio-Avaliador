import React, { useState, useEffect } from 'react';
import { QuizState } from '../types/quiz';
import { quizQuestions } from '../data/quizData';
import { StartScreen } from './StartScreen';
import { QuizQuestion } from './QuizQuestion';
import { RewardPopup } from './RewardPopup';
import { ProgressBar } from './ProgressBar';
import { FinalScreen } from './FinalScreen';
import { Header } from './Header';
import { LoginPopup } from './LoginPopup';
import { UpsellPage } from './UpsellPage';

// Valores variados para cada pergunta que somam EXATAMENTE R$ 659,77
const questionRewards = [
  65.98,  // Pergunta 1
  58.45,  // Pergunta 2
  72.30,  // Pergunta 3
  61.90,  // Pergunta 4
  78.25,  // Pergunta 5
  54.60,  // Pergunta 6
  69.95,  // Pergunta 7
  57.85,  // Pergunta 8
  66.70,  // Pergunta 9
  73.79   // Pergunta 10
];
// Total: R$ 659,77

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  loginValue?: string; // Campo para armazenar o valor original do login
}

export const Quiz: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    totalCredits: 0,
    answers: {},
    isCompleted: false,
    showRewardPopup: false,
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // Estado para mostrar página de upsell diretamente (modo desenvolvedor)
  const [showUpsellDirect, setShowUpsellDirect] = useState(false);
  
  // NOVO: Estado para mostrar FinalScreen diretamente (modo desenvolvedor)
  const [showFinalScreenDirect, setShowFinalScreenDirect] = useState(false);

  const handleStart = () => {
    setHasStarted(true);
    // Mostrar popup de login na primeira pergunta
    setShowLoginPopup(true);
  };

  const handleAuthSuccess = (userData: UserData) => {
    setUser(userData);
    setShowLoginPopup(false);
    // Iniciar o quiz após login
    setTimeout(() => setShowQuestion(true), 300);
    console.log('✅ Usuário autenticado:', userData);
  };

  const handleAnswer = (answerId: string) => {
    const currentQ = quizState.currentQuestion;
    const rewardAmount = questionRewards[currentQ];
    
    // Salvar resposta
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQ]: answerId }
    }));

    // Mostrar popup de recompensa com valor específico da pergunta
    setQuizState(prev => ({
      ...prev,
      showRewardPopup: true,
      totalCredits: prev.totalCredits + rewardAmount
    }));
  };

  const handleRewardClose = () => {
    setQuizState(prev => ({
      ...prev,
      showRewardPopup: false
    }));

    // Avançar para próxima pergunta ou finalizar
    setTimeout(() => {
      if (quizState.currentQuestion + 1 >= quizQuestions.length) {
        setQuizState(prev => ({ ...prev, isCompleted: true }));
      } else {
        setShowQuestion(false);
        setTimeout(() => {
          setQuizState(prev => ({
            ...prev,
            currentQuestion: prev.currentQuestion + 1
          }));
          setShowQuestion(true);
        }, 300);
      }
    }, 300);
  };

  // Função para ativar modo desenvolvedor - ir direto para upsell
  const handleDeveloperModeUpsell = () => {
    // Simular usuário logado para o upsell
    const mockUser: UserData = {
      id: 'dev_user_upsell',
      name: 'Dev Teste',
      email: 'dev@teste.com',
      createdAt: new Date().toISOString()
    };
    
    setUser(mockUser);
    setShowUpsellDirect(true);
    console.log('🔧 Modo desenvolvedor: Acesso direto à página de upsell ativado');
  };

  // NOVA: Função para ativar modo desenvolvedor - ir direto para FinalScreen
  const handleDeveloperModeFinalScreen = () => {
    // Simular usuário logado e quiz completo para a FinalScreen
    const mockUser: UserData = {
      id: 'dev_user_final',
      name: 'Dev Teste',
      email: 'dev@teste.com',
      createdAt: new Date().toISOString()
    };
    
    setUser(mockUser);
    setQuizState(prev => ({
      ...prev,
      totalCredits: 659.77, // Valor máximo
      isCompleted: true
    }));
    setShowFinalScreenDirect(true);
    console.log('🔧 Modo desenvolvedor: Acesso direto à FinalScreen ativado');
  };

  // Função para voltar do upsell direto
  const handleBackFromUpsellDirect = () => {
    setShowUpsellDirect(false);
    // Voltar para tela inicial
    setHasStarted(false);
    setUser(null);
  };

  // NOVA: Função para voltar da FinalScreen direta
  const handleBackFromFinalScreenDirect = () => {
    setShowFinalScreenDirect(false);
    // Voltar para tela inicial
    setHasStarted(false);
    setUser(null);
    setQuizState({
      currentQuestion: 0,
      totalCredits: 0,
      answers: {},
      isCompleted: false,
      showRewardPopup: false,
    });
  };

  // Se está mostrando upsell direto, renderizar página de upsell
  if (showUpsellDirect && user) {
    return (
      <UpsellPage 
        onBack={handleBackFromUpsellDirect}
        transactionId="dev_transaction_123"
        customerData={{
          name: user.name,
          email: user.email
        }}
      />
    );
  }

  // NOVO: Se está mostrando FinalScreen direto, renderizar FinalScreen
  if (showFinalScreenDirect && user) {
    return (
      <FinalScreen 
        totalCredits={quizState.totalCredits} 
        userName={user.name}
        userEmail={user.email}
      />
    );
  }

  // Se não iniciou o quiz, mostrar tela inicial
  if (!hasStarted) {
    return (
      <div className="relative">
        <StartScreen onStart={handleStart} />
        
        {/* Botões Modo Desenvolvedor - Fixos no canto inferior direito */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          <button
            onClick={handleDeveloperModeUpsell}
            className="block bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-bold transition-all duration-300 transform hover:scale-105 border-2 border-purple-400"
            title="Modo Desenvolvedor - Ir direto para Upsell"
          >
            🔧 DEV: UPSELL
          </button>
          
          <button
            onClick={handleDeveloperModeFinalScreen}
            className="block bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-bold transition-all duration-300 transform hover:scale-105 border-2 border-green-400"
            title="Modo Desenvolvedor - Ir direto para FinalScreen"
          >
            🔧 DEV: FINAL
          </button>
        </div>
      </div>
    );
  }

  // Se completou o quiz, mostrar tela final
  if (quizState.isCompleted) {
    return (
      <FinalScreen 
        totalCredits={quizState.totalCredits} 
        userName={user?.name}
        userEmail={user?.email}
      />
    );
  }

  const currentQuestion = quizQuestions[quizState.currentQuestion];
  const currentReward = questionRewards[quizState.currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
      <Header 
        userName={user?.name} 
        isLoginPopupOpen={showLoginPopup}
      />
      
      {/* Container otimizado para mobile */}
      <div className="py-4 px-3">
        <div className="max-w-sm mx-auto">
          {/* Só mostrar progresso e pergunta se usuário estiver logado */}
          {user && (
            <>
              <ProgressBar
                currentQuestion={quizState.currentQuestion + 1}
                totalQuestions={quizQuestions.length}
                totalCredits={quizState.totalCredits}
              />

              <QuizQuestion
                question={currentQuestion}
                onAnswer={handleAnswer}
                animate={showQuestion}
                rewardAmount={currentReward}
              />

              <RewardPopup
                show={quizState.showRewardPopup}
                amount={currentReward}
                totalCredits={quizState.totalCredits}
                onClose={handleRewardClose}
              />
            </>
          )}
        </div>
      </div>

      {/* Popup de Login */}
      <LoginPopup
        show={showLoginPopup}
        onClose={() => {
          setShowLoginPopup(false);
          setHasStarted(false); // Voltar para tela inicial se fechar o popup
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};